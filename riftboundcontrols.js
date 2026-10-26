import {watchMatch,watchConnection,save,adjustScore,timer,getCard} from './riftbounddata.js';
export function connectControls({render,status,ready}){
 let state=null,online=false,allowed=false,problem='',pending=0;
 function refresh(){ready(allowed&&online);status(problem||(!allowed?'Connecting to Riftbound…':!online?'Reconnecting…':pending?'Saving…':'Connected · TCG Store Riftbound'),!!problem);}
 watchMatch(s=>{state=s;allowed=true;render(s);refresh();},error=>{allowed=false;problem=/permission/i.test(error.code||error.message||'')?'Riftbound setup needs to be enabled in Firebase. Ask the store administrator.':'Unable to connect. Check the internet connection.';refresh();});
 watchConnection(value=>{online=value;refresh();});
 async function perform(fn){if(!allowed||!online){refresh();return false;}pending++;problem='';refresh();try{await fn();problem='';return true;}catch(error){problem=error.message||'Could not save. Try again.';return false;}finally{pending--;refresh();}}
 return{get state(){return state;},get ready(){return allowed&&online;},change:patch=>perform(()=>save(patch)),score:(field,delta)=>perform(()=>adjustScore(field,delta)),timer:(action,minutes)=>perform(()=>timer(action,minutes))};
}
export function bindText(app,input,field,{debounce=true}={}){
 let timeout,pendingValue=null;
 function fallback(){return field==='round_name'?'Round 1':field.endsWith('_record')?'0-0-0':'Player '+field[6];}
 async function flush(){clearTimeout(timeout);if(!app.ready)return;const raw=input.value.trim();if(!raw&&document.activeElement===input&&!field.endsWith('_record'))return;const value=raw||fallback();if(pendingValue===value||app.state?.[field]===value){if(document.activeElement!==input)input.value=value;return;}pendingValue=value;try{const saved=await app.change({[field]:raw});if(saved&&document.activeElement!==input)input.value=app.state[field];}finally{if(pendingValue===value)pendingValue=null;}}
 if(debounce)input.addEventListener('input',()=>{clearTimeout(timeout);timeout=setTimeout(flush,450);});
 input.addEventListener('change',flush);input.addEventListener('blur',flush);
}
export function cardPicker({frame,container,back,onSelect}){
 let active=null,counter=0;
 function close(){active=null;container.classList.remove('open');frame.src='about:blank';}
 back.onclick=close;
 window.addEventListener('message',event=>{
  const data=event.data;if(!active||event.origin!==location.origin||event.source!==frame.contentWindow||data?.type!=='tcgstore:riftbound-card-selected'||data.request!==active.request||data.kind!==active.kind)return;
  if(data.code!==null&&active.kind!=='Regular'&&!getCard(data.code,active.kind))return;
  const selected={...active,code:data.code};close();onSelect(selected);
 });
 return{close,open(player,kind){if(![1,2].includes(player)||!['Legend','Battlefield','Regular'].includes(kind))return;const request=Date.now()+'-'+(++counter);active={player,kind,request};const url=new URL('./riftboundcardpicker.html',location.href);url.searchParams.set('kind',kind);url.searchParams.set('request',request);url.searchParams.set('v','sync1');frame.src=url.href;container.classList.add('open');}};
}
