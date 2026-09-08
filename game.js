const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;

const W=960,H=640,WORLD_W=1920,WORLD_H=1280,keys={};
let last=0,collected=0,dialogueOpen=false,gameStarted=false,endingShown=false,time=0;
const world=new Image();
world.src='assets/world.svg';

const player={x:960,y:820,speed:175,dir:0,walk:0,moving:false};
const boy={x:1080,y:820};
const hearts=[
 {x:650,y:420,text:'I love the way you make ordinary days feel special.'},
 {x:1340,y:330,text:'You make me feel safe enough to be completely myself.'},
 {x:500,y:965,text:'Even when we are doing absolutely nothing, I still love being with you.'},
 {x:1510,y:940,text:'If I could, I would save every good memory with you in a little jar.'},
 {x:980,y:560,text:'And if you ever forget: you are so, so loved.'}
];
const particles=Array.from({length:48},(_,i)=>({x:70+(i*137)%1780,y:70+(i*83)%1130,phase:i*1.7,size:1+(i%2)}));
const $=id=>document.getElementById(id);

addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();keys[k]=true;
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function show(id){$(id)?.classList.remove('hidden');}
function hide(id){$(id)?.classList.add('hidden');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function worldToScreen(x,y){return[x-player.x+W/2,y-player.y+H/2];}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

function startGame(){
 gameStarted=true;endingShown=false;hide('title-screen');show('game-hud');
 player.x=960;player.y=820;player.walk=0;player.dir=0;
 collected=0;
 hearts.splice(0,hearts.length,
  {x:650,y:420,text:'I love the way you make ordinary days feel special.'},
  {x:1340,y:330,text:'You make me feel safe enough to be completely myself.'},
  {x:500,y:965,text:'Even when we are doing absolutely nothing, I still love being with you.'},
  {x:1510,y:940,text:'If I could, I would save every good memory with you in a little jar.'},
  {x:980,y:560,text:'And if you ever forget: you are so, so loved.'}
 );
 $('heart-count').textContent='0';
 closeDialogue();hide('ending');
}
function showDialogue(s,m){dialogueOpen=true;$('speaker').textContent=s;$('message').textContent=m;show('dialogue');}
function closeDialogue(){dialogueOpen=false;hide('dialogue');}
function revealEnding(){
 if(endingShown)return;
 endingShown=true;
 setTimeout(()=>show('ending'),350);
}

// Keep the player out of major landmarks and the pond while preserving free exploration.
function blocked(x,y){
 if(x<42||y<55||x>WORLD_W-42||y>WORLD_H-38)return true;
 // cabin footprint + porch
 if(x>750&&x<1215&&y>225&&y<565)return true;
 // pond body
 const px=480,py=820,rx=275,ry=190;
 if(((x-px)/rx)**2+((y-py)/ry)**2<1)return true;
 // well
 if(Math.abs(x-1510)<62&&Math.abs(y-635)<52)return true;
 // cart
 if(x>335&&x<495&&y>705&&y<825)return true;
 // campfire stones
 if(Math.abs(x-980)<65&&Math.abs(y-760)<58)return true;
 return false;
}

function drawCharacter(x,y,kind,walk){
 const [sx,sy]=worldToScreen(x,y);
 if(sx<-60||sx>W+60||sy<-80||sy>H+60)return;
 const bob=Math.sin(walk)*2;
 const isBoy=kind==='boy';
 const skin=isBoy?'#bd7a5a':'#c88462';
 const hair=isBoy?'#3a2c31':'#6d4035';
 const shirt=isBoy?'#5e5874':'#c95f4c';
 const pants=isBoy?'#4d566d':'#3f5661';
 ctx.save();ctx.translate(Math.round(sx),Math.round(sy));
 // soft ground shadow
 ctx.fillStyle='#294d3790';ctx.beginPath();ctx.ellipse(0,20,17,6,0,0,Math.PI*2);ctx.fill();
 // feet / legs
 ctx.fillStyle=pants;ctx.fillRect(-10,2+bob,8,17);ctx.fillRect(3,2-bob,8,17);
 ctx.fillStyle='#3c3030';ctx.fillRect(-12,17+bob,11,5);ctx.fillRect(2,17-bob,11,5);
 // torso
 ctx.fillStyle=shirt;ctx.fillRect(-15,-26+bob,30,31);
 // sleeves
 ctx.fillStyle=shirt;ctx.fillRect(-19,-21+bob,7,16);ctx.fillRect(13,-21-bob,7,16);
 // hands
 ctx.fillStyle=skin;ctx.fillRect(-20,-7+bob,7,7);ctx.fillRect(14,-7-bob,7,7);
 // neck + head
 ctx.fillStyle=skin;ctx.fillRect(-5,-29+bob,10,7);ctx.fillRect(-13,-49+bob,26,24);
 // hair silhouette
 ctx.fillStyle=hair;ctx.fillRect(-15,-53+bob,30,12);ctx.fillRect(-18,-48+bob,7,16);ctx.fillRect(11,-48+bob,7,13);
 if(!isBoy){ctx.fillRect(-4,-57+bob,10,7);ctx.fillRect(7,-55+bob,7,7);}
 // face
 ctx.fillStyle='#30272a';ctx.fillRect(-7,-39+bob,3,3);ctx.fillRect(5,-39+bob,3,3);
 ctx.fillStyle='#9f574c';ctx.fillRect(-2,-32+bob,5,2);
 // collar + tiny accessory
 ctx.fillStyle='#e7b75e';ctx.fillRect(-4,-25+bob,8,4);
 if(isBoy)ctx.fillRect(10,-20+bob,5,5);
 ctx.restore();
}

function drawHeart(h,t){
 const [x,y]=worldToScreen(h.x,h.y);
 if(x<-35||x>W+35||y<-40||y>H+40)return;
 const pulse=1+Math.sin(t*.004+h.x*.01)*.10;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(pulse,pulse);
 ctx.fillStyle='#5b3038';ctx.fillRect(-11,10,22,4);
 ctx.font='bold 30px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ed6674';ctx.fillText('♥',0,0);
 ctx.font='bold 13px monospace';ctx.fillStyle='#ffe9b0';ctx.fillText('✦',0,-19);
 ctx.restore();
}

function drawWorld(t){
 ctx.clearRect(0,0,W,H);
 const camX=clamp(player.x-W/2,0,WORLD_W-W);
 const camY=clamp(player.y-H/2,0,WORLD_H-H);
 if(world.complete&&world.naturalWidth)ctx.drawImage(world,Math.floor(camX),Math.floor(camY),W,H,0,0,W,H);
 else {ctx.fillStyle='#74a957';ctx.fillRect(0,0,W,H);}

 // Warm drifting light motes add the soft, illustrated feel from the references.
 particles.forEach(q=>{
   const [x,y]=worldToScreen(q.x,q.y);
   if(x<-8||x>W+8||y<-8||y>H+8)return;
   const a=.18+.18*Math.sin(t*.0013+q.phase);
   ctx.globalAlpha=a;ctx.fillStyle='#fff0ad';
   ctx.fillRect(Math.round(x+Math.sin(t*.0007+q.phase)*3),Math.round(y+Math.cos(t*.0009+q.phase)*3),q.size+1,q.size+1);
 });
 ctx.globalAlpha=1;

 hearts.forEach(h=>drawHeart(h,t));
 drawCharacter(boy.x,boy.y,'boy',Math.sin(t*.002)*.25);
 drawCharacter(player.x,player.y,'player',player.walk);

 // Vignette / cinematic frame
 const g=ctx.createLinearGradient(0,0,0,H);
 g.addColorStop(0,'rgba(17,34,25,.50)');g.addColorStop(.16,'rgba(17,34,25,0)');g.addColorStop(.82,'rgba(17,34,25,0)');g.addColorStop(1,'rgba(17,34,25,.48)');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

 if(gameStarted&&!dialogueOpen&&!endingShown&&dist(player,boy)<92){
   ctx.fillStyle='rgba(48,39,36,.92)';ctx.fillRect(W/2-103,H-61,206,31);
   ctx.fillStyle='#ffe8bd';ctx.font='800 10px Nunito,sans-serif';ctx.textAlign='center';
   ctx.fillText('SPACE  ·  TALK TO HIM',W/2,H-42);
 }
 ctx.textAlign='left';
}

function update(dt){
 time+=dt*1000;
 if(!gameStarted)return;
 if(dialogueOpen){
   if(keys[' ']||keys.enter){keys[' ']=false;keys.enter=false;closeDialogue();}
   return;
 }
 if(endingShown)return;

 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(dx&&dy){dx*=.707;dy*=.707;}
 player.moving=!!(dx||dy);
 if(player.moving){player.walk+=dt*10;player.dir=dx<0?1:dx>0?2:dy<0?3:0;}else player.walk=0;

 const nx=player.x+dx*player.speed*dt;
 const ny=player.y+dy*player.speed*dt;
 if(!blocked(nx,player.y))player.x=nx;
 if(!blocked(player.x,ny))player.y=ny;

 if(dist(player,boy)<78&&(keys[' ']||keys.enter)){
   keys[' ']=false;keys.enter=false;
   if(collected<5)showDialogue('your boy','You made it all the way here. Take your time. There are little pieces of my favorite thing hidden around this place. ♡');
   else {showDialogue('your boy','You found every little heart. Come here. I made this part just for you. ♡');revealEnding();}
   return;
 }

 for(let i=hearts.length-1;i>=0;i--){
   const h=hearts[i];
   if(Math.hypot(player.x-h.x,player.y-h.y)<38){
     const msg=h.text;
     hearts.splice(i,1);collected++;
     $('heart-count').textContent=collected;
     showDialogue('a little heart',msg);
     if(collected===5)setTimeout(()=>{if(!dialogueOpen)revealEnding();},900);
     break;
   }
 }
}

$('start-game').onclick=startGame;
$('new-game').onclick=startGame;
$('how-to').onclick=()=>show('help-panel');
$('credits-btn').onclick=()=>show('credits-panel');
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>hide(btn.dataset.close)));
$('restart').onclick=()=>location.reload();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide('help-panel');hide('credits-panel');}});
$('heart-count').textContent='0';

function render(t){drawWorld(t);requestAnimationFrame(render);}
requestAnimationFrame(render);
requestAnimationFrame(t=>{
 last=t;
 function loop(n){const dt=Math.min(.034,(n-last)/1000);last=n;update(dt);requestAnimationFrame(loop);}
 requestAnimationFrame(loop);
});
