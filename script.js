const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

/* CREAR DECK */
function createDeck(audioEl){
  const source = ctx.createMediaElementSource(audioEl);
  const gain = ctx.createGain();

  const low = ctx.createBiquadFilter();
  low.type="lowshelf";
  low.frequency.value=200;

  const mid = ctx.createBiquadFilter();
  mid.type="peaking";
  mid.frequency.value=1000;

  const high = ctx.createBiquadFilter();
  high.type="highshelf";
  high.frequency.value=3000;

  source.connect(low);
  low.connect(mid);
  mid.connect(high);
  high.connect(gain);
  gain.connect(ctx.destination);

  return {audio:audioEl, gain, low, mid, high};
}

const deckA = createDeck(document.getElementById("audioA"));
const deckB = createDeck(document.getElementById("audioB"));

/* PLAY */
function playDeck(d){
  let deck = d==="A"?deckA:deckB;
  deck.audio.play();
  document.getElementById("vinyl"+d).classList.add("spin");
}

function pauseDeck(d){
  let deck = d==="A"?deckA:deckB;
  deck.audio.pause();
  document.getElementById("vinyl"+d).classList.remove("spin");
}

/* EQ */
function setEQ(d,band,value){
  let deck = d==="A"?deckA:deckB;
  deck[band].gain.value = value;
}

/* CROSS */
function setCrossfader(v){
  let x=v/100;
  deckA.gain.gain.value = Math.cos(x*Math.PI/2);
  deckB.gain.gain.value = Math.cos((1-x)*Math.PI/2);
}

/* PITCH */
function setPitch(d,v){
  let deck = d==="A"?deckA:deckB;
  deck.audio.playbackRate = 1 + v/100;
}

/* LOOP */
let loops={A:null,B:null};

function setLoop(d){
  let deck = d==="A"?deckA:deckB;
  let start = deck.audio.currentTime;
  let end = start + 4;

  loops[d]={start,end};

  setInterval(()=>{
    if(deck.audio.currentTime>=end){
      deck.audio.currentTime=start;
    }
  },50);
}

/* SCRATCH */
function enableScratch(id,deck){
  let el=document.getElementById(id);
  let down=false;

  el.addEventListener("mousedown",()=>down=true);
  window.addEventListener("mouseup",()=>down=false);

  el.addEventListener("mousemove",(e)=>{
    if(!down) return;
    deck.audio.currentTime += e.movementX * 0.01;
  });
}

enableScratch("vinylA",deckA);
enableScratch("vinylB",deckB);

/* WAVEFORM */
const analyser = ctx.createAnalyser();
deckA.gain.connect(analyser);
deckB.gain.connect(analyser);

const canvas=document.getElementById("waveform");
const ctx2=canvas.getContext("2d");

function draw(){
  requestAnimationFrame(draw);

  let data=new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(data);

  ctx2.fillStyle="#000";
  ctx2.fillRect(0,0,canvas.width,canvas.height);

  ctx2.strokeStyle="#0f0";
  ctx2.beginPath();

  for(let i=0;i<data.length;i++){
    let x=i;
    let y=data[i]/2;
    ctx2.lineTo(x,y);
  }

  ctx2.stroke();
}

draw();
