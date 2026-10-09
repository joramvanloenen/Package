export const COLORS=['#bb834e','#ad6654','#788b70','#d7ba75','#658991','#80748d'];
export function validatePackage(p:any){
 if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!Number.isInteger(p.level)||p.x<0||p.x>239||p.y<0||p.y>239||p.level<0||p.level>3||p.x%6===5||p.y%8===7)return null;
 for(const [key,max] of [['title',60],['sender',40],['recipient',40],['message',1400],['caption',60]] as const){if(typeof p[key]!=='string'||p[key].length>max)return null;}
 if(!p.title.trim()||!COLORS.includes(p.color)||!(p.photo===null||typeof p.photo==='string'&&/^[0-9a-f]{4096}$/.test(p.photo)))return null;
 if(!Array.isArray(p.decorations)||p.decorations.length>16)return null;
 const decorations=[];
 for(const d of p.decorations){
 if(!d||!['stamp','sticker','text','drawing'].includes(d.type)||!Number.isFinite(d.x)||!Number.isFinite(d.y)||d.x<0||d.x>360||d.y<0||d.y>220||!Number.isFinite(d.rotation)||Math.abs(d.rotation)>180||typeof d.text!=='string'||d.text.length>32||!['#27261f','#bc493b','#456553','#385a78'].includes(d.color))return null;
 if(d.type==='drawing'&&(typeof d.bitmap!=='string'||!/^[0-9a-f]{256}$/.test(d.bitmap)))return null;
 decorations.push({type:d.type,x:d.x,y:d.y,rotation:d.rotation,text:d.text,color:d.color,...(d.type==='drawing'?{bitmap:d.bitmap}:{})});
 }
 return {x:p.x,y:p.y,level:p.level,title:p.title.trim(),sender:p.sender.trim(),recipient:p.recipient.trim(),message:p.message,color:p.color,photo:p.photo,caption:p.caption,decorations};
}
export async function verifyProof(p:unknown,proof:any){
 if(!proof||!Number.isSafeInteger(proof.nonce)||proof.nonce<0||proof.nonce>10000000||!Number.isSafeInteger(proof.time)||Math.abs(Date.now()-proof.time)>300000)return false;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(p)+'|'+proof.time+'|'+proof.nonce));
 const hash=new Uint8Array(bytes);return hash[0]===0&&hash[1]<16;
}
