import {getCard,themes} from './riftboundcatalog.js';
export const defaults={player1_name:'Player 1',player2_name:'Player 2',player1_record:'0-0-0',player2_record:'0-0-0',player1_points:0,player2_points:0,player1_wins:0,player2_wins:0,player1_legend:null,player2_legend:null,player1_battlefield:null,player2_battlefield:null,player1_regular:null,player2_regular:null,round_name:'Round 1',timer_duration_seconds:3600,timer_remaining_seconds:3600,timer_running:false,timer_started_at:null,theme:'classic'};
const clamp=(n,max)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
const text=(value,fallback,max)=>typeof value==='string'?(value.trim().slice(0,max)||fallback):fallback;
export function normalize(raw){
 const s={...defaults,...(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{})};
 for(const p of [1,2]){s['player'+p+'_name']=text(s['player'+p+'_name'],'Player '+p,80);s['player'+p+'_record']=/^\d{1,3}-\d{1,3}-\d{1,3}$/.test(s['player'+p+'_record'])?s['player'+p+'_record']:'0-0-0';s['player'+p+'_points']=clamp(s['player'+p+'_points'],8);s['player'+p+'_wins']=clamp(s['player'+p+'_wins'],2);for(const [field,type] of [['legend','Legend'],['battlefield','Battlefield']])s['player'+p+'_'+field]=getCard(s['player'+p+'_'+field],type)?.code||null;}
 for(const p of [1,2]){const code=s['player'+p+'_regular'];s['player'+p+'_regular']=typeof code==='string'&&/^[A-Za-z0-9*./-]{2,35}$/.test(code)?code:null;}
 s.round_name=text(s.round_name,'Round 1',100);s.theme=themes.some(t=>t[0]===s.theme)?s.theme:'classic';
 s.timer_duration_seconds=Number.isFinite(s.timer_duration_seconds)?clamp(s.timer_duration_seconds,59940):3600;
 s.timer_remaining_seconds=Number.isFinite(s.timer_remaining_seconds)?clamp(s.timer_remaining_seconds,59940):s.timer_duration_seconds;
 s.timer_started_at=Number.isFinite(s.timer_started_at)&&s.timer_started_at>=0?s.timer_started_at:null;s.timer_running=s.timer_running===true&&s.timer_started_at!==null;return s;
}
export function seconds(s,now=Date.now()){return Math.max(0,s.timer_remaining_seconds-(s.timer_running&&s.timer_started_at!==null?Math.max(0,Math.floor((now-s.timer_started_at)/1000)):0));}
export function formatTime(n){n=Math.max(0,Math.floor(n));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
export function applyPatch(raw,patch){
 const result=normalize(raw);for(const [field,value]of Object.entries(patch)){
 let match;if((match=/^player([12])_name$/.exec(field)))result[field]=text(value,'Player '+match[1],80);
 else if(/^player[12]_record$/.test(field)){const v=value?.trim()||'0-0-0';if(!/^\d{1,3}-\d{1,3}-\d{1,3}$/.test(v))throw Error('Use W-L-D format, for example 3-0-1.');result[field]=v;}
 else if(/^player[12]_(points|wins)$/.test(field)){const max=field.endsWith('_wins')?2:8;if(!Number.isInteger(value)||value<0||value>max)throw Error('Invalid score.');result[field]=value;}
 else if((match=/^player[12]_(legend|battlefield)$/.exec(field))){if(value!==null&&!getCard(value,match[1]==='legend'?'Legend':'Battlefield'))throw Error('Choose a card from the list.');result[field]=value;}
 else if(/^player[12]_regular$/.test(field)){if(value!==null&&(typeof value!=='string'||!/^[A-Za-z0-9*./-]{2,35}$/.test(value)))throw Error('Invalid card code.');result[field]=value;}
 else if(field==='round_name')result[field]=text(value,'Round 1',100);
 else if(field==='theme'){if(!themes.some(t=>t[0]===value))throw Error('Unknown theme.');result[field]=value;}
 else throw Error('Invalid match setting.');
 }return result;
}
export function scoreState(raw,field,delta){if(!/^player[12]_(points|wins)$/.test(field)||![-1,1].includes(delta))throw Error('Invalid score adjustment.');const s=normalize(raw);s[field]=clamp(s[field]+delta,field.endsWith('_wins')?2:8);return s;}
export function timerState(raw,action,minutes,now=Date.now()){
 const s=normalize(raw);if(action==='set'){const m=Number(minutes);if(!Number.isInteger(m)||m<0||m>999)throw Error('Choose 0–999 minutes.');s.timer_duration_seconds=m*60;s.timer_remaining_seconds=m*60;s.timer_running=false;s.timer_started_at=null;}
 else if(action==='start'){if(!s.timer_running){const left=seconds(s,now);if(left===0)throw Error('Set or reset the timer before starting.');s.timer_remaining_seconds=left;s.timer_started_at=now;s.timer_running=true;}}
 else if(action==='pause'){s.timer_remaining_seconds=seconds(s,now);s.timer_started_at=null;s.timer_running=false;}
 else if(action==='reset'){s.timer_remaining_seconds=s.timer_duration_seconds;s.timer_started_at=null;s.timer_running=false;}
 else throw Error('Unknown timer action.');return s;
}
