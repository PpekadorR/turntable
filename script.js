const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const img = document.getElementById("bg");

const audioA = document.getElementById("a");
const audioB = document.getElementById("b");

audioA.src = "tracks/track1.mp3";
audioB.src = "tracks/track2.mp3";

/* AUDIO CONTEXT */
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();

const deckA = audioCtx.createMediaElementSource(audioA);
const deckB = audioCtx.createMediaElementSource(audioB);

const gainA = audioCtx.createGain();
const gainB = audioCtx.createGain();

deckA.connect(gainA).connect(audioCtx.destination);
deckB.connect(gainB).connect(audioCtx.destination);

/* RESIZE */
function resize(){
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
}
window.addEventListener("resize", resize);
img.onload = resize;

/* CLICK ZONAS */
canvas.addEventListener("click", e=>{

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  /* DECK A */
  if(x < 0.35 && y < 0.7){
    toggle(audioA);
  }

  /* DECK B */
  if(x > 0.65 && y < 0.7){
    toggle(audioB);
  }

  /* CROSSFADER */
  if(y > 0.75){
    setCross(x);
  }

});

/* PLAY */
function toggle(a){
  a.paused ? a.play() : a.pause();
}

/* CROSS */
function setCross(x){
  gainA.gain.value = Math.cos(x * Math.PI/2);
  gainB.gain.value = Math.cos((1-x) * Math.PI/2);
}

/* VINYL GIRO VISUAL */
let angleA = 0;
let angleB = 0;

function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  /* SOLO VISUAL DEBUG */
  ctx.strokeStyle="rgba(0,255,0,0.2)";

  // zona deck A
  ctx.strokeRect(0,0,canvas.width*0.35,canvas.height*0.7);

  // zona deck B
  ctx.strokeRect(canvas.width*0.65,0,canvas.width*0.35,canvas.height*0.7);

  requestAnimationFrame(draw);
}

draw();

/* UNLOCK AUDIO */
document.addEventListener("click",()=>{
  if(audioCtx.state==="suspended"){
    audioCtx.resume();
  }
},{once:true});
