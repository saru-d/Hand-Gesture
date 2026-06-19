/* ═══ PARTICLES ═══ */
const pc=document.getElementById('particleCanvas'),pctx=pc.getContext('2d');
let parts=[];
function resizePC(){pc.width=innerWidth;pc.height=innerHeight}
resizePC();window.addEventListener('resize',resizePC);
for(let i=0;i<65;i++)parts.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.4,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,a:Math.random()*.45+.08});
function animParts(){
  pctx.clearRect(0,0,pc.width,pc.height);
  if(!document.getElementById('homePage').classList.contains('hidden')){
    parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=pc.width;if(p.x>pc.width)p.x=0;if(p.y<0)p.y=pc.height;if(p.y>pc.height)p.y=0;pctx.beginPath();pctx.arc(p.x,p.y,p.r,0,Math.PI*2);pctx.fillStyle=`rgba(0,210,255,${p.a})`;pctx.fill()});
  }
  requestAnimationFrame(animParts);
}
animParts();
 
/* ═══ TYPING ═══ */
const phrases=['Draw with your hands.','No mouse. No touch.','Dual hand gesture control.','Rainbow colors at your fingertips.'];
let pi=0,ci=0,del=false,tp=false;
const tel=document.getElementById('typedText');
function typeLoop(){
  if(tp){setTimeout(typeLoop,1700);tp=false;return}
  const ph=phrases[pi];
  if(!del){ci++;tel.textContent=ph.slice(0,ci);if(ci===ph.length){del=true;tp=true;setTimeout(typeLoop,1700);return}setTimeout(typeLoop,58);}
  else{ci--;tel.textContent=ph.slice(0,ci);if(ci===0){del=false;pi=(pi+1)%phrases.length;setTimeout(typeLoop,380);return}setTimeout(typeLoop,30);}
}
setTimeout(typeLoop,1200);
 
/* ═══ PAGE NAV ═══ */
function showAbout(){
  document.getElementById('homePage').classList.add('slide-up');
  setTimeout(()=>{document.getElementById('homePage').classList.add('hidden');document.getElementById('homePage').classList.remove('slide-up');document.getElementById('aboutPage').classList.remove('hidden');},340);
}
function goHome(){
  ['aboutPage','appPage'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.getElementById('homePage').classList.remove('hidden');
  stopCamera();
}
function startApp(){
  ['aboutPage','homePage'].forEach(id=>
    document.getElementById(id).classList.add('hidden'));
    document.getElementById('appPage').classList.remove('hidden');
  resizeCanvases();

  // Set initial color to red (top of wheel)
  applyColor('#ff0000',null);
  initCamera();
}
function stopCamera(){
  if(camera)camera.stop();
  ['camBg','miniVideo'].forEach(id=>{const v=document.getElementById(id);if(v)v.srcObject=null});
  document.getElementById('camBadge').textContent='◉ CAM OFF';
  document.getElementById('camBadge').classList.remove('on');
  document.getElementById('sdot').classList.remove('on');
  document.getElementById('sStatus').textContent='CAMERA OFF';
  handVisible=[false,false];isDrawing=false;pinchActive=[false,false];
}

const bar=document.getElementById('colorBar');
const ctx=bar.getContext('2d');

const grad=ctx.createLinearGradient(0,0,0,bar.height);

grad.addColorStop(0.0,'red');
grad.addColorStop(0.17,'orange');
grad.addColorStop(0.33,'yellow');
grad.addColorStop(0.50,'lime');
grad.addColorStop(0.66,'cyan');
grad.addColorStop(0.83,'blue');
grad.addColorStop(1.0,'violet');

ctx.fillStyle=grad;
ctx.fillRect(0,0,bar.width,bar.height);

function checkColorBarHover(pageX,pageY){

    const rect=bar.getBoundingClientRect();

    if(
      pageX<rect.left ||
      pageX>rect.right ||
      pageY<rect.top ||
      pageY>rect.bottom
    ) return false;

    const y=(pageY-rect.top)*(bar.height/rect.height);

    const img=ctx.getImageData(
        bar.width/2,
        y,
        1,
        1
    ).data;

    const hex='#'+
      [img[0],img[1],img[2]]
      .map(v=>v.toString(16).padStart(2,'0'))
      .join('');

    applyColor(hex,null);

    return true;
}

function hslToHex(h,s,l){
  s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0')};
  return`#${f(0)}${f(8)}${f(4)}`;
}
 
function applyColor(hex,el){
  currentColor=hex;
  const cp=document.getElementById('colorPreview');
  cp.style.background=hex;cp.style.boxShadow=`0 0 18px ${hex}`;
  document.getElementById('colorHex').textContent=hex;
  const sc=document.getElementById('sColor');sc.textContent=' ■ '+hex;sc.style.color=hex;
  document.querySelectorAll('.qsw').forEach(s=>s.classList.remove('active'));
  if(el)el.classList.add('active');
}
 
/* ═══ CANVAS SETUP ═══ */
const wrap=document.getElementById('canvasWrap');
const drawC=document.getElementById('drawCanvas');
const handC=document.getElementById('handCanvas');
const dctx = drawC.getContext('2d', {
  willReadFrequently: true
});
const hctx=handC.getContext('2d');
function resizeCanvases(){
  const r=wrap.getBoundingClientRect();
  [drawC,handC].forEach(c=>{c.width=r.width;c.height=r.height});
}
window.addEventListener('resize',resizeCanvases);
 
/* ═══ STATE ═══ */
let fistCount=[0,0];
let currentTool='pencil',currentColor='#ff0000',strokeSize=4;
let isDrawing=[false,false];
let snapshot=[null,null];
let startX=[0,0];
let startY=[0,0];
let handVisible=[false,false],pinchActive=[false,false];
let fistTimer=null,hoverEl=null,hoverInterval=null;
let activeHand = -1;
let paintLock=[false,false];
 
// Smooth cursor — exponential moving average
const ALPHA=0.42; // tune: lower=smoother, higher=more responsive
let smooth=[[0,0],[0,0]];
let target=[[0,0],[0,0]];
let dotVisible=[false,false];
 
/* ═══ TOOL ═══ */
function setTool(t,btn){
  currentTool=t;
  document.querySelectorAll('.tbtn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.getElementById('sTool').textContent=' '+t.toUpperCase();
  isDrawing=[false,false];showToast(t.toUpperCase()+' selected');
}
function clearCanvas(){
  dctx.clearRect(0,0,drawC.width,drawC.height);
  pinchActive=[false,false];
  isDrawing=[false,false];
  spawnRipple(
    drawC.width/2,
    drawC.height/2,
    '#f0286a');
  showToast('Canvas cleared');
}
 
/* ═══ TOAST / RIPPLE ═══ */
let toastT;
function showToast(msg){const t=document.getElementById('gestureToast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1400)}
function spawnRipple(x,y,col){const el=document.createElement('div');el.className='ripple-el';el.style.cssText=`left:${x}px;top:${y}px;width:22px;height:22px;background:${col||currentColor}`;wrap.appendChild(el);setTimeout(()=>el.remove(),500)}
 
/* ═══ DRAWING ═══ */
function beginStroke(hand,x,y){
  isDrawing[hand]=true;
  startX[hand]=x;
  startY[hand]=y;
  snapshot[hand]=dctx.getImageData(0,0,drawC.width,drawC.height);
  dctx.lineJoin='round';dctx.lineCap='round';dctx.globalCompositeOperation='source-over';
  if(currentTool==='pencil'){dctx.beginPath();dctx.moveTo(x,y)}
  if(currentTool==='eraser'){dctx.beginPath();dctx.moveTo(x,y)}
  if(currentTool==='text'){
    const txt=prompt('Enter text:')||'';
    if(txt){dctx.font=`${Math.max(14,strokeSize*4)}px 'Rajdhani',sans-serif`;dctx.fillStyle=currentColor;dctx.globalCompositeOperation='source-over';dctx.fillText(txt,x,y)}
    isDrawing=false;return;
  }
  activeHand = hand;
  spawnRipple(x,y);
}
function continueStroke(hand,x,y){
  if(!isDrawing[hand]) return;
  dctx.lineJoin='round';dctx.lineCap='round';
  if(currentTool==='pencil'){
    dctx.strokeStyle=currentColor;
    dctx.lineWidth=strokeSize;
    dctx.globalCompositeOperation='source-over';
    dctx.lineTo(x,y);dctx.stroke();
  }else if(currentTool==='eraser'){
    dctx.globalCompositeOperation='destination-out';
    dctx.lineWidth=strokeSize*5;
    dctx.lineTo(x,y);
    dctx.stroke();
    dctx.globalCompositeOperation='source-over';
  }else if(currentTool!=='paint' && activeHand===hand){
    dctx.putImageData(snapshot[hand],0,0);
    dctx.strokeStyle=currentColor;
    dctx.fillStyle='transparent';
    dctx.lineWidth=strokeSize;
    dctx.globalCompositeOperation='source-over';
    drawShape(startX[hand],startY[hand],x,y);
  }
}
function endStroke(hand,x,y){
  if(!isDrawing[hand]) return;
  if(currentTool==='paint' && x!=null && y!=null){
    floodFill(Math.round(x),Math.round(y));
  }
  isDrawing[hand]=false;dctx.beginPath();dctx.globalCompositeOperation='source-over';
  if(activeHand===hand){
    activeHand=-1;
  }
}
function drawShape(x1,y1,x2,y2){

  const w=x2-x1;
  const h=y2-y1;

  dctx.beginPath();

  switch(currentTool){

    case 'rect':
      dctx.rect(x1,y1,w,h);
      break;

    case 'circle':
      dctx.ellipse(
        x1+w/2,
        y1+h/2,
        Math.abs(w/2),
        Math.abs(h/2),
        0,0,Math.PI*2
      );
      break;

    case 'triangle':
      dctx.moveTo(x1+w/2,y1);
      dctx.lineTo(x2,y2);
      dctx.lineTo(x1,y2);
      dctx.closePath();
      break;

    case 'line':
      dctx.moveTo(x1,y1);
      dctx.lineTo(x2,y2);
      break;

    case 'arrow':
      drawArrow(x1,y1,x2,y2);
      return;

    case 'star':
      drawStar(
        (x1+x2)/2,
        (y1+y2)/2,
        5,
        Math.hypot(w,h)/2,
        Math.hypot(w,h)/4
      );
      return;
  }

  // IMPORTANT
  dctx.stroke();

  // Fill only closed shapes
  if(
    currentTool==='rect' ||
    currentTool==='circle' ||
    currentTool==='triangle'
  ){
    dctx.fill();
  }
}
function drawArrow(x1,y1,x2,y2){
  const a=Math.atan2(y2-y1,x2-x1),l=16+strokeSize*1.5;
  dctx.moveTo(x1,y1);dctx.lineTo(x2,y2);
  dctx.stroke();
  dctx.beginPath();
  dctx.moveTo(x2,y2);
  dctx.lineTo(x2-l*Math.cos(a-.44),y2-l*Math.sin(a-.44));
  dctx.lineTo(x2-l*Math.cos(a+.44),y2-l*Math.sin(a+.44));
  dctx.closePath();
  dctx.fillStyle=currentColor;
  dctx.fill();
}
function drawStar(cx,cy,sp,ro,ri){
  const ang=Math.PI/sp;
  dctx.beginPath();
  for(let i=0;i<sp*2;i++){
    const r=i%2===0?ro:ri;
    dctx.lineTo(cx+Math.cos(i*ang-Math.PI/2)*r,cy+Math.sin(i*ang-Math.PI/2)*r)
  }
  dctx.closePath();
  dctx.fill();
  dctx.stroke();
}
function floodFill(sx,sy){
  const img=dctx.getImageData(0,0,drawC.width,drawC.height);
  const d=img.data,W=drawC.width,H=drawC.height;
  const i=(sy*W+sx)*4,tr=d[i],tg=d[i+1],tb=d[i+2],ta=d[i+3];
  const fc=hexRgb(currentColor);
  if(tr===fc.r&&tg===fc.g&&tb===fc.b)return;
  const stack=[[sx,sy]],vis=new Uint8Array(W*H);
  while(stack.length){
    const[x,y]=stack.pop();
    if(x<0||x>=W||y<0||y>=H)continue;
    const idx=y*W+x;if(vis[idx])continue;
    vis[idx]=1;const p=idx*4;
    const tol=28;
    if(
      Math.abs(d[p]-tr)>tol ||
      Math.abs(d[p+1]-tg)>tol ||
      Math.abs(d[p+2]-tb)>tol ||
     Math.abs(d[p+3]-ta)>tol
    ) continue;
    d[p]=fc.r;d[p+1]=fc.g;d[p+2]=fc.b;d[p+3]=255;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  dctx.putImageData(img,0,0);
}
function hexRgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)}}
 
/* ═══ HAND RENDERING ═══ */
const CONN=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const TIPS=[4,8,12,16,20];
const HCOLS=['rgba(0,210,255,','rgba(255,165,0,'];
 
function renderHands(lm0,lm1){
  hctx.clearRect(0,0,handC.width,handC.height);
  if(lm0)renderOneHand(hctx,lm0,handC.width,handC.height,0);
  if(lm1)renderOneHand(hctx,lm1,handC.width,handC.height,1);
}
function renderOneHand(ctx,lm,W,H,idx){
  const col=HCOLS[idx];
  const pts=lm.map(l=>({x:(1-l.x)*W,y:l.y*H}));
  // Glow connections
  ctx.shadowColor=idx===0?'rgba(0,210,255,.6)':'rgba(255,165,0,.6)';
  ctx.shadowBlur=6;
  ctx.strokeStyle=col+'.6)';ctx.lineWidth=2;
  for(const[a,b]of CONN){
    ctx.beginPath();
    ctx.moveTo(pts[a].x,pts[a].y);
    ctx.lineTo(pts[b].x,pts[b].y);
    ctx.stroke();
  }
  ctx.shadowBlur=0;
  // Joints
  for(let i=0;i<pts.length;i++){
    const tip=TIPS.includes(i);
    if(tip){
      ctx.beginPath();
      ctx.arc(pts[i].x,pts[i].y,9,0,Math.PI*2);
      ctx.fillStyle=col+'.12)';
      ctx.fill();
    }
    ctx.beginPath();ctx.arc(pts[i].x,pts[i].y,tip?5.5:3,0,Math.PI*2);
    ctx.fillStyle=tip?col+'.95)':'rgba(220,230,255,.75)';ctx.fill();
  }
}
function renderMiniHands(ctx,W,H,lm0,lm1){
  ctx.clearRect(0,0,W,H);
  if(lm0)renderOneHand(ctx,lm0,W,H,0);
  if(lm1)renderOneHand(ctx,lm1,W,H,1);
}
 
/* ═══ GESTURE CLASSIFIER ═══ */
function dst3(a,b){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2)}
function classify(lm){
  const pinchD=dst3(lm[4],lm[8]);
  const handSz=(dst3(lm[0],lm[5])+dst3(lm[0],lm[9]))/2;
  const pr=pinchD/handSz;
  const iUp=lm[8].y<lm[6].y,mUp=lm[12].y<lm[10].y,rUp=lm[16].y<lm[14].y,pUp=lm[20].y<lm[18].y;
  const up=[iUp,mUp,rUp,pUp].filter(Boolean).length;
  if(pr<0.25)return'PINCH';
  if(up===0)return'FIST';
  if(iUp&&mUp&&!rUp&&!pUp)return'PEACE';
  if(iUp&&!mUp&&!rUp&&!pUp)return'POINT';
  if(up>=4)return'OPEN';
  return'HAND';
}
 
/* ═══ HOVER ACTIVATION ═══ */
function checkHover(fx, fy, gesture){

  const wRect = wrap.getBoundingClientRect();
  const px = fx + wRect.left;
  const py = fy + wRect.top;

  // Color bar selection
  if(gesture === 'PEACE'){
    if(checkColorBarHover(px, py)) return;
  }

  let found = null;

  document.querySelectorAll(
    '.tbtn'
  ).forEach(el=>{

    const r = el.getBoundingClientRect();

    if(
      px >= r.left &&
      px <= r.right &&
      py >= r.top &&
      py <= r.bottom
    ){
      found = el;
    }

  });

  if(found && (gesture==='PEACE' || gesture==='POINT')){

    if(hoverEl !== found){

      clearHover();

      hoverEl = found;

      hoverEl.style.outline =
      '2px solid rgba(0,210,255,.6)';

      let prog = 0;

      hoverInterval = setInterval(()=>{

        prog += 20;

        if(prog >= 100){

          clearHover();

          found.click();

          spawnRipple(fx, fy);

        }

      },100);

    }

  }else{

    clearHover();

  }

}
function clearHover(){clearInterval(hoverInterval);if(hoverEl){hoverEl.style.outline='';hoverEl=null;}hoverInterval=null}
 
 
function lerpDot(){
  for(let i=0;i<2;i++){
    if(!dotVisible[i])continue;
    // Exponential smooth toward target
    smooth[i][0]+=(target[i][0]-smooth[i][0])*ALPHA;
    smooth[i][1]+=(target[i][1]-smooth[i][1])*ALPHA;
    const dot=document.getElementById('dot'+i);
    const trail=document.getElementById('trail'+i);
    dot.style.left=smooth[i][0]+'px';
    dot.style.top =smooth[i][1]+'px';
    trail.style.left=smooth[i][0]+'px';
    trail.style.top =smooth[i][1]+'px';
    // If drawing with hand 0, feed smooth position to drawing
    if(pinchActive[i] && handVisible[i]){
      continueStroke(i,smooth[i][0],smooth[i][1]);
    }
  }
  requestAnimationFrame(lerpDot);
}
requestAnimationFrame(lerpDot);
 
/* ═══ PROCESS GESTURE PER HAND ═══ */
let prevGest=['',''];
let pinchFrames=[0,0];
function processHand(idx,gesture,lm){
  const W=handC.width,H=handC.height;
  const tip=lm[8];
  const rawX=(1-tip.x)*W,rawY=tip.y*H;
 
  // Set target (smooth loop interpolates toward this)
  target[idx]=[rawX,rawY];
  dotVisible[idx]=true;
 
  const dot=document.getElementById('dot'+idx);
  const trail=document.getElementById('trail'+idx);
  dot.style.display='block';
  trail.style.display='block';
 
  // Set dot class
  const cls='fdot'+(gesture==='PINCH'?' pinch':gesture==='FIST'?' erasing':'');
  dot.className=cls;
 
  // Status info
  document.getElementById('sG'+idx).textContent=' '+gesture;
  const fx=rawX, fy=rawY;
  if(prevGest[idx]!==gesture){
    prevGest[idx]=gesture;
    return;     // wait one frame before acting
  }
  document.querySelector(idx===0?'.hi0':'.hi1').textContent=
    'Hand '+(idx+1)+(idx===0?' (cyan)':' (orange)')+': '+gesture;
 
  // Hover check
  checkHover(fx,fy,gesture);
 
  // Fist hold = clear
if(gesture==='FIST'){
    fistCount[idx]++;
    if(fistCount[idx] >= 20){   // about 0.7 sec at 30 FPS
        if(!fistTimer){
            fistTimer=setTimeout(()=>{
                clearCanvas();
                fistTimer=null;
            },1000);
        }
    }
}else{
    fistCount[idx]=0;
    if(fistTimer){
        clearTimeout(fistTimer);
        fistTimer=null;
    }
}
 
  //both hands
  if(gesture==='PINCH'){
    pinchFrames[idx]++;

    // Confirm pinch only after 4 frames
    if(pinchFrames[idx] < 4)
        return;
    // PAINT TOOL
    if(currentTool==='paint'){

      if(!pinchActive[idx] && !paintLock[idx]){

        floodFill(Math.round(fx),Math.round(fy));

        pinchActive[idx]=true;
        paintLock[idx]=true;

        spawnRipple(fx,fy,currentColor);

        setTimeout(()=>{
          paintLock[idx]=false;
        },700);
      }

    }else{

      // OTHER TOOLS
      if(!pinchActive[idx]){
        beginStroke(idx,fx,fy);
        pinchActive[idx]=true;
      }
    }

  }else{
    pinchFrames[idx]=0;

    if(pinchActive[idx]){

        if(currentTool!=='paint'){
            endStroke(idx,fx,fy);
        }

        pinchActive[idx]=false;
    }

    if(pinchActive[idx]){

      if(currentTool!=='paint'){
        endStroke(idx,fx,fy);
      }

      pinchActive[idx]=false;
    }
  }
}
 
/* ═══ MEDIAPIPE ═══ */
let hands=null,camera=null;
 
async function initCamera(){
  document.getElementById('camBadge').textContent='◉ LOADING…';
  document.getElementById('sStatus').textContent='Starting camera…';
  const bar=document.getElementById('loadBar');bar.style.width='20%';
 
  let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{width:1280,height:720,facingMode:'user'}});}
  catch(e){
    document.getElementById('camBadge').textContent='◉ NO CAM';
    document.getElementById('sStatus').textContent='No camera — mouse mode active';
    showToast('No camera found — draw with mouse');bar.style.width='0%';return;
  }
 
  const camVid=document.getElementById('camBg');
  camVid.srcObject=stream;
  document.getElementById('miniVideo').srcObject=stream;
  document.getElementById('miniCam').style.display='block';
  bar.style.width='50%';
 
  hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
  hands.setOptions({maxNumHands:2,modelComplexity:0,minDetectionConfidence:.72,minTrackingConfidence:.65});
  hands.onResults(onResults);
  bar.style.width='78%';
 
  camera=new Camera(camVid,{onFrame:async()=>{await hands.send({image:camVid})},width:1280,height:720});
  camera.start().then(()=>{
    bar.style.width='100%';setTimeout(()=>bar.style.width='0%',600);
    document.getElementById('camBadge').textContent='◉ LIVE';
    document.getElementById('camBadge').classList.add('on');
    document.getElementById('sdot').classList.add('on');
    document.getElementById('sStatus').textContent='GESTURE ACTIVE — Show both hands!';
    showToast('🖐️ Ready! Show your hands');
  });
}
 
function onResults(res){
  // Mini preview
  const mc=document.getElementById('miniCanvas'),mv=document.getElementById('miniVideo');
  const mctx=mc.getContext('2d');mc.width=mv.clientWidth;mc.height=mv.clientHeight;
 
  const lms=res.multiHandLandmarks||[];
  const lm0=lms[0]||null,lm1=lms[1]||null;
 
  handVisible[0]=!!lm0;handVisible[1]=!!lm1;
 
  renderHands(lm0,lm1);
  renderMiniHands(mctx,mc.width,mc.height,lm0,lm1);
 
  document.getElementById('canvasHint').style.opacity=(lm0||lm1)?'0':'1';
 
  if(lm0){processHand(0,classify(lm0),lm0);}
  else{
    dotVisible[0]=false;
    document.getElementById('dot0').style.display='none';
    document.getElementById('trail0').style.display='none';
    document.getElementById('sG0').textContent=' —';
    document.querySelector('.hi0').textContent='Hand 1 (cyan): —';
    if(pinchActive[0]){endStroke(smooth[0][0],smooth[0][1]);pinchActive[0]=false;}
    if(isDrawing[0]){
      endStroke(0,smooth[0][0],smooth[0][1]);
      isDrawing[0]=false;
    }
    prevGest[0]='';
  }
  if(lm1){processHand(1,classify(lm1),lm1);}
  else{
    dotVisible[1]=false;
    document.getElementById('dot1').style.display='none';
    document.getElementById('trail1').style.display='none';
    document.getElementById('sG1').textContent=' —';
    document.querySelector('.hi1').textContent='Hand 2 (orange): —';
    if(pinchActive[1])pinchActive[1]=false;
    prevGest[1]='';
  }
  if(!lm0&&!lm1&&fistTimer){clearTimeout(fistTimer);fistTimer=null;}
  if(!lm0&&!lm1)clearHover();
}
 
/* ═══ MOUSE FALLBACK ═══ */
let mouseDown=false;
wrap.addEventListener('mousemove',e=>{
  if(handVisible[0])return;
  const r=wrap.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  target[0]=[x,y];dotVisible[0]=true;
  document.getElementById('dot0').style.display='block';
  document.getElementById('trail0').style.display='block';
  if(mouseDown && isDrawing[0]){
    continueStroke(0,smooth[0][0],smooth[0][1]);
  }
});
wrap.addEventListener('mousedown',e=>{
  if(handVisible[0])return;
  mouseDown=true;
  const r=wrap.getBoundingClientRect();
  beginStroke(0,e.clientX-r.left,e.clientY-r.top);
  pinchActive[0]=true;
});
wrap.addEventListener('mouseup',e=>{
  if(!mouseDown)return;mouseDown=false;pinchActive[0]=false;
  const r=wrap.getBoundingClientRect();
  endStroke(0,e.clientX-r.left,e.clientY-r.top);
});
wrap.addEventListener('mouseleave',()=>{
  if(handVisible[0])return;
  dotVisible[0]=false;
  document.getElementById('dot0').style.display='none';
  document.getElementById('trail0').style.display='none';
  mouseDown=false;pinchActive[0]=false;
  if(isDrawing[0]){
    endStroke(0,smooth[0][0],smooth[0][1]);
  }
});