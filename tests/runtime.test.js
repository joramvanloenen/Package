// DOM/canvas smoke test. This is not a browser layout or camera test.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('packing table initializes and supports draft, drawing, sticker, and placement flow',async()=>{
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
class Element{
 constructor(id=''){this.id=id;this.value='';this.hidden=false;this.style={};this.dataset={};this.children=[];this.handlers={};this.width=128;this.height=128;this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 addEventListener(e,f){(this.handlers[e]??=[]).push(f);}async fire(e,data={}){for(const f of this.handlers[e]||[])await f({preventDefault(){},target:this,...data});}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=nodes;}setAttribute(k,v){this[k]=v;}getBoundingClientRect(){return {left:0,top:0,right:800,bottom:500,width:800,height:500};}getContext(){return new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(()=>{})});}showModal(){this.open=true;}close(){this.open=false;}focus(){this.focused=true;}setPointerCapture(){}scrollIntoView(){}click(){return this.fire('click');}}
const nodes=new Map(ids.map(id=>[id,new Element(id)])),tabs=['wrap','message','photo','label'].map(name=>{const b=new Element();b.dataset.tab=name;return b;}),panels=['wrap','message','photo','label'].map(name=>{const b=new Element();b.dataset.panel=name;return b;});
for(const [id,v]of Object.entries({brush:'3',markText:'WITH LOVE',markColor:'#27261f',threshold:'128',level:'0',jumpX:'13',jumpY:'13'}))nodes.get(id).value=v;nodes.get('dither').checked=true;
globalThis.document={getElementById:id=>{assert.ok(nodes.has(id),`missing DOM node ${id}`);return nodes.get(id);},createElement:()=>new Element(),querySelectorAll:q=>q==='.color'?nodes.get('colors').children:q==='[data-tab]'?tabs:q==='[data-panel]'?panels:[],querySelector:()=>new Element(),addEventListener(){},hidden:false};
globalThis.innerWidth=1200;globalThis.devicePixelRatio=1;globalThis.ResizeObserver=class{observe(){}};globalThis.requestAnimationFrame=()=>{};globalThis.setInterval=()=>{};globalThis.localStorage={getItem:()=>null,setItem:(k,v)=>{JSON.parse(v);}};globalThis.location={search:'',href:'https://joramvanloenen.github.io/Package/',pathname:'/Package/'};globalThis.window={history:{replaceState(){}},addEventListener(){},prompt(){}};
let stored=null;globalThis.fetch=async(url,options)=>({ok:true,json:async()=>options?.method==='POST'?{package:stored={...JSON.parse(options.body).package,id:'a-public-parcel',created:Date.now()}}:{packages:[],total:0}});
await import('../app.js');
await nodes.get('createBtn').click();assert.equal(nodes.get('composer').open,true);
nodes.get('title').value='Test parcel';await nodes.get('title').fire('input');nodes.get('message').value='A little hello';await nodes.get('message').fire('input');
await nodes.get('addStamp').click();assert.match(nodes.get('selectedMark').textContent,/stamp/);
await nodes.get('pixelCanvas').fire('pointerdown',{clientX:100,clientY:100,pointerId:1});await nodes.get('pixelCanvas').fire('pointerup',{pointerId:1});assert.match(nodes.get('photoStatus').textContent,/Polaroid attached/);
await nodes.get('packageForm').fire('submit');assert.equal(nodes.get('placementBanner').hidden,false);
await nodes.get('jumpBtn').click();await nodes.get('goJump').click();await nodes.get('navPlace').click();assert.equal(nodes.get('placeCard').hidden,false);
await nodes.get('confirmPlace').click();assert.equal(stored.title,'Test parcel');assert.equal(stored.message,'A little hello');assert.equal(stored.photo.length,4096);assert.equal(stored.decorations.length,1);assert.equal(nodes.get('reader').open,true);assert.equal(nodes.get('placementBanner').hidden,true);
});
