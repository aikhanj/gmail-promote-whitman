const CFG = (() => {
  const raw = PropertiesService.getScriptProperties().getProperty('CONFIG_JSON');
  if (!raw) throw new Error('Missing CONFIG_JSON');
  return JSON.parse(raw);
})();

function promoteWhitman() {
  const labelName = CFG.label || 'Whitman/Wire';
  const label = GmailApp.getUserLabelByName(labelName);
  if (!label) throw new Error(`Label not found: ${labelName}`);


  const now = new Date();
  const since = new Date(now.getTime() - 6 * 60 * 60 * 1000); // scan last 6h
  const TZ = CFG.timezone || 'America/New_York';
  const q = `label:"${labelName}" after:${Utilities.formatDate(since, TZ, 'yyyy/MM/dd')}`;

  // For testing purposes

  // const q = `after:${Utilities.formatDate(since, TZ, 'yyyy/MM/dd')}`; 

  const threads = GmailApp.search(q, 0, 100);
  const seen = loadSeen_(); // {items, ids:Set}

  for (const th of threads) {
    const id = th.getId();
    if (seen.ids.has(id)) continue;

    const msg = th.getMessages().pop();
    const subject = (msg.getSubject() || '').trim();
    const rawBody = msg.getPlainBody() || msg.getBody() || '';
    const body = stripHtml_(rawBody);
    const text = (subject + ' ' + body).toLowerCase();

    const topical = hasAny_(text, CFG.keywords_primary || []);
    const excluded = hasAny_(text, CFG.hard_exclusions || []);

    if (topical && !excluded) {
  th.moveToInbox();
  th.addLabel(getOrCreateLabel_('BEST'));
  if (!th.isUnread()) th.markUnread();
}

    markSeen_(seen, id);
  }
  saveSeen_(seen);
}

function stripHtml_(s){ return String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function hasAny_(text, arr){ return (arr||[]).some(k => new RegExp(`\\b${escapeRe_(k)}\\b`, 'i').test(text)); }
function escapeRe_(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function getOrCreateLabel_(name){
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function loadSeen_(){
  const raw = PropertiesService.getScriptProperties().getProperty('PROMO_SEEN') || '[]';
  const cutoff = Date.now() - 7*24*3600*1000; // keep 7 days
  const items = JSON.parse(raw).filter(e => e.t >= cutoff);
  return { items, ids: new Set(items.map(e=>e.id)) };
}
function markSeen_(seen, id){
  const now = Date.now();
  seen.items.push({ id, t: now });
  seen.ids.add(id);
}
function saveSeen_(seen){
  const keep = seen.items.slice(-1000);
  PropertiesService.getScriptProperties().setProperty('PROMO_SEEN', JSON.stringify(keep));
}
