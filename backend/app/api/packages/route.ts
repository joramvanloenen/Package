import { env } from 'cloudflare:workers';
import { validatePackage, verifyProof } from '../../../lib/package-validation';
export const dynamic = 'force-dynamic';
const allowedOrigin='https://joramvanloenen.github.io';
const cors={'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
function response(data:unknown,status=200){return Response.json(data,{status,headers:cors});}
export async function OPTIONS(){return new Response(null,{status:204,headers:cors});}
export async function GET(req:Request){
 try{
 const u=new URL(req.url);
 if(u.searchParams.has('id')){
 const id=u.searchParams.get('id')!;if(!/^[a-z0-9-]{10,50}$/.test(id))return response({error:'Invalid parcel link.'},400);
 const item=await env.DB!.prepare('SELECT id,x,y,level,title,sender,recipient,message,color,photo,caption,decorations,created FROM parcels WHERE id=?').bind(id).first<any>();
 if(!item)return response({error:'That package could not be found.'},404);
 return response({package:{...item,decorations:JSON.parse(item.decorations)}});
 }
 const clamp=(name:string,fallback:number,max:number)=>Math.max(0,Math.min(max,Math.floor(Number(u.searchParams.get(name)??fallback)||0)));
 const x=clamp('x',0,239),y=clamp('y',0,239),w=Math.min(60,Math.max(1,clamp('w',30,60))),h=Math.min(60,Math.max(1,clamp('h',30,60))),level=clamp('level',0,3);
 const result=await env.DB!.prepare('SELECT id,x,y,level,title,sender,recipient,color,created FROM parcels WHERE level=? AND x>=? AND x<? AND y>=? AND y<? ORDER BY created DESC LIMIT 3600').bind(level,x,x+w,y,y+h).all();
 const count=await env.DB!.prepare('SELECT COUNT(*) AS total FROM parcels').first();
 return response({packages:result.results,total:count?.total??0});
 }catch{return response({error:'The warehouse is temporarily unavailable. Please try again.'},503);}
}
export async function POST(req:Request){
 if(req.headers.get('origin')!==allowedOrigin)return response({error:'Please send packages from the Package website.'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return response({error:'JSON required.'},415);
 if(Number(req.headers.get('content-length')||0)>18000)return response({error:'Package too large.'},413);
 try{
 const raw=await req.text();if(raw.length>18000)return response({error:'Package too large.'},413);
 const input=JSON.parse(raw);const p=validatePackage(input.package);
 if(!p)return response({error:'Check the label, image, and warehouse position.'},400);
 if(!await verifyProof(input.package,input.proof))return response({error:'The postage check expired. Please try again.'},400);
 const address=req.headers.get('cf-connecting-ip')||'anonymous';
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address+'package-warehouse-v1'));
 const ipHash=Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const id=crypto.randomUUID(),now=Date.now();
 // One atomic INSERT enforces the rolling write limit even for simultaneous requests.
 const result=await env.DB!.prepare(`INSERT INTO parcels(id,x,y,level,title,sender,recipient,message,color,photo,caption,decorations,created,ip_hash) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM parcels WHERE ip_hash=? AND created>?)<12`).bind(id,p.x,p.y,p.level,p.title,p.sender,p.recipient,p.message,p.color,p.photo,p.caption,JSON.stringify(p.decorations),now,ipHash,ipHash,now-3600000).run();
 if(!result.meta.changes)return response({error:'The postage desk allows 12 packages per hour. Come back shortly.'},429);
 return response({package:{...p,id,created:now}},201);
 }catch(e:any){
 if(String(e?.message).includes('UNIQUE constraint'))return response({error:'Someone just placed a package here. Choose another spot.'},409);
 if(e instanceof SyntaxError)return response({error:'Invalid package.'},400);
 return response({error:'Could not store this package. Your draft is safe; please try again.'},503);
 }
}
