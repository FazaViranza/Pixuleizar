const canvas=document.getElementById('game');const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=960,H=640;const keys={};let last=0;let collected=0;let dialogueOpen=false;
const player={x:470,y:505,speed:165};
const hearts=[
 {x:155,y:185,text:'I love the way you make ordinary days feel special.'},
 {x:795,y:180,text:'You make me feel safe enough to be completely myself.'},
 {x:215,y:470,text:'Even when we are doing absolutely nothing, I still love being with you.'},
 {x:760,y:500,text:'If I could, I would save every good memory with you in a little jar.'},
 {x:480,y:330,text:'And if you ever forget: you are so, so loved.'}
];
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const $=id=>document.getElementById(id);
function fill(c,x,y,w,h){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function circle(c,x,y,r){ctx.fillStyle=c;ctx.beginPath();ctx.arc(Math.round(x),Math.round(y),r,0,Math.PI*2);ctx.fill()}
function txt(s,x,y,size=12,c='#fff'){ctx.font=`800 ${size}px monospace`;ctx.fillStyle=c;ctx.fillText(s,x,y)}
function poly(c,pts){ctx.fillStyle=c;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill()}
function grass(){
 fill('#79b95d',0,0,W,H);
 // hand-scattered grass strokes
 for(let y=0;y<H;y+=13)for(let x=0;x<W;x+=17){if((x*17+y*11)%101<22){fill('#5f9f50',x+3,y+5,2,5);fill('#8dca6a',x+7,y+2,2,6)}}
 // winding dirt path
 poly('#d6b875',[[0,520],[90,492],[190,486],[290,500],[390,530],[510,548],[650,555],[790,532],[960,485],[960,575],[810,592],[660,600],[500,587],[350,558],[210,530],[80,545],[0,565]]);
 // path highlights
 for(let x=35;x<940;x+=52){fill('#e5cb91',x,515+(x%7)*4,20,3)}
 // small stream at top
 poly('#67aeb1',[[0,0],[960,0],[960,62],[850,48],[750,70],[650,48],[540,66],[430,45],[300,70],[180,46],[80,65],[0,52]]);
 for(let x=18;x<940;x+=85){fill('#9bd2c4',x,29+(x%4)*5,28,3)}
}
function tree(x,y,s=1){
 fill('#4b733e',x-28*s,y+27*s,56*s,8*s);fill('#704735',x-9*s,y,18*s,45*s);fill('#8b573d',x-3*s,y,7*s,39*s);
 const blobs=[[0,-24,38],[29,-8,30],[-29,-8,31],[0,8,41],[-18,18,24],[21,20,25]];
 blobs.forEach(([dx,dy,r])=>circle('#24563a',x+dx*s,y+dy*s,r*s));
 [[-22,-30,17,14],[10,-40,20,17],[27,2,18,15],[-40,4,17,15],[-9,-52,18,14]].forEach(a=>fill('#2f6b43',x+a[0]*s,y+a[1]*s,a[2]*s,a[3]*s));
}
function bushes(x,y,w,h){circle('#2b6842',x,y,h*.55);circle('#34784a',x+w*.4,y-h*.08,h*.7);circle('#27603d',x+w*.78,y,h*.6)}
function house(){
 // shadow and walls
 fill('#77503d',318,250,318,18);fill('#a86142',335,118,285,145);fill('#b97149',351,140,253,120);
 // timber framing
 fill('#633d38',350,138,255,9);fill('#633d38',350,250,255,10);fill('#633d38',350,140,9,120);fill('#633d38',596,140,9,120);
 fill('#633d38',390,145,8,115);fill('#633d38',560,145,8,115);
 // huge irregular roof
 poly('#51414b',[[304,128],[390,55],[560,55],[646,128],[610,128],[545,88],[408,88],[342,128]]);
 poly('#65505a',[[325,112],[398,72],[548,72],[625,112],[609,119],[540,86],[411,86],[345,119]]);
 for(let x=340;x<620;x+=24)fill('#7b6065',x,106+(x%48)/4,14,4);
 // windows
 [[365,160],[532,160]].forEach(([x,y])=>{fill('#3f7481',x,y,48,45);fill('#6d463d',x+21,y,6,45);fill('#6d463d',x,y+19,48,6);fill('#a7d3bd',x+5,y+5,12,10);});
 // door
 fill('#4c3237',448,185,64,75);fill('#68413f',457,193,46,67);circle('#e3b85e',493,228,4);
 // steps
 for(let i=0;i<4;i++)fill('#b7a276',438-i*13,260+i*9,84+i*26,10);
 txt('HOME',449,147,11,'#f6dfb5');
}
function fence(x,y,len){for(let i=0;i<len;i+=27){fill('#754b38',x+i,y,7,44);if(i<len-27){fill('#8d6042',x+i,y+8,31,6);fill('#8d6042',x+i,y+29,31,6)}}}
function bridge(){for(let x=700;x<930;x+=31){fill('#754b38',x,540,25,13);fill('#9b6846',x,558,25,7)}fill('#68422f',694,528,238,8);fill('#68422f',694,568,238,8)}
function flower(x,y,c){fill('#4c8e49',x,y+5,2,10);circle(c,x,y,5);circle(c,x+6,y+3,4);circle(c,x-5,y+3,4);circle('#f3d36d',x+1,y+2,2)}
function cart(){fill('#8b5435',158,432,75,33);fill('#a96c3f',168,423,57,11);circle('#403033',173,468,9);circle('#403033',220,468,9);fill('#70442f',235,415,5,54)}
function well(){fill('#59605d',737,327,48,30);fill('#7e8378',732,320,58,9);fill('#484d4b',731,329,8,31);fill('#484d4b',783,329,8,31);fill('#3d3534',748,334,27,16)}
function playerSprite(){
 const x=player.x,y=player.y;fill('#4b7b43',x-16,y+13,32,7);fill('#493745',x-10,y-1,8,18);fill('#493745',x+2,y-1,8,18);fill('#d66b4b',x-15,y-29,30,29);circle('#ef9d54',x,y-40,16);fill('#4a3037',x-14,y-50,28,11);circle('#30252b',x-5,y-38,2);circle('#30252b',x+5,y-38,2)
}
function boySprite(){const x=470,y=414;fill('#4b7b43',x-16,y+13,32,7);fill('#443545',x-10,y-1,8,18);fill('#443545',x+2,y-1,8,18);fill('#70455f',x-15,y-29,30,29);circle('#b97958',x,y-40,16);fill('#40303c',x-14,y-50,28,11);fill('#40303c',x-16,y-44,7,12);}
function heart(x,y,t){const s=1+Math.sin(t/180+y)*.11;ctx.save();ctx.translate(x,y);ctx.scale(s,s);txt('♥',-9,8,23,'#ff687c');ctx.restore()}
function showDialogue(s,m){dialogueOpen=true;$('speaker').textContent=s;$('message').textContent=m;$('dialogue').classList.remove('hidden')}
function closeDialogue(){dialogueOpen=false;$('dialogue').classList.add('hidden')}
function update(dt){
 if(dialogueOpen){if(keys[' ']||keys['enter']){keys[' ']=keys['enter']=false;closeDialogue()}return}
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);if(dx&&dy){dx*=.707;dy*=.707}
 player.x=Math.max(25,Math.min(935,player.x+dx*player.speed*dt));player.y=Math.max(75,Math.min(610,player.y+dy*player.speed*dt));
 if(Math.hypot(player.x-470,player.y-414)<58&&(keys[' ']||keys.enter)){keys[' ']=keys.enter=false;showDialogue('your boy','Hey. I think you should know that someone made this whole little world because they love you.');return}
 for(let i=hearts.length-1;i>=0;i--){const h=hearts[i];if(Math.hypot(player.x-h.x,player.y-h.y)<27){const m=h.text;hearts.splice(i,1);collected++;showDialogue('a little heart',m);if(collected===5)setTimeout(()=>$('ending').classList.remove('hidden'),400);break}}
}
function draw(t){grass();
 // dense storybook framing foliage
 [[70,92,1.3],[165,65,1.05],[700,83,1.2],[875,92,1.35],[80,315,1.15],[885,320,1.25],[70,585,1.35],[300,595,1.05],[640,600,1.25],[905,590,1.3]].forEach(a=>tree(...a));
 bushes(245,95,70,42);bushes(665,125,75,48);bushes(335,345,90,40);bushes(610,355,100,45);
 house();fence(75,385,220);well();bridge();cart();
 [[115,185],[182,260],[280,175],[675,285],[820,250],[590,400],[325,425],[145,520],[570,550],[840,450],[410,100],[250,560]].forEach((p,i)=>flower(p[0],p[1],i%2?'#e96c89':'#f5d26d'));
 hearts.forEach(h=>heart(h.x,h.y,t));boySprite();playerSprite();
 txt(`HEARTS ${collected}/5`,18,618,13,'#fff1cc');
 if(Math.hypot(player.x-470,player.y-414)<70&&!dialogueOpen)txt('SPACE: talk',416,356,11,'#fff1cc');
 requestAnimationFrame(draw)}
$('restart').onclick=()=>location.reload();requestAnimationFrame(draw);requestAnimationFrame(function loop(t){const dt=Math.min(.034,(t-last)/1000||0);last=t;update(dt);requestAnimationFrame(loop)});
