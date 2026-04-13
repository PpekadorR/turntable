const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = document.getElementById("source");

const audioA = document.getElementById("audioA");
const audioB = document.getElementById("audioB");

let imageData, pixels;

/* AUDIO CONTEXT */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function createDeck(audio){
  const source = audioCtx.createMediaElementSource(audio);
  const gain = audioCtx.createGain();
  source.connect(gain);
  gain.connect(audioCtx.destination);
  return {audio, gain};
}

const deckA = createDeck(audioA);
const deckB = createDeck(audioB);

/* LOAD IMAGE */
img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img,0,0);
  imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  pixels = imageData.data;
};

/* CLICK INTERACTION */
canvas.addEventListener("click",(e)=>{

  const rect = canvas.getBoundingClientRect();

  const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
  const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

  handleZones(x,y);
});

/* ZONAS DJ */
function handleZones(x,y){

  // 💿 VINILO A
  if(x>50 && x<350 && y>50 && y<350){
    togglePlay(deckA,"A");
  }

  // 💿 VINILO B
  else if(x>400 && x<700 && y>50 && y<350){
    togglePlay(deckB,"B");
  }

  // 🎚️ CROSSFADER
  else if(y>500 && y<650){
    let value = x / canvas.width;
    setCrossfader(value);
  }

}

/* PLAY/PAUSE */
function togglePlay(deck,id){
  if(deck.audio.paused){
    deck.audio.play();
  }else{
    deck.audio.pause();
  }
}

/* CROSSFADER */
function setCrossfader(x){
  deckA.gain.gain.value = 1 - x;
  deckB.gain.gain.value = x;
}

/* SCRATCH */
let scratchingA=false;
let scratchingB=false;

canvas.addEventListener("mousedown",(e)=>{
  let pos = getPos(e);

  if(pos.x>50 && pos.x<350 && pos.y>50 && pos.y<350){
    scratchingA=true;
  }

  if(pos.x>400 && pos.x<700 && pos.y>50 && pos.y<350){
    scratchingB=true;
  }
});

canvas.addEventListener("mouseup",()=>{
  scratchingA=false;
  scratchingB=false;
});

canvas.addEventListener("mousemove",(e)=>{
  let pos = getPos(e);

  if(scratchingA){
    deckA.audio.currentTime += e.movementX * 0.01;
  }

  if(scratchingB){
    deckB.audio.currentTime += e.movementX * 0.01;
  }
});

/* UTIL */
function getPos(e){
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((e.clientX - rect.left) * (canvas.width / rect.width)),
    y: Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))
  };
}
