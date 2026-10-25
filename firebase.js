import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getDatabase, ref as databaseRef, child, onValue, set, update, runTransaction} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

export const app = initializeApp({
  apiKey: 'AIzaSyCD5E-bam1W27x87kz3iazHhpd5hCxVB7k',
  authDomain: 'tcgstore-4de0b.firebaseapp.com',
  databaseURL: 'https://tcgstore-4de0b-default-rtdb.firebaseio.com',
  projectId: 'tcgstore-4de0b',
  storageBucket: 'tcgstore-4de0b.firebasestorage.app',
  messagingSenderId: '513050700035',
  appId: '1:513050700035:web:fe4ebb1b23c072c7bf6136'
});
export const db = getDatabase(app);
export {onValue, set, update, runTransaction};
// Every Lorcana reference, including multi-field resets, stays beneath /lorcana.
export function ref(database, path='') {
  const root = databaseRef(database, 'lorcana');
  if (typeof path !== 'string' || path.startsWith('/') || path.includes('..')) throw Error('Invalid store data path');
  return path ? child(root, path) : root;
}
export const onepieceRef = databaseRef(db, 'onepiece');
export const onepieceDefaults = {
  player1_name:'Player 1', player2_name:'Player 2',
  player1_record:'0-0-0', player2_record:'0-0-0',
  player1_life:5, player2_life:5, player1_wins:0, player2_wins:0,
  player1_leader:null, player2_leader:null, round_name:'Round 1',
  timer_duration_seconds:3600, timer_remaining_seconds:3600,
  timer_running:false, timer_started_at:null, theme:'deep-ocean'
};
// Store controllers open directly without a sign-in screen.
export async function requireLogin() {}
