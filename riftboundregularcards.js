// Community-maintained snapshot of Riot's official Riftbound card gallery.
// Card artwork remains hosted by Riot; no artwork is redistributed here.
const SOURCE='https://raw.githubusercontent.com/slimtreble/Riftbound-card-data/main/cards.json';
let pending;
export const regularTypes=['Unit','Spell','Gear','Rune'];
export function regularCards(){return pending??=(async()=>{const response=await fetch(SOURCE,{cache:'no-cache'});if(!response.ok)throw Error('Card catalog unavailable');const raw=await response.json();const list=Array.isArray(raw)?raw:(raw.cards||raw.data||[]);return list.filter(c=>regularTypes.includes(c.type)&&c.code&&c.imageUrl).map(c=>({code:c.code,name:c.name,type:c.type,imageUrl:c.imageUrl,set:c.set||'',rarity:c.rarity||''}));})().catch(e=>{pending=null;throw e;});}
export async function regularCard(code){if(!code)return null;return (await regularCards()).find(c=>c.code===code)||null;}
