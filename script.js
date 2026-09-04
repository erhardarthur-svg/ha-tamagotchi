const canvas=document.getElementById('village');
const ctx=canvas.getContext('2d');
const clock=document.getElementById('clock');
const dateLabel=document.getElementById('dateLabel');
const periodLabel=document.getElementById('periodLabel');
const weatherLabel=document.getElementById('weatherLabel');
const eventText=document.getElementById('eventText');
const autoBtn=document.getElementById('autoBtn');
const chaosBtn=document.getElementById('chaosBtn');

const W=960,H=540,TILE=24;
let mode='auto',forcedHour=null,weather='sunny',tick=0,lastTs=0,eventTimer=0,currentEvent='Le village s’éveille...';
let lightning=0;

const WEATHER_LABELS={sunny:'Ensoleillé',cloudy:'Nuageux',rainy:'Pluie',stormy:'Orage',snowy:'Neige',foggy:'Brouillard'};
const PERIOD_LABELS={morning:'Matin',day:'Journée',evening:'Soirée',night:'Nuit'};

const roads=[
  {x:0,y:10,w:40,h:3},{x:18,y:0,w:3,h:23},{x:7,y:5,w:3,h:13},{x:29,y:7,w:3,h:16}
];

const buildings=[
  {x:2,y:2,w:5,h:4,type:'house',roof:'#7c4d3e',wall:'#b88b61',name:'Maison A'},
  {x:10,y:2,w:6,h:5,type:'inn',roof:'#5e463b',wall:'#a98664',name:'Auberge'},
  {x:22,y:2,w:5,h:4,type:'house',roof:'#6b4b55',wall:'#b79a78',name:'Maison B'},
  {x:33,y:2,w:5,h:5,type:'barn',roof:'#754039',wall:'#9c714b',name:'Grange'},
  {x:2,y:14,w:5,h:5,type:'house',roof:'#654846',wall:'#a88469',name:'Maison C'},
  {x:11,y:14,w:6,h:5,type:'workshop',roof:'#4e5153',wall:'#8a7c67',name:'Atelier'},
  {x:22,y:14,w:5,h:5,type:'house',roof:'#705447',wall:'#b69576',name:'Maison D'},
  {x:33,y:14,w:5,h:5,type:'hall',roof:'#44505b',wall:'#8a9590',name:'Salle commune'}
];

const trees=[];
for(let i=0;i<38;i++){
  const x=Math.floor(Math.random()*39),y=Math.floor(Math.random()*21);
  if(roads.some(r=>x>=r.x-1&&x<r.x+r.w+1&&y>=r.y-1&&y<r.y+r.h+1)) continue;
  if(buildings.some(b=>x>=b.x-1&&x<b.x+b.w+1&&y>=b.y-1&&y<b.y+b.h+1)) continue;
  trees.push({x:x*TILE+12,y:y*TILE+12,s:0.75+Math.random()*0.45});
}

const villagers=[
  {name:'Arthur',x:160,y:300,color:'#d6b36c',tx:160,ty:300,speed:26,task:'marche'},
  {name:'Lina',x:380,y:145,color:'#c77878',tx:380,ty:145,speed:23,task:'marche'},
  {name:'Milo',x:650,y:300,color:'#74a9c9',tx:650,ty:300,speed:22,task:'marche'},
  {name:'Nora',x:785,y:185,color:'#8fc47b',tx:785,ty:185,speed:24,task:'marche'},
  {name:'Ezra',x:520,y:420,color:'#b697d4',tx:520,ty:420,speed:25,task:'marche'},
  {name:'Sami',x:250,y:430,color:'#d98d5f',tx:250,ty:430,speed:21,task:'marche'}
];

const animals=[
  {kind:'chicken',x:810,y:88,dx:14,phase:0},
  {kind:'chicken',x:846,y:105,dx:-12,phase:1.7},
  {kind:'dog',x:118,y:382,dx:17,phase:2.4}
];

const smoke=[{x:126,y:75,p:0},{x:390,y:78,p:1.2},{x:858,y:80,p:2.2}];

function getPeriod(hour){if(hour>=6&&hour<10)return'morning';if(hour>=10&&hour<18)return'day';if(hour>=18&&hour<22)return'evening';return'night'}
function getHour(){return mode==='auto'?new Date().getHours():(forcedHour??12)}

function setEvent(text,duration=8){currentEvent=text;eventText.textContent=text;eventTimer=duration}

function chooseTarget(v){
  const hour=getHour(),period=getPeriod(hour);
  if(period==='night'){
    const beds=[[90,105],[280,110],[565,110],[90,405],[560,405],[835,405]];
    const b=beds[villagers.indexOf(v)%beds.length];v.tx=b[0];v.ty=b[1];v.task='dort';return;
  }
  const points=[[90,270],[240,270],[455,270],[700,270],[850,270],[455,390],[250,390],[720,390],[450,150],[800,160]];
  const p=points[Math.floor(Math.random()*points.length)];v.tx=p[0];v.ty=p[1];
  const tasks=['marche','discute','travaille','promène'];v.task=tasks[Math.floor(Math.random()*tasks.length)];
}

function updateVillagers(dt){
  for(const v of villagers){
    const dx=v.tx-v.x,dy=v.ty-v.y,d=Math.hypot(dx,dy);
    if(d<5){if(Math.random()<dt*0.35)chooseTarget(v);continue}
    v.x+=dx/d*v.speed*dt;v.y+=dy/d*v.speed*dt;
  }
}

function updateAnimals(dt){for(const a of animals){a.x+=a.dx*dt;if(a.x<55||a.x>905)a.dx*=-1;a.phase+=dt*4}}

function palette(period){
  if(period==='night')return{grass:'#233a2d',grass2:'#2b4937',road:'#554d45',water:'#19364e',shade:'rgba(8,15,28,.56)',light:'#ffd37a'};
  if(period==='evening')return{grass:'#5b7b4c',grass2:'#6a8d57',road:'#897764',water:'#486b7f',shade:'rgba(74,39,56,.22)',light:'#ffd37a'};
  if(period==='morning')return{grass:'#6e9158',grass2:'#7da367',road:'#98866f',water:'#5f8da1',shade:'rgba(255,217,161,.07)',light:'#ffe29b'};
  return{grass:'#73975b',grass2:'#81a667',road:'#9a886f',water:'#5e90a3',shade:'rgba(0,0,0,0)',light:'#fff2b2'};
}

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}

function drawGround(p){
  rect(0,0,W,H,p.grass);
  for(let y=0;y<H;y+=TILE)for(let x=0;x<W;x+=TILE){if((x/TILE+y/TILE)%2===0){ctx.fillStyle=p.grass2;ctx.globalAlpha=.13;ctx.fillRect(x,y,TILE,TILE);ctx.globalAlpha=1}}
  roads.forEach(r=>rect(r.x*TILE,r.y*TILE,r.w*TILE,r.h*TILE,p.road));
  // river bottom-right
  ctx.fillStyle=p.water;ctx.beginPath();ctx.moveTo(690,540);ctx.bezierCurveTo(715,470,790,470,815,405);ctx.bezierCurveTo(838,350,900,355,960,330);ctx.lineTo(960,540);ctx.closePath();ctx.fill();
  // bridge
  for(let i=0;i<8;i++)rect(790+i*16,388+i*2,14,45,'#82664b');
  // plaza
  rect(420,225,120,90,'#a08e76');
  for(let y=235;y<305;y+=16)for(let x=430;x<530;x+=16)rect(x,y,8,8,'rgba(255,255,255,.08)');
  // well
  rect(466,255,28,20,'#59626a');rect(470,248,20,10,'#707b83');rect(478,240,4,10,'#4d4137');
  // farm plots
  for(let i=0;i<7;i++){rect(770,145+i*12,120,7,i%2?'#76563c':'#674a35');for(let j=0;j<8;j++)rect(778+j*14,142+i*12,4,4,'#7fad62')}
}

function drawTree(t,period){
  ctx.save();ctx.translate(t.x,t.y);ctx.scale(t.s,t.s);rect(-3,8,6,15,'#5d4534');
  const c=period==='night'?'#244d32':'#356b3d';const c2=period==='night'?'#2d5d3b':'#43834a';
  rect(-12,-4,24,18,c);rect(-8,-12,16,16,c2);rect(-15,2,12,12,c2);ctx.restore();
}

function drawBuilding(b,period,p){
  const x=b.x*TILE,y=b.y*TILE,w=b.w*TILE,h=b.h*TILE;
  rect(x+4,y+10,w-8,h-14,b.wall);rect(x,y,w,18,b.roof);rect(x+8,y+18,w-16,4,'rgba(0,0,0,.12)');
  // roof ridges
  for(let rx=x+8;rx<x+w-4;rx+=16)rect(rx,y+3,2,12,'rgba(255,255,255,.07)');
  const lit=period==='night'||period==='evening';
  rect(x+10,y+h-35,17,19,lit?p.light:'#6c9eb2');rect(x+w-28,y+h-35,17,19,lit?p.light:'#6c9eb2');
  rect(x+w/2-8,y+h-30,16,30,'#54463c');
  if(b.type==='inn'){rect(x+8,y+h-10,20,5,'#7a3f36');rect(x+w-30,y+h-10,20,5,'#7a3f36')}
  if(b.type==='barn'){rect(x+w/2-18,y+h-38,36,38,'#5e4938');ctx.strokeStyle='#8d6b4e';ctx.lineWidth=3;ctx.strokeRect(x+w/2-18,y+h-38,36,38);ctx.beginPath();ctx.moveTo(x+w/2-18,y+h-38);ctx.lineTo(x+w/2+18,y+h);ctx.moveTo(x+w/2+18,y+h-38);ctx.lineTo(x+w/2-18,y+h);ctx.stroke()}
  if(b.type==='workshop'){rect(x+12,y+26,24,8,'#4b5257');rect(x+16,y+18,16,8,'#727b80')}
}

function drawSmoke(s,dt){
  const period=getPeriod(getHour());if(period==='day'&&weather==='sunny'&&Math.random()<.003)return;
  s.p+=dt*.45;for(let i=0;i<4;i++){const yy=s.y-((s.p*36+i*13)%60);const xx=s.x+Math.sin(s.p*2+i)*6;ctx.fillStyle=`rgba(210,215,218,${0.18-i*.03})`;ctx.beginPath();ctx.arc(xx,yy,5+i*1.5,0,Math.PI*2);ctx.fill()}
}

function drawVillager(v,period){
  const sleeping=v.task==='dort'&&period==='night';
  ctx.save();ctx.translate(v.x,v.y);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,8,8,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=v.color;ctx.fillRect(-5,-8,10,12);ctx.fillStyle='#d5b18d';ctx.fillRect(-4,-13,8,6);ctx.fillStyle='#2c2a28';ctx.fillRect(-4,-13,8,2);
  if(sleeping){ctx.fillStyle='#dbe8ff';ctx.font='10px monospace';ctx.fillText('z',8,-12)}ctx.restore();
}

function drawAnimal(a){ctx.save();ctx.translate(a.x,a.y+Math.sin(a.phase)*1.5);ctx.fillStyle=a.kind==='dog'?'#8a674d':'#e8dfc8';ctx.fillRect(-5,-4,10,7);ctx.fillRect(a.dx>0?3:-6,-7,5,5);ctx.fillStyle='#3a2c24';ctx.fillRect(a.dx>0?6:-6,-6,2,2);ctx.restore()}

function drawWeather(dt,period){
  if(weather==='rainy'||weather==='stormy'){
    ctx.strokeStyle=weather==='stormy'?'rgba(170,205,235,.75)':'rgba(180,220,245,.65)';ctx.lineWidth=1;
    for(let i=0;i<120;i++){const x=(i*79+tick*180)%W,y=(i*47+tick*300)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+12);ctx.stroke()}
  }
  if(weather==='snowy'){
    ctx.fillStyle='rgba(245,250,255,.9)';for(let i=0;i<80;i++){const x=(i*113+tick*24)%W,y=(i*67+tick*55)%H;ctx.fillRect(x,y,2+(i%3),2+(i%3))}
  }
  if(weather==='foggy'){ctx.fillStyle='rgba(215,225,222,.22)';for(let i=0;i<5;i++){const x=((tick*25+i*230)%1250)-180;ctx.fillRect(x,50+i*85,330,38)}}
  if(weather==='stormy'){
    if(Math.random()<dt*.035)lightning=.16;
    if(lightning>0){ctx.fillStyle='rgba(240,248,255,.48)';ctx.fillRect(0,0,W,H);lightning-=dt}
  }
}

function drawDayNightOverlay(period,p){if(p.shade!=='rgba(0,0,0,0)'){ctx.fillStyle=p.shade;ctx.fillRect(0,0,W,H)}}

function updateUI(){
  const now=new Date(),hour=getHour(),period=getPeriod(hour);clock.textContent=`${String(hour).padStart(2,'0')}:${String(mode==='auto'?now.getMinutes():0).padStart(2,'0')}`;
  periodLabel.textContent=PERIOD_LABELS[period];weatherLabel.textContent=WEATHER_LABELS[weather];dateLabel.textContent=now.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'});
}

function randomEvent(){
  const events=[
    ()=>{setEvent('Le chien traverse la place en courant.');animals.find(a=>a.kind==='dog').dx*=1.8},
    ()=>{setEvent('Deux villageois discutent près du puits.');villagers[0].tx=470;villagers[0].ty=275;villagers[1].tx=490;villagers[1].ty=275},
    ()=>{setEvent('Quelqu’un apporte des provisions à l’auberge.');villagers[2].tx=310;villagers[2].ty=155},
    ()=>{setEvent('De la fumée s’élève des cheminées.');},
    ()=>{setEvent('Les poules se sont encore échappées de la ferme.');animals.filter(a=>a.kind==='chicken').forEach(a=>a.dx*=1.7)},
    ()=>{setEvent('La cloche de la salle commune retentit.');villagers.forEach(v=>{v.tx=840;v.ty=410})},
    ()=>{setEvent(weather==='rainy'?'Tout le monde cherche un abri.':'Le marché s’anime sur la place.');villagers.forEach((v,i)=>{v.tx=440+(i%3)*34;v.ty=245+Math.floor(i/3)*36})}
  ];events[Math.floor(Math.random()*events.length)]();
}

function updateEvents(dt){eventTimer-=dt;if(eventTimer<=0&&Math.random()<dt*.04)randomEvent()}

function render(ts){
  const dt=Math.min(.04,(ts-lastTs)/1000||.016);lastTs=ts;tick+=dt;
  const period=getPeriod(getHour()),p=palette(period);
  updateVillagers(dt);updateAnimals(dt);updateEvents(dt);updateUI();
  drawGround(p);trees.forEach(t=>drawTree(t,period));buildings.forEach(b=>drawBuilding(b,period,p));smoke.forEach(s=>drawSmoke(s,dt));
  animals.forEach(drawAnimal);villagers.forEach(v=>drawVillager(v,period));drawWeather(dt,period);drawDayNightOverlay(period,p);
  requestAnimationFrame(render);
}

function activate(btn){document.querySelectorAll('button').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')}

document.querySelectorAll('[data-hour]').forEach(btn=>btn.addEventListener('click',()=>{mode='test';forcedHour=Number(btn.dataset.hour);villagers.forEach(chooseTarget);activate(btn);setEvent(`Heure de test : ${btn.textContent}.`,4)}));
document.querySelectorAll('[data-weather]').forEach(btn=>btn.addEventListener('click',()=>{weather=btn.dataset.weather;activate(btn);setEvent(`Météo de test : ${WEATHER_LABELS[weather]}.`,4)}));
autoBtn.addEventListener('click',()=>{mode='auto';forcedHour=null;activate(autoBtn);villagers.forEach(chooseTarget);setEvent('Mode automatique activé.',4)});
chaosBtn.addEventListener('click',()=>randomEvent());

villagers.forEach(chooseTarget);activate(autoBtn);requestAnimationFrame(render);
