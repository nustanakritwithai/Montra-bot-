const endpoint = 'https://montra.157-85-96-139.sslip.io/bot-admin-api';
const $ = id => document.getElementById(id);
const number = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 });
const clock = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const eventDate = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const stateNames = {
  phutthaisawan: 'ดาบคู่', muay_boran: 'มวยไทยโบราณ', blade: 'คมดาบ', sentinel: 'ผู้พิทักษ์', seer: 'ผู้ร่ายเวท', mender: 'พระ',
  protected: 'คุ้มครอง', secured: 'ครองเมือง', battle: 'กำลังรบ', open: 'เปิดชิง', finished: 'จบศึก',
  attack: 'ฝ่ายบุก', defend: 'ฝ่ายตั้งรับ', guild_war: 'ศึกกิลด์', idle: 'พักภารกิจ', separate_roles: 'ตัวควบคุมบอตพร้อม',
  moon_pass: 'ด่านจันทร์', river_watch: 'ป้อมท่าปากชล', sam_lan_estuary: 'ปากน้ำสามลาน', tri_wiang_castle: 'ปราสาทสามเวียง',
  asura_peak: 'ยอดเขาอสูร', spirit_rift: 'รอยแยกวิญญาณ', bound_temple: 'วัดร้างพันธนาการ', bamboo_frontier: 'ดงไผ่',
  moon_cemetery: 'ป่าช้าเงาจันทร์', fallen_city: 'เมืองอาคมล่ม', twin_neck_pass: 'ด่านสันเขาสองคอ',
  seer_buffalo: 'ควายธนู', seer_poison: 'ข้าวสารพิษ', mender_core_heal: 'พรฟื้นกาย', mender_core_circle: 'มหายันต์ฟื้นชีพ',
  shock: 'กระแทกหยุดทัพ', riposte: 'ตั้งง้าวสวน', blade_fury: 'ปลุกจิตสังหาร', blade_heavy: 'คมสังหาร',
  online: 'ออนไลน์', offline: 'ออฟไลน์', unavailable: 'อ่านสถานะไม่ได้', starting: 'กำลังเปิด',
  stopping: 'กำลังหยุด', reconnecting: 'กำลังเชื่อมใหม่', failed: 'ขัดข้อง', stale: 'ข้อมูลล่าสุดที่อ่านได้',
  training_together: 'กำลังเก็บเลเวล', independent_training: 'ล่าอิสระ · ช่วยเมื่อถูกเรียก',
  forming_party: 'กำลังตั้งปาร์ตี้', joining_same_room: 'กำลังเข้าห้องเดียวกัน',
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
  typhoon_plan: 'แผนจาก Typhoon', hunt: 'ล่า', search: 'สำรวจ', recover: 'พักฟื้น',
  hunt_target: 'ล่ามอนสเตอร์ที่เลือก', hunt_camp: 'ล่าตามจุดเก็บเลเวล', learn_skill: 'เรียนวิชาดาบ', recover_health: 'พักฟื้นเลือด',
  enhance_weapon: 'ตีบวกอาวุธ', govern_territory: 'ดูแลเมืองกิลด์', capture_territory: 'เข้าศึกยึดพื้นที่',
  restock_product: 'ผลิตและเติมสินค้า', use_potion: 'ใช้ยา', buy_potion: 'ซื้อยา',
  sell_surplus: 'ขายวัสดุส่วนเกิน', equip_best_weapon: 'เลือกอาวุธที่ดีที่สุด',
  request_party_help: 'ขอให้ปาร์ตี้ช่วย', plant_guild_banner: 'ปักธงชัยกิลด์',
  navigate_rrt: 'นำทาง RRT', combat_skills: 'ใช้สกิลต่อสู้', party_chat: 'คุยในปาร์ตี้',
  assist_on_request: 'ช่วยเมื่อได้รับคำขอ', guild_membership: 'จัดการสมาชิกกิลด์', emergency_healing: 'ใช้ยาฉุกเฉิน',
  market_price_history: 'ดูราคาตลาด', claim_finished_craft: 'รับของที่คราฟต์เสร็จ', merchant_chat: 'ตอบคำถามร้านค้า',
  potion_used: 'ใช้ยาแล้ว', potion_purchased: 'ซื้อยาแล้ว', no_affordable_listing: 'ไม่มีของขายในงบ',
  material_sold: 'ขายวัสดุแล้ว', equipped: 'สวมอาวุธแล้ว', already_best: 'ใช้อาวุธที่ดีที่สุดอยู่แล้ว',
  no_eligible_weapon: 'ไม่มีอาวุธที่ใช้ได้', party_help_sent: 'ส่งข้อความขอความช่วยเหลือแล้ว',
  guild_banner_planted: 'ปักธงแล้ว', territory_admitted: 'เกมอนุญาตให้เข้าศึกแล้ว',
  md_list: 'ดูรายชื่อไฟล์', md_read: 'อ่าน Markdown', md_create: 'สร้าง Markdown', md_edit: 'แก้ Markdown',
  skill_list: 'ดูคลังทักษะ', skill_load: 'เปิดทักษะ', skill_save: 'บันทึกทักษะ',
  kama: 'กามตัณหา', bhava: 'ภวตัณหา', vibhava: 'วิภวตัณหา',
  soka: 'โสกะ', parideva: 'ปริเทวะ', dukkha: 'ทุกขะ', domanassa: 'โทมนัส', upayasa: 'อุปายาส',
  observing: 'กำลังประเมินผล', seeking_relief: 'กำลังเลือกทางคลายทุกข์', waiting_for_option: 'รอเงื่อนไขในเกม',
  reentered: 'เริ่มรอบใหม่แล้ว', activity_ended: 'การกระทำจบลง', conditions_lost: 'ปัจจัยให้ทำต่อหมดลง',
  repeated_obstacle: 'พบอุปสรรคซ้ำ', typhoon_cycle_reentered: 'กลับเข้าสู่วงจรตัณหา',
  pleasant: 'สุข', painful: 'ทุกข์', neutral: 'เฉย ๆ', selected: 'เลือกแล้ว', executing: 'กำลังทำ',
  completed: 'ทำสำเร็จ', interrupted: 'ยุติการกระทำ', blocked: 'ทำต่อไม่ได้',
  interrupted_for_safety: 'พักแผนเพื่อความปลอดภัย', profitable_trade: 'มีสินค้าที่ขายได้กำไร',
  low: 'ระวังความเสี่ยง', high: 'ยอมรับความเสี่ยงสูง',
  critical_hp: 'เลือดวิกฤต', low_hp: 'เลือดต่ำ', under_attack: 'ถูกโจมตี',
  low_food: 'หิว', low_water: 'กระหาย', bag_full: 'กระเป๋าเต็ม', route_failed: 'เส้นทางติด',
  'route-recovery': 'กู้เส้นทาง', supplies: 'เติมเสบียง', 'merchant-restock': 'เติมสินค้าร้านยา', combat: 'ล่ามอนสเตอร์',
  inspect_inventory: 'ดูกระเป๋า', inspect_character: 'ดูสเตตัส', inspect_needs: 'ดูความหิวและกระหาย',
  inspect_resources: 'ดูทรัพยากร', inspect_home: 'ดูบ้านและสวน', inspect_city_trade: 'ดูตลาดและสัญญาค้าเมือง',
  consume_nutrition: 'กินหรือดื่ม', collect_water: 'ตักน้ำ', cook_basic_meal: 'ทำต้มปลาช่อน', visit_village_well: 'เดินทางไปลานตักน้ำ',
  ok: 'สำเร็จ', nutrition_consumed: 'กินหรือดื่มแล้ว', water_collected: 'ตักน้ำแล้ว', meal_cooked: 'ทำอาหารแล้ว', well_reached: 'ถึงลานตักน้ำ',
  territory_governed: 'ดูแลพื้นที่แล้ว', unavailable: 'เงื่อนไขเปลี่ยน', reply_timeout: 'เกมตอบกลับไม่ทัน',
  balanced: 'สมดุล', pressure: 'เร่งโจมตี', conserve: 'ประหยัดมานา', guard: 'เน้นป้องกัน',
  monster_defeated: 'กำจัดมอนสเตอร์แล้ว', weapon_enhanced: 'ตีบวกสำเร็จ', forge_failed: 'ตีบวกไม่สำเร็จ',
  skill_learned: 'เรียนสกิลแล้ว', item_listed: 'ลงขายแล้ว', recovered: 'ฟื้นเลือดแล้ว', timed_out: 'หมดเวลาทำแผน',
  route_unavailable: 'หาเส้นทางไม่ได้', recovery_exhausted: 'กู้เส้นทางไม่สำเร็จ',
  ritual_village: 'หมู่บ้านพิธีกรรม', naga_cavern: 'ถ้ำนาค', hex_ridge: 'ดงอาคมบนเขา', drowned_marsh: 'บึงพราย',
  mantra_capital: 'เวียงมนตรา', forbidden_forest: 'ป่าต้องห้าม', lotus_basin: 'ลุ่มบัว',
  wp_twins_5: 'ดาบคู่ป่าลึก', wp_twins_1: 'ดาบคู่ลานฝึก', use_herbal_1: 'ยาเลือด', use_mana_1: 'ยามานา',
};
const eventNames = {
  guild_war_joined: 'เข้าสนามรบ', profession_skill_used: 'ใช้สกิลอาชีพ', city_ownership_confirmed: 'ยึดเมืองสำเร็จ',
  merchant_level_observed: 'ตรวจเลเวลพ่อค้า', merchant_quality_improved: 'ตีบวกสินค้า',
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
  party_help_requested: 'ได้รับคำขอให้ช่วยตี', party_help_started: 'เริ่มช่วยตามคำขอ', party_help_finished: 'จบการช่วย',
  typhoon_plan_selected: 'Typhoon เลือกแผน', typhoon_plan_applied: 'เริ่มใช้แผน Typhoon', typhoon_plan_unavailable: 'ใช้แผนสำรอง',
  typhoon_plan_outcome: 'ผลของแผน Typhoon', typhoon_tool_result: 'ผลเรียกเครื่องมือ Typhoon', nutrition_result: 'ผลอาหารและน้ำ',
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
let selectedBot = null;
let dirtyRead = false;
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

function detailsRows(bot) {
const activity = bot.state !== 'online' ? '—' :
    bot.routeRetryAt > Date.parse(data.time) && bot.goal === 'REST' ? 'รอลองหาเส้นทางใหม่' :
    bot.assistState === 'recovering' && bot.hp < bot.maxHp ? 'พักฟื้นพลังชีวิต' :
    bot.assistState === 'waiting' ? 'รอตัวนำเลือกเป้าหมาย' :
    ['following', 'travelling', 'waiting_for_portal', 'arrived'].includes(bot.assistState) ? (bot.assistSource === 'party_request' ? 'กำลังไปช่วยตามคำขอ' : 'เดินตามตัวนำปาร์ตี้') :
    bot.assistState === 'fighting' ? (bot.assistSource === 'party_request' ? 'ช่วยต่อสู้ตามคำขอ' : 'ช่วยปาร์ตี้ต่อสู้') : display(bot.goal);
  const rows = [['สถานะ', display(bot.state)], ['เลเวล', display(bot.level)], ['พลังชีวิต', bot.maxHp ? display(bot.hp) + ' / ' + display(bot.maxHp) : '—'],
    ['พฤติกรรม', activity], ['แผนที่', display(bot.map)],
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
  if (bot.guild) rows.push(['กิลด์', bot.guild]);
  if (bot.skill?.id) rows.push(['สกิลล่าสุด', display(bot.skill.id) + ' · ' + display(bot.skill.casts) + ' ครั้ง']);
  if (bot.war?.site) rows.push(['สนามรบ', display(bot.war.site) + ' · ' + display(bot.war.side) + ' · ' + display(bot.war.state)]);
  if (bot.owned?.length) rows.push(['เมืองที่ครอง', bot.owned.map(display).join(' · ')]);
  rows.push(['ทอง', display(bot.gold)]);
  if (bot.nutrition?.food != null) rows.push(['อาหาร / น้ำ', display(bot.nutrition.food) + ' / ' + display(bot.nutrition.water)]);
  if (bot.plan?.source === 'typhoon') rows.push([
    bot.plan.appliedAt ? 'แผน Typhoon' : 'แผนที่เสนอ', [bot.plan.tool, bot.plan.reason].filter(Boolean).map(display).join(' · '),
  ]);
  if (bot.plan?.step) rows.push(['ขั้นของแผน', bot.plan.step + ' / ' + bot.plan.total +
    (bot.role === 'fighter' ? ' · ' + display(bot.plan.tactic) : '')]);
  else if (bot.plan?.state === 'fallback') rows.push(['แผน', 'ใช้กติกาสำรอง']);
  else if (bot.plan?.source === 'feeling_rules') rows.push(['แผนตามเวทนา', display(bot.plan.tool)]);
  if (bot.tools) {
    rows.push(['เครื่องมือที่พร้อม', bot.tools.ready.map(display).join(' · ') || '—']);
    if (bot.tools.automatic.length) rows.push(['ระบบอัตโนมัติ', bot.tools.automatic.map(display).join(' · ')]);
    const result = bot.tools.lastResult;
    if (result?.tool && result.outcome) rows.push(['ผลล่าสุด', display(result.tool) + ' · ' + display(result.outcome)]);
    const side = bot.tools.lastSideResult;
    if (side?.tool && side.outcome) rows.push(['ผลเครื่องมือล่าสุด', display(side.tool) + ' · ' + display(side.outcome)]);
    const skills = bot.tools.skills;
    if (skills?.total != null) rows.push(['คลังทักษะ', display(skills.total) + ' รายการ']);
    if (skills?.selected) rows.push(['ทักษะที่โหลด', display(skills.selected)]);
    if (skills?.lastSaved) rows.push(['ทักษะที่บันทึกล่าสุด', display(skills.lastSaved)]);
    const drives = bot.tools.drives;
    if (drives?.dominant) {
      rows.push(['แรงขับนำ', display(drives.dominant)]);
      rows.push(['คะแนนแรงขับ', Object.entries(drives.scores).map(([name, score]) =>
        display(name) + ' ' + display(score)).join(' · ')]);
      if (drives.pressure.length) rows.push(['สภาวะที่กดดัน', drives.pressure.map(display).join(' · ')]);
    }
    const personality = bot.tools.personality;
    if (personality?.source === 'typhoon') {
      rows.push(['บุคลิกปัจจุบัน', [personality.mood, personality.risk].filter(Boolean).map(display).join(' · ')]);
      rows.push(['ความตั้งใจ', display(personality.intention)]);
      if (personality.focus) rows.push(['สิ่งที่ให้ความสำคัญ', display(personality.focus)]);
    } else if (personality?.source === 'unavailable') rows.push(['บุคลิกปัจจุบัน', 'รอบนี้ Typhoon ประมวลผลบุคลิกไม่สำเร็จ']);
    const feeling = bot.tools.feeling;
    if (feeling) {
      rows.push(['เวทนาปัจจุบัน', [feeling.kind, ...feeling.reasons].filter(Boolean).map(display).join(' · ')]);
      rows.push(['ผลการกระทำ', [feeling.state, feeling.outcome].filter(Boolean).map(display).join(' · ')]);
    }
    const cycle = bot.tools.cycle;
    if (cycle) {
      rows.push(['วงจรหลังจบการกระทำ', [cycle.action?.tool, cycle.distress, cycle.nextDrive, cycle.state]
        .filter(Boolean).map(display).join(' → ')]);
      if (cycle.distress) rows.push(['คะแนนทุกข์หลังจบงาน', Object.entries(cycle.scores)
        .map(([name, score]) => display(name) + ' ' + score).join(' · ')]);
    }
  }
    return rows;
}

function badge() { return node('span', undefined, 'pill'); }
function setBadge(element, state) {
  element.dataset.state = state;
  element.textContent = display(state);
}
function setChoices(select, choices) {
  const value = select.value;
  const existing = Array.from(select.options, option => option.value);
  if (existing.length === choices.length + 1 && choices.every(([id, name], index) =>
    existing[index + 1] === id && select.options[index + 1].textContent === name)) return;
  const first = select.options[0];
  select.replaceChildren(first, ...choices.map(([id, name]) => {
    const option = node('option', name);
    option.value = id;
    return option;
  }));
  if (choices.some(([id]) => id === value)) select.value = value;
}
function groupBots() {
  const guilds = new Map();
  const reserves = [], operations = [];
  for (const bot of data.bots) {
    if (bot.group === 'reserve') reserves.push(bot);
    else if (['commander', 'guild'].includes(bot.group) && bot.assignedGuild) {
      if (!guilds.has(bot.assignedGuild)) guilds.set(bot.assignedGuild, []);
      guilds.get(bot.assignedGuild).push(bot);
    } else operations.push(bot);
  }
  return { guilds, reserves, operations };
}
function openBot(bot) {
  selectedBot = bot.id;
  updateDetails();
  $('bot-dialog').showModal();
}
function updateDetails() {
  const bot = data?.bots.find(entry => entry.id === selectedBot);
  if (!bot) return;
  $('bot-title').textContent = bot.name;
  $('bot-context').textContent = [bot.assignedGuild, bot.role === 'merchant' ? 'พ่อค้า' : display(bot.profession)].filter(Boolean).join(' · ');
  $('bot-details').replaceChildren(...detailsRows(bot).flatMap(([title, value]) => [node('dt', title), node('dd', value)]));
}
function memberRow(bot) {
  const row = node('button', undefined, 'member-row');
  row.type = 'button';
  row.dataset.member = bot.id;
  row.setAttribute('aria-haspopup', 'dialog');
  row.addEventListener('click', () => openBot(bot));
  const level = node('span', bot.level != null ? 'Lv. ' + display(bot.level) : '—', 'row-level');
  const state = badge();
  setBadge(state, bot.state);
  const end = node('span', undefined, 'row-end');
  end.append(level, state);
  row.append(node('span', bot.name, 'member-name'), node('span', display(bot.profession), 'row-class'), end);
  return row;
}
function guildCaption(leader) {
  if (!leader) return 'รอข้อมูลแม่ทัพ';
  const campaign = leader.campaign;
  const owned = leader.owned?.map(display) ?? [];
  const assignment = leader.war?.site ? [display(leader.war.side), display(leader.war.site)].join(' · ') :
    [campaign?.city, campaign?.phase].filter(Boolean).map(display).join(' · ');
  return [owned.length ? 'ครอง ' + owned.join(' · ') : null,
    assignment && (leader.war?.site || !leader.owned?.includes(campaign?.city)) ? assignment : null]
    .filter(Boolean).join(' | ') || display(leader.mission);
}
function renderGuilds(guilds) {
  const selectedGuild = $('guild-filter').value, profession = $('class-filter').value;
  const visible = [...guilds].filter(([name, members]) => (!selectedGuild || selectedGuild === name) &&
    (!profession || members.some(bot => bot.profession === profession)));
  const focused = document.activeElement?.dataset.member;
  $('guild-grid').replaceChildren(...visible.map(([name, members]) => {
    const card = node('article', undefined, 'panel guild-card');
    card.dataset.guild = name;
    const heading = node('div', undefined, 'guild-head');
    const title = node('div');
    title.append(node('h3', name), node('p', guildCaption(members.find(bot => bot.group === 'commander')), 'guild-caption'));
    const online = members.filter(bot => bot.state === 'online' && bot.guild === name).length;
    const count = node('span', online + ' / ' + members.length, 'guild-count');
    count.setAttribute('aria-label', 'ออนไลน์ ' + online + ' จาก ' + members.length);
    heading.append(title, count);
    card.append(heading, ...members.filter(bot => !profession || bot.profession === profession).map(memberRow));
    return card;
  }));
  $('no-guilds').hidden = visible.length > 0;
  if (focused) Array.from($('guild-grid').querySelectorAll('[data-member]')).find(row => row.dataset.member === focused)?.focus({ preventScroll: true });
}

function updateCard(bot) {
  let card = cards.get(bot.id);
  if (!card) {
    const panel = node('article', undefined, 'panel operation-card');
    const heading = node('div', undefined, 'card-head'), state = badge();
    heading.append(node('h3', bot.name), state);
    const meta = node('div', undefined, 'operation-meta');
    const buttons = node('div', undefined, 'card-actions');
    card = { state, meta, controls: new Map() };
    const details = node('button', 'รายละเอียด', 'quiet');
    details.type = 'button';
    details.addEventListener('click', () => openBot(card.current));
    buttons.append(details);
    const offered = bot.role === 'merchant' ? ['restart', 'stop', 'start'] : ['restart', 'destination'];
    if (bot.controls !== false) for (const action of offered) {
      const button = node('button', actions[action][0], 'quiet');
      button.type = 'button';
      button.addEventListener('click', () => showAction(card.current, action));
      card.controls.set(action, button);
      buttons.append(button);
    }
    panel.append(heading, meta, buttons);
    $('bots').append(panel);
    cards.set(bot.id, card);
  }
  card.current = bot;
  setBadge(card.state, bot.state);
  card.meta.replaceChildren(
    node('span', ['Lv. ' + display(bot.level), display(bot.map)].join(' · ')),
    node('span', display(bot.merchant?.state ?? bot.mission ?? bot.goal)),
  );
  for (const [action, button] of card.controls) {
    const offline = bot.state === 'offline';
    button.hidden = action === 'start' ? !offline : action === 'stop' ? offline : false;
    button.disabled = sending || (action === 'destination' && bot.state !== 'online') ||
      (action === 'restart' && ['starting', 'stopping', 'unavailable'].includes(bot.state));
  }
}

function warRow(war, finished) {
  const row = node(finished ? 'li' : 'div', undefined, 'field-row');
  const combatants = [war.attacker ?? 'ไม่ทราบฝ่ายบุก', war.defender ?? 'ไม่มีฝ่ายตั้งรับ'];
  const outcome = finished ? (war.winner ? 'ชนะ ' + war.winner : 'ไม่มีผู้ชนะ') + ' · ' + eventDate.format(new Date(war.ended)) :
    'เริ่ม ' + clock.format(new Date(war.started));
  row.append(node('span', display(war.site), 'field-main'), node('span', combatants.join(' / ')),
    node('span', outcome, 'field-outcome'));
  return row;
}
function renderWars(guilds) {
  const wars = data.wars;
  const startTimes = [...guilds.values()].flat().map(bot => bot.campaign?.nextAt)
    .filter(time => Number.isFinite(time) && time > Date.parse(data.time));
  $('war-next').textContent = startTimes.length ? 'คุ้มครองหมดเร็วที่สุด ' + eventDate.format(new Date(Math.min(...startTimes))) + ' น.' : '';
  $('war-count').textContent = wars ? display(wars.active.length) : '—';
  $('war-summary').textContent = wars ? (wars.active.length ? 'กำลังรบ' : 'ยังไม่มีสนามเปิด') : 'รอทะเบียนศึก';
  $('war-live').replaceChildren(...(wars?.active.length
    ? wars.active.map(war => warRow(war, false))
    : [node('p', wars ? 'ขณะนี้ไม่มีศึกเปิด' : 'อ่านทะเบียนศึกไม่ได้')]));
  $('war-results').replaceChildren(...(wars?.recent.length
    ? wars.recent.map(war => warRow(war, true))
    : [node('li', wars ? 'ยังไม่มีผลศึก' : 'อ่านผลศึกไม่ได้', 'empty')]));
}
function renderReserves(reserves) {
  $('reserves').hidden = !reserves.length;
  $('reserve-count').textContent = reserves.filter(bot => bot.state === 'online').length + ' / ' + reserves.length + ' ออนไลน์';
  const focused = document.activeElement?.dataset.member;
  $('reserve-list').replaceChildren(...reserves.map(memberRow));
  if (focused) Array.from($('reserve-list').querySelectorAll('[data-member]')).find(row => row.dataset.member === focused)?.focus({ preventScroll: true });
}

function renderEvents() {
  const bots = new Map(data?.bots.map(bot => [bot.id, bot.name]));
  const bot = $('bot-filter').value, category = $('category-filter').value;
  const events = (data?.events ?? []).filter(row => (!bot || row.bot === bot) && (!category || row.category === category)).slice(0, 45);
  $('empty').hidden = events.length > 0;
  $('events').replaceChildren(...events.map(row => {
    const item = node('li');
    const time = node('time', eventDate.format(new Date(row.time)));
    time.dateTime = row.time;
    const details = [row.tool, row.map ?? row.site, row.item, row.skill, row.side, row.mission, row.goal,
      row.reason, row.destination ?? row.target].filter(Boolean).map(display);
    if (row.type === 'operator_action' && Object.hasOwn(actions, row.action)) details.push(actions[row.action][0]);
    if (row.outcome) details.push(display(row.outcome));
    if (row.rank != null) details.push('+' + row.rank);
    if (row.quantity != null) details.push('×' + row.quantity);
    if (row.price != null) details.push(display(row.price) + ' ทอง');
    if (row.success != null) details.push(row.success ? 'สำเร็จ' : 'ไม่สำเร็จ');
    const summary = node('div', eventNames[row.type] ?? display(row.type));
    if (details.length) summary.append(node('small', details.join(' · ')));
    item.append(time, node('span', bots.get(row.bot) ?? '—', 'event-name'), summary);
    return item;
  }));
}

function render() {
  const { guilds, reserves, operations } = groupBots();
  const field = [...guilds.values()].flat();
  const online = field.filter(bot => bot.state === 'online' && bot.guild === bot.assignedGuild);
  $('online-count').textContent = online.length + ' / ' + field.length;
  $('guild-count').textContent = guilds.size ? guilds.size + ' กิลด์' : 'รอข้อมูลกิลด์';
  $('game-state').textContent = data.game ? 'ตอบสนอง' : 'ไม่ตอบสนอง';
  $('party-state').textContent = display(data.team?.state);
  $('updated').textContent = clock.format(new Date(data.time));
  setChoices($('guild-filter'), [...guilds.keys()].map(name => [name, name]));
  setChoices($('class-filter'), [...new Set(field.map(bot => bot.profession).filter(Boolean))].map(id => [id, display(id)]));
  setChoices($('bot-filter'), data.bots.map(bot => [bot.id, bot.name]));
  renderWars(guilds);
  renderGuilds(guilds);
  operations.forEach(updateCard);
  renderReserves(reserves);
  if ($('bot-dialog').open) updateDetails();
  renderEvents();
}

function lock() {
  clearTimeout(timer);
  activeRead?.abort();
  key = '';
  data = undefined;
    dirtyRead = false;
  $('bot-dialog').close();
  $('action-dialog').close();
  selectedBot = null;
  for (const id of ['guild-grid', 'reserve-list', 'war-results', 'war-live']) $(id).replaceChildren();
  for (const id of ['guild-filter', 'class-filter', 'bot-filter']) setChoices($(id), []);
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
    if (dirtyRead) { announce(''); dirtyRead = false; }
    connection('online', 'เชื่อมต่อ VPS');
    render();
  } catch (error) {
    if (!key || activeRead !== controller) return;
    if (error.message === 'invalid_key') lock();
    else {
      if (!data) key = '';
      dirtyRead = true;
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
$('guild-filter').addEventListener('change', () => data && renderGuilds(groupBots().guilds));
$('class-filter').addEventListener('change', () => data && renderGuilds(groupBots().guilds));
$('close-bot').addEventListener('click', () => $('bot-dialog').close());
$('filter-by-bot').addEventListener('click', () => {
  if (selectedBot) $('bot-filter').value = selectedBot;
  $('bot-dialog').close();
  renderEvents();
  $('activity').scrollIntoView();
  $('bot-filter').focus({ preventScroll: true });
});
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
