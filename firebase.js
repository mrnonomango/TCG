import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getDatabase, ref as databaseRef, child, onValue, set, update, runTransaction} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

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
const auth = getAuth(app);
const owner = '39V4Om8N4cgfwuiQgxFkZCSFrmO2';
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
export async function requireLogin() {
  return new Promise(resolve => {
    const cover=document.createElement('div');
    cover.style.cssText='position:fixed;inset:0;z-index:10000;background:#09131f;display:flex;align-items:center;justify-content:center;padding:20px;color:white;font:16px Arial';
    cover.innerHTML='<form style="width:min(100%,360px);display:grid;gap:14px"><h2>TCG Store Controller</h2><p>Sign in with the TCGStore controller account.</p><label>Email<input name="email" type="email" autocomplete="username" required style="display:block;width:100%;box-sizing:border-box;padding:12px;margin-top:6px"></label><label>Password<input name="password" type="password" autocomplete="current-password" required style="display:block;width:100%;box-sizing:border-box;padding:12px;margin-top:6px"></label><button style="padding:13px;background:#246a9c;color:white;border:0;border-radius:7px">Sign in</button><p role="status" aria-live="polite"></p><a href="./index.html" style="color:#9cd8ff">Back to store links</a></form>';
    document.body.append(cover);
    const form=cover.querySelector('form'), status=cover.querySelector('[role=status]');
    form.onsubmit=async event=>{
      event.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='Signing in…';
      try {await signInWithEmailAndPassword(auth,form.elements.email.value.trim(),form.elements.password.value);}
      catch {status.textContent='Could not sign in. Check the email and password and try again.';}
      finally {button.disabled=false;form.elements.password.value='';}
    };
    onAuthStateChanged(auth,async user=>{
      if(user && user.uid===owner){cover.remove();resolve(user);}
      else {
        if(user){await signOut(auth);status.textContent='This account is not authorized for the store controllers.';}
        if(!cover.isConnected) location.reload();
      }
    });
  });
}
