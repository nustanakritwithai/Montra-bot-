const endpoint = 'https://montra.157-85-96-139.sslip.io/bot-admin-api';
const $ = id => document.getElementById(id);
const number = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 });
const clock = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const eventDate = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const stateNames = {
  online: 'ออนไลน์', offline: 'ออฟไลน์', unavailable: 'อ่านสถานะไม่ได้', starting: 'กำลังเปิด',
  stopping: 'กำลังหยุด', reconnecting: 'กำลังเชื่อมใหม่', failed: 'ขัดข้อง', stale: 'ข้อมูลล่าสุดที่อ่านได้',
  training_together: 'กำลังเก็บเลเวล', forming_party: 'กำลังตั้งปาร์ตี้', joining_same_room: 'กำลังเข้าห้องเดียวกัน',
  starting_bots: 'กำลังเปิดบอต', waiting_for_bots: 'รอบอต', other_party: 'มีสมาชิกปาร์ตี้อื่น',
  complete: 'ถึงเป้าหมายแล้ว', retrying: 'กำลังลองใหม่',
  HUNT: 'ล่ามอนสเตอร์', SEARCH: 'สำรวจ', REST: 'พัก', MERCHANT: 'ค้าขาย',
  train: 'เก็บเลเวล', forge: 'ตีบวก', manual: 'ตามคำสั่ง', government: 'ดูแลเมือง', capture: 'ยึดพื้นที่', class: 'ฝึกวิชา',
  cooldown: 'รอคูลดาวน์', farming_copies: 'ล่าชิ้นซ้ำ', needs_copies: 'ขาดชิ้นซ้ำ',
  no_copy_source: 'กำลังหาแหล่งดรอป', safe_limit: 'ถึง +3 แล้ว', waiting_for_gold: 'รอทอง',
  waiting_for_sales: 'รอขาย', crafting: 'กำลังคราฟต์', gathering: 'เก็บวัตถุดิบ', syncing: 'อ่านข้อมูล',
  travelling: 'กำลังเดินทาง', ready: 'พร้อม', pending: 'กำลังดำเนินการ', checking: 'กำลังตรวจ',
  level_goal: 'เป้าหมายเลเวล', user_order: 'คำสั่งเดินหรือช่วยทีม', continue_commitment: 'ทำงานเดิมต่อ',
  weapon_upgrade_affordable: 'หาอุปกรณ์สำหรับตีบวก',
  ritual_village: 'หมู่บ้านพิธีกรรม', naga_cavern: 'ถ้ำนาค', hex_ridge: 'ดงอาคมบนเขา', drowned_marsh: 'บึงพราย',
  mantra_capital: 'เวียงมนตรา', forbidden_forest: 'ป่าต้องห้าม', lotus_basin: 'ลุ่มบัว',
  wp_twins_5: 'ดาบคู่ป่าลึก', wp_twins_1: 'ดาบคู่ลานฝึก', use_herbal_1: 'ยาเลือด', use_mana_1: 'ยามานา',
};
const eventNames = {
  joined: 'เข้าเกม', connection_error: 'หลุดการเชื่อมต่อ', stopped: 'หยุดบอต',
  mission_selected: 'เลือกภารกิจ', ai_decision: 'AI เลือกเป้าหมาย', goal: 'เปลี่ยนพฤติกรรม',
  portal_attempt: 'เข้าประตูข้ามแผนที่', destination: 'รับคำสั่งเดิน', destination_arrived: 'ถึงจุดหมาย',
  route_unavailable: 'หาเส้นทางไม่ได้', recovery_exhausted: 'เดินติดสิ่งกีดขวาง', training_camp_blocked: 'เปลี่ยนแคมป์ล่า',
  monster_defeated: 'กำจัดมอนสเตอร์', party_combat_hit: 'โจมตีร่วมปาร์ตี้', sword_skill_used: 'ใช้สกิลดาบ',
  forge_hunt_selected: 'เลือกแหล่งดรอปตีบวก', forge_copy_collected: 'เก็บชิ้นซ้ำเข้าคลังช่าง', forge_result: 'ผลตีบวก',
  best_weapon_equipped: 'สวมอาวุธที่ดีที่สุด', potion_used: 'ใช้ยา', potion_purchased: 'ซื้อยา',
  merchant_crafted: 'คราฟต์สินค้า', merchant_listed: 'ลงขายสินค้า', merchant_sync_after_timeout: 'ซิงก์รายการค้าใหม่',
  territory_government_requested: 'ดำเนินงานเมือง', territory_entry_requested: 'เข้าพื้นที่กิลด์',
  operator_action: 'คำสั่งจากแดชบอร์ด',
};
const actions = {
  restart: ['รีสตาร์ต', 'บอตจะออกจากเกมชั่วคราว แล้วกลับเข้าเกมด้วยตัวละครเดิม'],
  stop: ['หยุดบอต', 'บอตพ่อค้าจะออกจากเกมจนกว่าจะสั่งเปิดอีกครั้ง'],
  start: ['เปิดบอต', 'บอตพ่อค้าจะเข้าเกมและทำงานตามแผนเดิม'],
  destination: ['ส่งไปจุดหมาย', 'กรอกรหัสแผนที่และพิกัด ระบบจะตรวจเส้นทางก่อนส่งบอตไป'],
};
const errorNames = {
  invalid_key: 'คีย์แดชบอร์ดไม่ถูกต้อง', service_unavailable: 'ติดต่อ API บน VPS ไม่ได้',
  invalid_command: 'กรุณาตรวจข้อมูลคำสั่ง', action_pending: 'มีคำสั่งอื่นกำลังทำงาน',
  invalid_destination: 'บอตออฟไลน์หรือจุดหมายใช้ไม่ได้', destination_blocked: 'จุดหมายอยู่ในพื้นที่ที่เดินเข้าไม่ได้',
  no_map_route: 'ไม่มีเส้นทางเชื่อมไปแผนที่นี้', bot_unreachable: 'ติดต่อบอตไม่ได้',
  bot_control_failed: 'บอตตอบกลับว่าทำคำสั่งไม่สำเร็จ', start_unconfirmed: 'ยังยืนยันการเข้าเกมไม่ได้',
  stop_unconfirmed: 'ยังยืนยันการหยุดบอตไม่ได้',
};
let key = '';
let data;
let timer;
let pending;
let activeRead;
let sending = false;
const cards = new Map();

function display(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return number.format(value);
  return Object.hasOwn(stateNames, value) ? stateNames[value] : value;
}
function node(tag, content, className) {
  const element = document.createElement(tag);
  if (content !== undefined) element.textContent = content;
  if (className) element.className = className;
  return element;
}
function announce(message) {
  $('notice').hidden = !message;
  $('notice').textContent = message;
}
function connection(state, message) {
  $('connection').dataset.state = state;
  $('connection').textContent = message;
}
async function request(path, signal, command) {
  const response = await fetch(endpoint + path, {
    headers: { Authorization: 'Bearer ' + key, ...(command ? { 'Content-Type': 'application/json' } : {}) },
    method: command ? 'POST' : 'GET', body: command ? JSON.stringify(command) : undefined,
    signal, cache: 'no-store', credentials: 'omit', redirect: 'error',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? 'service_unavailable');
  return result;
}

function showAction(bot, action) {
  if (sending) return;
  pending = { bot: bot.id, action };
  $('action-title').textContent = actions[action][0] + ' · ' + bot.name;
  $('action-description').textContent = actions[action][1];
  const moving = action === 'destination';
  $('destination-fields').hidden = !moving;
  const fields = $('action-form').elements;
  for (const [name, value] of Object.entries({ mapId: bot.map, x: bot.x, z: bot.z })) {
    const input = fields.namedItem(name);
    input.disabled = !moving;
    input.required = moving;
    input.value = value ?? '';
  }
  $('action-dialog').showModal();
}

function updateCard(bot) {
  let card = cards.get(bot.id);
  if (!card) {
    const root = node('article', undefined, 'panel bot');
    const title = node('div');
    title.append(node('h3', bot.name), node('span', bot.role === 'merchant' ? 'การค้าและคราฟต์' : 'ต่อสู้และเก็บเลเวล', 'role'));
    const badge = node('span', undefined, 'pill');
    const heading = node('div', undefined, 'card-head');
    heading.append(title, badge);
    const level = node('div', undefined, 'level');
    const hp = node('div', undefined, 'health');
    const meter = node('progress');
    meter.setAttribute('aria-label', 'พลังชีวิต ' + bot.name);
    const healthText = node('small');
    hp.append(meter, healthText);
    const details = node('dl');
    const buttons = node('div', undefined, 'card-actions');
    const controls = new Map();
    for (const action of bot.role === 'merchant' ? ['restart', 'stop', 'start'] : ['restart', 'destination']) {
      const button = node('button', actions[action][0], 'quiet');
      button.type = 'button';
      button.addEventListener('click', () => showAction(card.current, action));
      controls.set(action, button);
      buttons.append(button);
    }
    root.append(heading, level, hp, details, buttons);
    $('bots').append(root);
    card = { badge, level, hp, meter, healthText, details, controls };
    cards.set(bot.id, card);
  }
  card.current = bot;
  card.badge.dataset.state = bot.state;
  card.badge.textContent = display(bot.state);
  card.level.textContent = 'Lv. ' + display(bot.level);
  card.hp.hidden = !bot.maxHp;
  card.meter.max = bot.maxHp || 1;
  card.meter.value = bot.hp ?? 0;
  card.healthText.textContent = display(bot.hp) + ' / ' + display(bot.maxHp) + ' HP';
  const activity = bot.state !== 'online' ? '—' :
    bot.routeRetryAt > Date.parse(data.time) && bot.goal === 'REST' ? 'รอลองหาเส้นทางใหม่' :
    bot.assistState === 'recovering' && bot.hp < bot.maxHp ? 'พักฟื้นพลังชีวิต' :
    bot.assistState === 'waiting' ? 'รอตัวนำเลือกเป้าหมาย' :
    bot.assistState === 'following' ? 'เดินตามตัวนำปาร์ตี้' :
    bot.assistState === 'fighting' ? 'ช่วยปาร์ตี้ต่อสู้' : display(bot.goal);
  const rows = [['พฤติกรรม', activity], ['แผนที่', display(bot.map)],
    ['ตำแหน่ง X / Z', bot.x === null ? '—' : display(bot.x) + ' / ' + display(bot.z)]];
  if (bot.role === 'fighter') {
    rows.push(['ภารกิจ', [bot.mission, bot.reason].filter(Boolean).map(display).join(' · ') || '—'],
      ['แคมป์', display(bot.forge?.camp ?? bot.camp)],
      ['ปาร์ตี้', bot.following ? 'ช่วย ' + bot.following : bot.party ? 'อยู่ในปาร์ตี้' : '—'],
      ['สังหาร / XP', display(bot.kills) + ' / ' + display(bot.experience)],
      ['อาวุธ', display(bot.weapon) + (bot.forge?.rank ? ' +' + bot.forge.rank : '')],
      ['คลังช่าง', bot.forge ? display(bot.forge.stock) + ' ชิ้น · ' + display(bot.forge.state) : '—']);
    if (bot.potions) rows.push(['ใช้ยา', display(bot.potions.used) + ' ครั้ง']);
  } else if (bot.merchant) {
    rows.push(['งานปัจจุบัน', display(bot.merchant.state)], ['เก็บ / คราฟต์', display(bot.merchant.harvested) + ' / ' + display(bot.merchant.crafted)],
      ['ประกาศขาย', display(bot.merchant.open) + ' รายการ']);
  }
  rows.push(['ทอง', display(bot.gold)]);
  card.details.replaceChildren(...rows.flatMap(([title, value]) => [node('dt', title), node('dd', value)]));
  for (const [action, button] of card.controls) {
    const offline = bot.state === 'offline';
    button.hidden = action === 'start' ? !offline : action === 'stop' ? offline : false;
    button.disabled = sending || (action === 'destination' && bot.state !== 'online') ||
      (action === 'restart' && ['starting', 'stopping', 'unavailable'].includes(bot.state));
  }
}

function renderEvents() {
  const bots = new Map(data?.bots.map(bot => [bot.id, bot.name]));
  const events = (data?.events ?? []).filter(row =>
    (!$('bot-filter').value || row.bot === $('bot-filter').value) &&
    (!$('category-filter').value || row.category === $('category-filter').value));
  $('empty').hidden = events.length > 0;
  $('events').replaceChildren(...events.map(row => {
    const item = node('li');
    const time = node('time', eventDate.format(new Date(row.time)));
    time.dateTime = row.time;
    const details = [row.map, row.item, row.mission, row.goal, row.reason, row.destination ?? row.target].filter(Boolean).map(display);
    if (row.type === 'operator_action' && Object.hasOwn(actions, row.action)) details.push(actions[row.action][0]);
    if (row.rank !== null) details.push('+' + row.rank);
    if (row.quantity !== null) details.push('×' + row.quantity);
    if (row.price !== null) details.push(display(row.price) + ' ทอง');
    if (row.success !== null) details.push(row.success ? 'สำเร็จ' : 'ไม่สำเร็จ');
    const summary = node('div', eventNames[row.type] ?? row.type);
    if (details.length) summary.append(node('small', details.join(' · ')));
    item.append(time, node('span', bots.get(row.bot), 'event-name'), summary);
    return item;
  }));
}

function render() {
  $('online-count').textContent = data.bots.filter(bot => bot.state === 'online').length + ' / ' + data.bots.length;
  $('game-state').textContent = data.game ? 'ตอบสนอง' : 'ไม่ตอบสนอง';
  $('party-state').textContent = display(data.team.state);
  $('party-detail').textContent = data.team.hunter ? 'นำทีม ' + data.team.hunter : '';
  $('updated').textContent = clock.format(new Date(data.time));
  data.bots.forEach(updateCard);
  renderEvents();
}

function lock() {
  clearTimeout(timer);
  activeRead?.abort();
  key = '';
  data = undefined;
  cards.clear();
  $('bots').replaceChildren();
  $('events').replaceChildren();
  $('dashboard').hidden = $('lock').hidden = $('refresh').hidden = true;
  $('locked').hidden = false;
  $('key').value = '';
  connection('offline', 'ยังไม่เชื่อมต่อ');
  announce('');
  $('key').focus();
}

async function refresh() {
  if (!key || activeRead) return;
  clearTimeout(timer);
  const controller = new AbortController();
  activeRead = controller;
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await request('/overview', controller.signal);
    if (activeRead !== controller || !key) return;
    data = response;
    $('dashboard').hidden = $('lock').hidden = $('refresh').hidden = false;
    $('locked').hidden = true;
    $('key').value = '';
    connection('online', 'เชื่อมต่อ VPS');
    render();
  } catch (error) {
    if (!key || activeRead !== controller) return;
    if (error.message === 'invalid_key') lock();
    else {
      if (!data) key = '';
      connection(data ? 'stale' : 'offline', data ? 'ข้อมูลค้าง' : 'เชื่อมต่อไม่ได้');
    }
    announce(errorNames[error.message] ?? errorNames.service_unavailable);
  } finally {
    clearTimeout(timeout);
    if (activeRead === controller) activeRead = undefined;
    $('unlock').disabled = false;
    if (key) timer = setTimeout(refresh, 6000);
  }
}

$('login').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('key').value.trim();
  if (!/^[a-f0-9]{64}$/.test(input)) { announce('คีย์แดชบอร์ดต้องเป็นอักขระฐานสิบหก 64 ตัว'); return; }
  if (activeRead) return;
  key = input;
  $('unlock').disabled = true;
  announce('');
  connection('starting', 'กำลังเชื่อมต่อ');
  void refresh();
});
$('refresh').addEventListener('click', () => { announce(''); void refresh(); });
$('lock').addEventListener('click', lock);
$('bot-filter').addEventListener('change', renderEvents);
$('category-filter').addEventListener('change', renderEvents);
$('cancel-action').addEventListener('click', () => $('action-dialog').close());
$('action-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!pending || sending) return;
  const command = { ...pending };
  if (command.action === 'destination') {
    const form = new FormData($('action-form'));
    Object.assign(command, { mapId: form.get('mapId').trim(), x: Number(form.get('x')), z: Number(form.get('z')) });
  }
  $('action-dialog').close();
  sending = true;
  render();
  announce('กำลังส่งคำสั่ง…');
  try {
    const result = await request('/actions', AbortSignal.timeout(45_000), command);
    if (key) announce('ส่งคำสั่งสำเร็จ · ' + display(result.state));
  } catch (error) {
    if (key) announce(errorNames[error.message] ?? 'ยังยืนยันผลไม่ได้ · ตรวจสถานะบอตก่อนส่งซ้ำ');
  } finally {
    sending = false;
    if (data) { render(); void refresh(); }
  }
});
