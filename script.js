const ctx = new (window.AudioContext || window.webkitAudioContext)();

/* ===== DECK ===== */
function createDeck(audio){
  const source = ctx.createMediaElementSource(audio);

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const delay = ctx.createDelay();
  const analyser = ctx.createAnalyser();

  filter.type = "lowpass";
  filter.frequency.value = 20000;

  source.connect(filter);
  filter.connect(delay);
  delay.connect(gain);
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  return {
    audio,
    gain,
    filter,
    delay,
    analyser,
    cues:[0,0,0,0],
    loop:null,
    bpm:0
  };
}

const deckA = createDeck(document.getElementById("a"));
const deckB = createDeck(document.getElementById("b"));

deckA.audio.src = "tracks/track1.mp3";
deckB.audio.src = "tracks/track2.mp3";

/* UNLOCK AUDIO */
document.addEventListener("click", ()=>{
  if(ctx.state==="suspended") ctx.resume();
},{once:true});

/* ===== CONTROLES ===== */
document.getElementById("playA").onclick = ()=>toggle(deckA);
document.getElementById("playB").onclick = ()=>toggle(deckB);

document.getElementById("pitchA").oninput = e=>setPitch(deckA,e.target.value);
document.getElementById("pitchB").oninput = e=>setPitch(deckB,e.target.value);

document.getElementById("loopA").onclick = ()=>setLoop(deckA);
document.getElementById("loopB").onclick = ()=>setLoop(deckB);

document.getElementById("cross").oninput = e=>{
  let x=e.target.value/100;
  deckA.gain.gain.value=Math.cos(x*Math.PI/2);
  deckB.gain.gain.value=Math.cos((1-x)*Math.PI/2);
};

document.getElementById("fx").onclick = toggleFX;
document.getElementById("sync").onclick = sync;

document.querySelectorAll(".cues button").forEach(btn=>{
  btn.onclick=()=>{
    let deck = btn.dataset.deck==="A"?deckA:deckB;
    cue(deck, btn.dataset.cue);
  };
});

/* ===== FUNCIONES ===== */
function toggle(d){
  d.audio.paused ? d.audio.play() : d.audio.pause();
}

function setPitch(d,v){
  d.audio.playbackRate=1+v/100;
}

function setLoop(d){
  let t=d.audio.currentTime;
  d.loop={start:t,end:t+4};
}

function cue(d,i){
  if(d.audio.paused){
    d.cues[i]=d.audio.currentTime;
  }else{
    d.audio.currentTime=d.cues[i];
  }
}

/* LOOP ENGINE */
setInterval(()=>{
  [deckA,deckB].forEach(d=>{
    if(d.loop && d.audio.currentTime>d.loop.end){
      d.audio.currentTime=d.loop.start;
    }
  });
},50);

/* FX */
let fx=false;
function toggleFX(){
  fx=!fx;

  [deckA,deckB].forEach(d=>{
    d.filter.frequency.value = fx?800:20000;
    d.delay.delayTime.value = fx?0.3:0;
  });
}

/* BPM */
async function detectBPM(d){
  try{
    let res=await fetch(d.audio.src);
    let buf=await res.arrayBuffer();
    let audioBuf=await ctx.decodeAudioData(buf);

    let data=audioBuf.getChannelData(0);

    let peaks=[];
    for(let i=0;i<data.length;i+=4000){
      peaks.push(Math.abs(data[i]));
    }

    let avg=peaks.reduce((a,b)=>a+b,0)/peaks.length;
    d.bpm=Math.round(90+avg*100);
  }catch(e){
    console.log(e);
  }
}

/* SYNC */
function sync(){
  if(deckA.bpm && deckB.bpm){
    deckB.audio.playbackRate = deckA.bpm/deckB.bpm;
  }
}

/* DRAG & DROP */
const lib=document.getElementById("library");

lib.ondragover=e=>e.preventDefault();

lib.ondrop=e=>{
  e.preventDefault();

  let files=[...e.dataTransfer.files];

  files.forEach((f,i)=>{
    let url=URL.createObjectURL(f);

    if(i%2===0){
      deckA.audio.src=url;
      detectBPM(deckA);
    }else{
      deckB.audio.src=url;
      detectBPM(deckB);
    }
  });
};

/* WAVEFORM */
function draw(deck,id){
  const canvas=document.getElementById(id);
  const ctx2=canvas.getContext("2d");

  function resize(){
    canvas.width=canvas.clientWidth;
    canvas.height=canvas.clientHeight;
  }

  resize();
  window.addEventListener("resize",resize);

  function loop(){
    requestAnimationFrame(loop);

    let data=new Uint8Array(deck.analyser.frequencyBinCount);
    deck.analyser.getByteTimeDomainData(data);

    ctx2.fillStyle="#000";
    ctx2.fillRect(0,0,canvas.width,canvas.height);

    ctx2.beginPath();
    for(let i=0;i<data.length;i++){
      let x=i*(canvas.width/data.length);
      let y=(data[i]/255)*canvas.height;
      ctx2.lineTo(x,y);
    }

    ctx2.strokeStyle="#0f0";
    ctx2.stroke();
  }

  loop();
}

draw(deckA,"waveA");
draw(deckB,"waveB");
