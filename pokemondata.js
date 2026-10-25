import {db,onValue,update,runTransaction} from './firebase.js';
import {ref as databaseRef} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
export {onValue,update,runTransaction};
export const pokemonRef=databaseRef(db,'pokemon');
export const pokemonDefaults={player1_name:'Player 1',player2_name:'Player 2',player1_record:'0-0-0',player2_record:'0-0-0',player1_prizes:6,player2_prizes:6,player1_wins:0,player2_wins:0,player1_card:null,player2_card:null,round_name:'Round 1',timer_duration_seconds:3600,timer_remaining_seconds:3600,timer_running:false,timer_started_at:null,theme:'classic'};
export function safeCard(card){try{const url=new URL(card.image);return url.protocol==='https:'&&url.hostname==='assets.tcgdex.net'&&typeof card.name==='string'?card:null;}catch{return null;}}
export async function adjustScore(field,delta,max){
  if(!/^player[12]_(prizes|wins)$/.test(field))throw Error('Invalid score field');
  await runTransaction(databaseRef(db,'pokemon/'+field),current=>Math.max(0,Math.min(max,(Number.isFinite(current)?current:(field.endsWith('_prizes')?6:0))+delta)));
}
