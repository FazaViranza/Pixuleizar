const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const W=960,H=640,MW=1920,MH=1280,keys={};
let last=0,collected=0,dialogueOpen=false,gameStarted=false;
const world=new Image();world.src='assets/world.svg';
const player={x:960,y:820,speed:175,dir:0,walk:0};
const boy={x:1080,y:820};
const hearts=[
 {x:650,y:420,text:'I love the way you make ordinary days feel special.'},
 {x:1340,y:330,text:'You make me feel safe enough to be completely myself.'},
 {x:500,y:965,text:'Even when we are doing absolutely nothing, I still love being with you.'},
 {x:1510,y:940,text:'If I could, I would save every good memory with you in a little jar.'},
 {x:980,y:560,text:'And if you ever forget: you are so, so loved.'}
];
const particles=Array.from({length:42},(_,i)=>({x:100+(i*137)%1720,y:80+(i*83)%1060,phase:i*1.7}));
const $=id=>document.getElementById(id);

addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function show(id){$(id)?.classList.remove('hidden')}
function hide(id){$(id)?.classList.add('hidden')}
function startGame(){gameStarted=true;hide('title-screen');show('game-hud');player.x=960;player.y=820;collected=0;dialogueOpen=false;}
function showDialogue(s,m){dialogueOpen=true;$('speaker').textContent=s;$('message').textContent=m;show('dialogue')}
function closeDialogue(){dialogueOpen=false;hide('dialogue')}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function worldToScreen(x,y){return[x-player.x+W/2,y-player.y+H/2]}

function drawPlayer(x,y,walk,isBoy=false){
 const [sx,sy]=worldToScreen(x,y),bob=Math.sin(walk)*2;
 ctx.save();ctx.translate(Math.round(sx),Math.round(sy));
 ctx.fillStyle='#234b3a99';ctx.fillRect(-19,12,38,8);
 ctx.fillStyle='#3b3030';ctx.fillRect(-11,2+bob,9,17);ctx.fillRect(3,2-bob,9,17);
 ctx.fillStyle='#27252b';ctx.fillRect(-13,17+bob,11,5);ctx.fillRect(3,17-bob,11,5);
 ctx.fillStyle=isBoy?'#5c536f':'#b85d4f';ctx.fillRect(-15,-27+bob,30,31);
 ctx.fillStyle=isBoy?'#7387a1':'#6b8752';ctx.fillRect(-15,-27+bob,30,8);
 ctx.fillStyle='#bd7859';ctx.fillRect(-21,-22+bob,7,19);ctx.fillRect(14,-22-bob,7,19);
 ctx.fillStyle='#e3a071';ctx.fillRect(-22,-5+bob,8,7);ctx.fillRect(14,-5-bob,8,7);
 ctx.fillStyle=isBoy?'#382f36':'#633b32';ctx.fillRect(-15,-50+bob,30,24);ctx.fillRect(-19,-45+bob,7,17);ctx.fillRect(12,-47+bob,8,18);
 ctx.fillStyle='#c98261';ctx.fillRect(-12,-40+bob,24,16);
 ctx.fillStyle='#2b2427';ctx.fillRect(-7,-35+bob,3,3);ctx.fillRect(5,-35+bob,3,3);
 ctx.fillStyle=isBoy?'#3b3035':'#713f31';ctx.fillRect(-12,-45+bob,24,8);ctx.fillRect(-15,-42+bob,8,7);
 ctx.fillStyle='#f0c86c';ctx.fillRect(11,-20+bob,5,5);
 ctx.restore();
}

function drawHeart(h,t){
 const [x,y]=worldToScreen(h.x,h.y),pulse=1+Math.sin(t/210+h.x)*.08;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(pulse,pulse);
 ctx.fillStyle='#542f35';ctx.fillRect(-10,9,20,4);
 ctx.font='bold 30px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ed6674';ctx.fillText('♥',0,0);
 ctx.font='bold 13px monospace';ctx.fillStyle='#ffe9b0';ctx.fillText('✦',0,-19);ctx.restore();
}

function update(dt){
 if(!gameStarted)return;
 if(dialogueOpen){if(keys[' ']||keys.enter){keys[' ']=keys.enter=false;closeDialogue()}return}
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(dx&&dy){dx*=.707;dy*=.707}
 if(dx||dy){player.walk+=dt*10}else player.walk=0;
 player.x=clamp(player.x+dx*player.speed*dt,55,MW-55);player.y=clamp(player.y+dy*player.speed*dt,55,MH-55);
 if(Math.hypot(player.x-boy.x,player.y-boy.y)<70&&(keys[' ']||keys.enter)){keys[' ']=keys.enter=false;showDialogue('your boy','You made it all the way here. Come a little closer. ♡');return}
 for(let i=hearts.length-1;i>=0;i--){const h=hearts[i];if(Math.hypot(player.x-h.x,player.y-h.y)<34){const msg=h.text;hearts.splice(i,1);collected++;$('heart-count').textContent=collected;showDialogue('a little heart',msg);if(collected===5)setTimeout(()=>show('ending'),500);break}}
}

function draw(t){
 ctx.clearRect(0,0,W,H);
 const camX=clamp(player.x-W/2,0,MW-W),camY=clamp(player.y-H/2,0,MH-H);
 if(world.complete)ctx.drawImage(world,Math.floor(camX),Math.floor(camY),W,H,0,0,W,H);else{ctx.fillStyle='#74a957';ctx.fillRect(0,0,W,H)}
 // soft moving sunlight
 ctx.save();ctx.globalAlpha=.14;for(let i=0;i<12;i++){const px=((i*151-t*.008)%1100)-70,py=90+(i*79)%500;ctx.fillStyle='#fff0a0';ctx.fillRect(px,py,26,4);ctx.fillRect(px+8,py-7,4,18)}ctx.restore();
 // floating dust motes
 particles.forEach(q=>{const [x,y]=worldToScreen(q.x,q.y),a=.2+.14*Math.sin(t/700+q.phase);if(x>-10&&x<W+10&&y>-10&&y<H+10){ctx.globalAlpha=a;ctx.fillStyle='#fff4b7';ctx.fillRect(Math.round(x),Math.round(y+Math.sin(t/500+q.phase)*3),3,3)}});ctx.globalAlpha=1;
 hearts.forEach(h=>drawHeart(h,t));
 drawPlayer(boy.x,boy.y,Math.sin(t/500)*.2,true);
 drawPlayer(player.x,player.y,player.walk,false);
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#15251b88');g.addColorStop(.15,'transparent');g.addColorStop(.82,'transparent');g.addColorStop(1,'#15251b66');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(gameStarted&&!dialogueOpen&&Math.hypot(player.x-boy.x,player.y-boy.y)<95){ctx.fillStyle='#fff0c9';ctx.font='800 11px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('SPACE  •  TALK',W/2,H-25)}
 requestAnimationFrame(draw);
}

$('start-game').onclick=startGame;
$('new-game').onclick=startGame;
$('how-to').onclick=()=>show('help-panel');
$('credits-btn').onclick=()=>show('credits-panel');
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>hide(btn.dataset.close)));
$('restart').onclick=()=>location.reload();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide('help-panel');hide('credits-panel');}});
$('heart-count').textContent='0';
requestAnimationFrame(draw);
requestAnimationFrame(t=>{last=t;function loop(n){const dt=Math.min(.034,(n-last)/1000);last=n;update(dt);requestAnimationFrame(loop)}requestAnimationFrame(loop)});
