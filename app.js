const $=s=>document.querySelector(s);
const TZ='Asia/Jakarta', FESTIVAL='2026-08-08', FESTIVAL_START=new Date('2026-08-08T15:15:00+07:00'), FESTIVAL_END=new Date('2026-08-09T01:00:00+07:00');
const inFestivalWindow=()=>state.now>=FESTIVAL_START&&state.now<FESTIVAL_END;
const min=t=>{const [h,m]=t.split('.').map(Number);return h*60+m};
const pad=n=>String(n).padStart(2,'0');
const timeLabel=n=>`${pad(Math.floor(n/60)%24)}.${pad(n%60)}`;
const clockLabel=d=>new Intl.DateTimeFormat('id-ID',{timeZone:TZ,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(d).replaceAll(':','.');
const localDate=(time,next=false)=>new Date(`${FESTIVAL}T${time.replace('.',':')}:00+07:00${next?'':''}`);
const PRAYERS=[['04.42','Subuh'],['11.58','Dzuhur'],['15.20','Ashar'],['17.55','Maghrib'],['19.06','Isya']];
const prayerOn=()=>localStorage.getItem('tsp-prayers')!=='off';
const state={events:[],prayers:[],prayerVisible:prayerOn(),picked:new Set(JSON.parse(localStorage.getItem('tsp-day2')||'[]')),now:new Date()};
const overlap=(a,b)=>a.start<b.end&&b.start<a.end;
const isFestivalDay=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(state.now);return `${p.find(x=>x.type==='year').value}-${p.find(x=>x.type==='month').value}-${p.find(x=>x.type==='day').value}`===FESTIVAL};
const eventDate=e=>localDate(e.time);
function build(data){state.events=data.stages.flatMap((s,si)=>s.events.map(([time,artist],i)=>{const start=min(time),next=s.events[i+1]?.[0],end=next?min(next):1500,dateStart=eventDate({time});return{id:`${si}-${i}`,stage:s.name,time,artist,start,end,dateStart,dateEnd:new Date(dateStart.getTime()+(end-start)*60000)}}));
  state.prayers=PRAYERS.map(([time,name],i)=>{const dateStart=eventDate({time}),start=min(time),end=PRAYERS[i+1]?min(PRAYERS[i+1][0]):1500;return{id:`prayer-${i}`,stage:'Waktu sholat',time,artist:name,start,end,dateStart,dateEnd:new Date(dateStart.getTime()+(end-start)*60000),prayer:true}});
  state.picked=new Set([...state.picked].filter(id=>state.events.some(e=>e.id===id)));
}
function past(e){return state.now>=e.dateEnd&&state.now>=FESTIVAL_START}
function live(e){return inFestivalWindow()&&state.now>=e.dateStart&&state.now<e.dateEnd}
function upcoming(e){return !past(e)&&state.now<e.dateStart&&state.now<FESTIVAL_END}
function render(){
  const groups={}; [...state.events,...(state.prayerVisible?state.prayers:[])].forEach(e=>(groups[e.time]??=[]).push(e));
  const liveItems=state.events.filter(live);const currentMarker=liveItems.length?liveItems.reduce((a,b)=>a.start>b.start?a:b).time:null;
  $('#timeline').innerHTML=Object.entries(groups).sort(([a],[b])=>min(a)-min(b)).map(([time,items])=>{const currentSlot=time===currentMarker;return `<div class="slot ${currentSlot?'slot-current':''}"><time class="rail">${time}</time><div class="rail-track" aria-hidden="true"><i class="timeline-dot ${currentSlot?'dot-live':''}"></i>${currentSlot?'<span class="now-marker">SEKARANG</span>':''}</div><div class="slot-events">${items.map(e=>{if(e.prayer)return `<div class="event prayer ${live(e)?'is-live':''} ${past(e)?'is-past':''}" role="note" aria-label="Waktu sholat ${e.artist}, ${e.time} sampai ${timeLabel(e.end)}${past(e)?', sudah lewat':''}"><small>WAKTU SHOLAT · ${e.time}–${timeLabel(e.end)}</small><strong>◒ ${e.artist}</strong><em>${past(e)?'Sudah lewat · tidak dapat dipilih':'Rentang waktu · tidak mengunci rute'}</em></div>`;const chosen=state.picked.has(e.id),done=past(e),blocked=!chosen&&[...state.picked].some(id=>{const q=state.events.find(x=>x.id===id);return q&&overlap(e,q)});const locked=done||blocked;return `<button class="event ${chosen?'chosen':''} ${done?'is-past':''} ${live(e)?'is-live':''} ${blocked?'blocked':''}" data-id="${e.id}" ${locked?'disabled':''} aria-pressed="${chosen}" aria-label="${e.stage} · ${e.time}–${timeLabel(e.end)} ${e.artist}${done?' · selesai':''}"><small>${e.stage} · ${e.time}–${timeLabel(e.end)}</small><strong>${e.artist}</strong>${done?'<em>Selesai</em>':blocked?'<em>Bentrok dengan rute</em>':live(e)?'<em>Live sekarang</em>':''}</button>`}).join('')}</div></div>`}).join('');
  document.querySelectorAll('.event[data-id]').forEach(b=>b.onclick=()=>toggle(b.dataset.id));
  const picked=state.events.filter(e=>state.picked.has(e.id)).sort((a,b)=>a.start-b.start);
  $('#route-count').textContent=`${picked.length} set`;$('#route-detail').textContent=picked.length?`${timeLabel(picked[0].start)}–${timeLabel(picked.at(-1).end)} · bentrok terkunci`:'Pilih set yang ingin ditonton.';
  $('#chips').innerHTML=picked.map(e=>`<button class="chip ${past(e)?'chip-done':''}" data-id="${e.id}" type="button" ${past(e)?'disabled':''}>${e.time} · ${e.artist} ${past(e)?'✓':'×'}</button>`).join('');document.querySelectorAll('.chip:not(:disabled)').forEach(b=>b.onclick=()=>toggle(b.dataset.id));
  const lo=915,hi=1500,last=picked.at(-1)?.end??lo;$('#route-progress-fill').style.width=`${Math.max(0,Math.min(100,(last-lo)/(hi-lo)*100))}%`;
  const current=state.events.filter(live), next=state.events.filter(upcoming).sort((a,b)=>a.dateStart-b.dateStart)[0];
  $('#current').textContent=current[0]?.artist??(state.now>=FESTIVAL_END?'Selesai malam ini':state.now<FESTIVAL_START?'Belum dimulai':'Tidak ada set aktif');$('#current-meta').textContent=current[0]?`${current[0].stage} · sampai ${timeLabel(current[0].end)}`:state.now>=FESTIVAL_END?'Semua set selesai':state.now<FESTIVAL_START?'Mulai 15.15 WIB':'Menunggu set berikutnya';
  $('#next').textContent=next?.artist??'Tidak ada lagi';$('#next-meta').textContent=next?`${next.stage} · ${next.time} WIB`:'Program selesai';$('#live-label').textContent=current.length?'Sedang berlangsung':next?'Menunggu set berikutnya':'Selesai';
  if(current[0])$('#now-progress').style.width=`${Math.max(0,Math.min(100,(state.now-current[0].dateStart)/(current[0].dateEnd-current[0].dateStart)*100))}%`;else $('#now-progress').style.width='0%';
  $('#event-count').textContent=`${state.events.length} SET · ${dataStageCount()} STAGE`;
}
function dataStageCount(){return new Set(state.events.map(e=>e.stage)).size}
function toggle(id){const e=state.events.find(x=>x.id===id);if(!e||past(e))return;state.picked.has(id)?state.picked.delete(id):state.picked.add(id);save();render()}
function save(){localStorage.setItem('tsp-day2',JSON.stringify([...state.picked]))}
function reset(){state.picked.clear();save();render()}
function tick(){state.now=new Date();$('#clock').textContent=clockLabel(state.now);render()}
fetch('data/schedule.json').then(r=>{if(!r.ok)throw Error('schedule');return r.json()}).then(data=>{build(data);$('#reset').onclick=reset;$('#clear').onclick=reset;const prayerToggle=$('#prayer-toggle');const syncPrayerButton=()=>{prayerToggle.textContent=`Sholat: ${state.prayerVisible?'on':'off'}`;prayerToggle.setAttribute('aria-pressed',String(state.prayerVisible))};prayerToggle.onclick=()=>{state.prayerVisible=!state.prayerVisible;localStorage.setItem('tsp-prayers',state.prayerVisible?'on':'off');syncPrayerButton();render()};syncPrayerButton();tick();setInterval(tick,1000)}).catch(()=>{$('#timeline').textContent='Schedule gagal dimuat.'});
window.__planner={state,render,toggle,past};
// ponytail: timezone is fixed to Asia/Jakarta so device locale cannot shift concert times.
// Compatibility for older browsers without Object.groupBy is unnecessary; groups use plain objects.
