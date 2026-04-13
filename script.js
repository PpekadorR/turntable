const audioA=document.getElementById("audioA");
const audioB=document.getElementById("audioB");
const crackle=document.getElementById("crackle");

const vinylA=document.getElementById("vinylA");
const vinylB=document.getElementById("vinylB");

const needleA=document.getElementById("needleA");
const needleB=document.getElementById("needleB");

const crossfader=document.getElementById("crossfader");

let currentDeck=null;

/* TRACKS */
const tracks=[
 {name:"A1",file:"audio/deckA_1.mp3",cover:"img/a1.jpg"},
 {name:"A2",file:"audio/deckA_2.mp3",cover:"img/a2.jpg"},
 {name:"B1",file:"audio/deckB_1.mp3",cover:"img/b1.jpg"},
 {name:"B2",file:"audio/deckB_2.mp3",cover:"img/b2.jpg"}
];

const modal=document.getElementById("modal");
const list=document.getElementById("trackList");

tracks.forEach((t,i)=>{
 let li=document.createElement("li");
 li.innerText=t.name;
 li.onclick=()=>loadTrack(i);
 list.appendChild(li);
});

function openLibrary(deck){
 currentDeck=deck;
 modal.style.display="block";
}

function closeLibrary(){
 modal.style.display="none";
}

function loadTrack(i){
 let t=tracks[i];
 if(currentDeck==="A"){
   audioA.src=t.file;
   document.getElementById("coverA").style.backgroundImage=`url(${t.cover})`;
 }else{
   audioB.src=t.file;
   document.getElementById("coverB").style.backgroundImage=`url(${t.cover})`;
 }
 closeLibrary();
}

/* PLAY */
function playDeck(d){
 let audio=d==="A"?audioA:audioB;
 let vinyl=d==="A"?vinylA:vinylB;
 let needle=d==="A"?needleA:needleB;

 audio.play();
 vinyl.classList.add("spin");
 needle.classList.add("playing");
 crackle.play();
}

function pauseDeck(d){
 let audio=d==="A"?audioA:audioB;
 let vinyl=d==="A"?vinylA:vinylB;
 let needle=d==="A"?needleA:needleB;

 audio.pause();
 vinyl.classList.remove("spin");
 needle.classList.remove("playing");
}

/* CROSSFADER */
crossfader.addEventListener("input",()=>{
 let v=crossfader.value/100;
 audioA.volume=1-v;
 audioB.volume=v;
});

/* SCRATCH REAL (TOUCH) */
function enableScratch(vinyl,audio){
 let isDown=false;

 vinyl.addEventListener("touchstart",()=>isDown=true);
 vinyl.addEventListener("touchend",()=>isDown=false);

 vinyl.addEventListener("touchmove",(e)=>{
  if(!isDown) return;

  let delta=e.touches[0].clientX;
  audio.currentTime+=delta*0.0001;
 });
}

enableScratch(vinylA,audioA);
enableScratch(vinylB,audioB);

/* FX simple */
let fxOn=false;
function toggleFX(){
 fxOn=!fxOn;
 audioA.playbackRate=fxOn?0.9:1;
 audioB.playbackRate=fxOn?0.9:1;
}
