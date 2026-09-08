const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=960,H=640,T=32,MW=60,MH=40;const keys={};let last=0,collected=0,dialogueOpen=false,gameStarted=false;
const player={x:30*T,y:27*T,speed:150,dir:0,walk:0};
const hearts=[{x:7*T,y:9*T,text:'I love the way you make ordinary days feel special.'},{x:48*T,y:8*T,text:'You make me feel safe enough to be completely myself.'},{x:11*T,y:29*T,text:'Even when we are doing absolutely nothing, I still love being with you.'},{x:48*T,y:31*T,text:'If I could, I would save every good memory with you in a little jar.'},{x:30*T,y:18*T,text:'And if you ever forget: you are so, so loved.'}];
const trees=[];for(let i=0;i<95;i++){let x=((i*37)%56+2),y=((i*71)%34+2);if(x>18&&x<43&&y>8&&y<27)continue;trees.push({x:x*T,y:y*T,s:0.75+(i%4)*.12});}
const flowers=[];for(let i=0;i<180;i++)flowers.push({x:2*T+((i*83)%56)*T,y:2*T+((i*47)%34)*T,c:i%3});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const $=id=>document.getElementById(id);
function r(c,x,y,w,h){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function p(c,a){ctx.fillStyle=c;ctx.beginPath();a.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill()}
function tx(s,x,y,z=12,c='#fff'){ctx.font=`800 ${z}px monospace`;ctx.fillStyle=c;ctx.fillText(s,x,y)}
function ground(){r('#6eaa55',0,0,MW*T,MH*T);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if((x*17+y*31)%13===0)r('#78b85c',x*T+8,y*T+5,3,7);if((x*7+y*19)%29===0)r('#5d994d',x*T+22,y*T+18,2,5)}
 p('#5ca4ad',[[0,3*T],[MW*T,3*T],[MW*T,7*T],[48*T,6*T],[39*T,7*T],[28*T,5*T],[17*T,6*T],[0,5*T]]);for(let x=0;x<MW;x+=4)r('#91c8c2',x*T+8,4*T+(x%3)*5,28,3);
 p('#d1b174',[[0,26*T],[10*T,25*T],[20*T,27*T],[30*T,28*T],[40*T,27*T],[50*T,24*T],[60*T,23*T],[60*T,29*T],[48*T,31*T],[35*T,31*T],[20*T,29*T],[8*T,29*T],[0,30*T]]);
 p('#d8b979',[[29*T,0],[35*T,0],[34*T,15*T],[31*T,25*T],[27*T,24*T],[30*T,14*T]]);
}
function tree(x,y,s){let X=x,Y=y;r('#5a4635',X-5*s,Y,10*s,45*s);r('#806044',X-2*s,Y,5*s,39*s);const q=[[0,-25,25],[-20,-11,20],[20,-10,21],[-14,9,22],[13,9,24],[0,-42,18]];q.forEach((a,i)=>{r(i%2?'#2e6b43':'#285f3d',X+a[0]*s-18*s,Y+a[1]*s-18*s,36*s,36*s)});r('#3b7c4b',X-28*s,Y-17*s,14*s,10*s);r('#3b7c4b',X+12*s,Y-32*s,15*s,11*s);r('#193f31',X-9*s,Y-5*s,18*s,5*s)}
function bush(x,y,s=1){r('#245b3a',x-22*s,y-10*s,44*s,24*s);r('#317446',x-30*s,y-2*s,25*s,18*s);r('#397c4b',x+5*s,y-17*s,28*s,23*s);r('#1e5135',x-3*s,y+7*s,17*s,9*s)}
function flower(x,y,c){r('#3f8446',x,y,2,9);r(c?'#e76f91':'#f2cf61',x-4,y-3,7,6);r(c===2?'#f2cf61':'#e76f91',x+3,y,6,6);r('#ffe08a',x,y,3,3)}
function house(){let x=30*T,y=7*T;r('#75503d',x-18,y+130,325,20);r('#a96042',x,y+5,290,130);r('#bb744b',x+14,y+24,262,108);r('#653f38',x+12,y+22,266,9);r('#653f38',x+12,y+125,266,10);r('#653f38',x+52,y+27,9,101);r('#653f38',x+225,y+27,9,101);p('#4d3d49',[[x-25,y+15],[x+55,y-55],[x+220,y-55],[x+315,y+15],[x+278,y+15],[x+215,y-20],[x+64,y-20],[x+10,y+15]]);p('#6a515a',[[x-5,y+3],[x+64,y-38],[x+211,y-38],[x+295,y+3],[x+275,y+10],[x+210,y-17],[x+68,y-17],[x+15,y+10]]);for(let i=0;i<12;i++)r('#7e6267',x+5+i*24,y-3+(i%3)*4,15,4);[[x+34,y+48],[x+206,y+48]].forEach(q=>{r('#3c7280',q[0],q[1],45,42);r('#70453d',q[0]+19,q[1],6,42);r('#70453d',q[0],q[1]+18,45,6);r('#a7d0ba',q[0]+5,q[1]+5,11,9)});r('#4a3035',x+112,y+73,62,61);r('#69413e',x+121,y+81,44,53);r('#e4b75c',x+157,y+108,4,4);for(let i=0;i<4;i++)r('#b6a174',x+102-i*12,y+134+i*9,83+i*24,9);tx('HOME',x+114,y+38,11,'#f6dfb5')}
function bridge(){let x=44*T,y=25*T;for(let i=0;i<7;i++){r('#714733',x+i*32,y,27,14);r('#a26b45',x+i*32,y+17,27,7)}r('#5d3d30',x-7,y-10,230,7);r('#5d3d30',x-7,y+28,230,7)}
function well(){let x=48*T,y=19*T;r('#575e5b',x,y,52,32);r('#85877a',x-5,y-8,62,9);r('#424846',x-7,y+3,8,34);r('#424846',x+51,y+3,8,34);r('#363335',x+12,y+8,29,18)}
function cart(){let x=11*T,y=26*T;r('#8b5435',x,y,74,33);r('#aa6b40',x+10,y-9,57,10);r('#403033',x+15,y+35,18,18);r('#403033',x+61,y+35,18,18);r('#70442f',x+77,y-18,5,54)}
function character(x,y,isBoy=false,walk=0){r('#3f6f3c',x-17,y+13,34,7);let bob=Math.sin(walk)*2;r('#443546',x-10,y-1+bob,8,18);r('#443546',x+2,y-1-bob,8,18);r(isBoy?'#70455f':'#d66b4b',x-15,y-29+bob,30,29);r('#b97958',x-14,y-51+bob,28,20);r('#40303c',x-14,y-53+bob,28,11);r('#40303c',x-16,y-45+bob,7,12);r('#30252b',x-5,y-40+bob,2,2);r('#30252b',x+5,y-40+bob,2,2)}
function heart(h,t){let x=h.x-player.x+W/2,y=h.y-player.y+H/2,s=1+Math.sin(t/180+h.x)*.1;ctx.save();ctx.translate(x,y);ctx.scale(s,s);tx('♥',-8,8,24,'#f0647d');ctx.restore()}
function showDialogue(s,m){dialogueOpen=true;$('speaker').textContent=s;$('message').textContent=m;$('dialogue').classList.remove('hidden')}
function closeDialogue(){dialogueOpen=false;$('dialogue').classList.add('hidden')}
function startGame(){gameStarted=true;$('title-screen').classList.add('hidden');$('game-hud').classList.remove('hidden')}
function updateHud(){$('heart-count').textContent=collected}
function update(dt){if(!gameStarted)return;if(dialogueOpen){if(keys[' ']||keys.enter){keys[' ']=keys.enter=false;closeDialogue()}return}
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);if(dx&&dy){dx*=.707;dy*=.707}if(dx||dy){player.walk+=dt*10;player.dir=dx<0?1:dx>0?2:dy<0?3:0}else player.walk=0;
 player.x+=dx*player.speed*dt;player.y+=dy*player.speed*dt;player.x=Math.max(30,Math.min(MW*T-30,player.x));player.y=Math.max(40,Math.min(MH*T-20,player.y));
 if(Math.hypot(player.x-30*T,player.y-27*T)<58&&(keys[' ']||keys.enter)){keys[' ']=keys.enter=false;showDialogue('your boy','You made it all the way here. Come a little closer. ♡');return}
 for(let i=hearts.length-1;i>=0;i--){let h=hearts[i];if(Math.hypot(player.x-h.x,player.y-h.y)<28){let m=h.text;hearts.splice(i,1);collected++;updateHud();showDialogue('a little heart',m);if(collected===5)setTimeout(()=>$('ending').classList.remove('hidden'),500);break}}
}
function draw(t){ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2-player.x,H/2-player.y);ground();flowers.forEach(f=>{if(f.x>player.x-W&&f.x<player.x+W&&f.y>player.y-H&&f.y<player.y+H)flower(f.x,f.y,f.c)});trees.forEach(o=>{if(o.x>player.x-W&&o.x<player.x+W&&o.y>player.y-H&&o.y<player.y+H)tree(o.x,o.y,o.s)});bush(20*T,8*T,1.2);bush(42*T,12*T,1);bush(18*T,21*T,1.1);bush(39*T,22*T,1.2);house();well();cart();bridge();hearts.forEach(h=>heart(h,t));character(30*T,27*T,true,0);character(player.x,player.y,false,player.walk);ctx.restore();
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#15251b66');g.addColorStop(.12,'transparent');g.addColorStop(.88,'transparent');g.addColorStop(1,'#15251b66');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(gameStarted){tx(`♡ ${collected}/5`,18,30,14,'#fff1cc');tx('WASD / ARROWS  •  explore',W-250,30,11,'#fff1cc');if(Math.hypot(player.x-30*T,player.y-27*T)<72&&!dialogueOpen)tx('SPACE: talk',W/2-50,H-42,11,'#fff1cc')}requestAnimationFrame(draw)}
$('start-game').onclick=startGame;
$('new-game').onclick=()=>location.reload();
$('how-to').onclick=()=>$('help-panel').classList.remove('hidden');
$('credits-btn').onclick=()=>$('credits-panel').classList.remove('hidden');
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.close).classList.add('hidden')));
$('restart').onclick=()=>location.reload();
updateHud();requestAnimationFrame(draw);requestAnimationFrame(t=>{last=t;function loop(n){let dt=Math.min(.034,(n-last)/1000);last=n;update(dt);requestAnimationFrame(loop)}requestAnimationFrame(loop)});
