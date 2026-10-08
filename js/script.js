(function(){
  const $=id=>document.getElementById(id);
  $("cname").textContent=INVITE.name; $("cage").textContent=INVITE.age;
  $("cdate").textContent=INVITE.date; $("ctime").textContent=INVITE.time; $("cloc").textContent=INVITE.location;
  document.title=INVITE.name+" — урилга";
  if(INVITE.background){const h=document.querySelector(".hero");h.classList.add("custom-bg");
    h.style.backgroundImage='linear-gradient(#fbf3e255,#fbf3e200 40%,#3a1f1455),url("'+INVITE.background+'")';}
  if(INVITE.finalBackground){const f=document.querySelector(".final");f.classList.add("custom-bg");
    f.style.backgroundImage='url("'+INVITE.finalBackground+'")';}
  if(INVITE.photo){const p=$("photoIn");p.innerHTML="";p.style.backgroundImage='url("'+INVITE.photo+'")';}

  /* line / word builders */
  function words(el,text,start,gap){el.innerHTML=text.split(" ").map((w,i)=>'<span style="animation-delay:'+(start+i*gap).toFixed(2)+'s">'+w+'&nbsp;</span>').join("");}
  words($("welcome"),"Эрхэм хүндэт таныг бидний хүү Ивээлтийн сэвлэг үргээх ёслолд хүрэлцэн ирэхийг хүндэтгэн урьж байна.",3.9,.45);
  const lines=["Бидний бяцхан үрийн Сэвлэг үргээх ёслолд хүрэлцэн ирж, бидний баярт өдрийг хамтдаа хуваалцахыг урьж байна."];
  $("msg").innerHTML=lines.map((l,i)=>'<span class="rv" style="--d:'+(i*.9)+'s">'+l+'</span>').join("");
  $("msg").setAttribute("aria-label","Таныг хүрэлцэн ирж, бидний баярт өдрийг хамтдаа хуваалцахыг урьж байна.");

  /* scroll reveal */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.2});
  document.querySelectorAll(".rv").forEach(el=>io.observe(el));

  /* petals + gold particles */
  const fx=$("fx"),cols=["#f4b8c0","#f9d9a8","#fff0f0","#e9a0aa"],r=(a,b)=>a+Math.random()*(b-a);
  for(let i=0;i<14;i++){const p=document.createElement("i");p.className="petal";
    p.style.cssText="left:"+r(0,100)+"%;background:"+cols[i%4]+";animation-duration:"+r(16,28)+"s;animation-delay:"+(-r(0,28))+"s;--sx:"+r(-120,160)+"px";fx.appendChild(p)}
  for(let i=0;i<16;i++){const d=document.createElement("i");d.className="dot";
    d.style.cssText="left:"+r(0,100)+"%;top:"+r(5,95)+"%;animation-duration:"+r(5,10)+"s;animation-delay:"+(-r(0,9))+"s";fx.appendChild(d)}

  /* RSVP */
  const form=$("form"),btn=$("rsvpBtn");
  btn.onclick=()=>{const o=form.classList.toggle("open");btn.setAttribute("aria-expanded",o);
    if(o)setTimeout(()=>form.scrollIntoView({behavior:"smooth",block:"center"}),400)};
  $("rsvp").addEventListener("submit",e=>{e.preventDefault();
    const v=e.submitter&&e.submitter.dataset.v,f=e.target,n=f.n.value.trim(),c=f.c.value;
    const yes=v==="yes";
    try{localStorage.setItem("rsvp",JSON.stringify({n,c,yes}))}catch(_){}
    form.classList.remove("open");btn.hidden=true;
    const t=$("thanks");t.hidden=false;
    t.textContent=yes?"Баярлалаа, "+n+"! Манай гэр бүл хүлээж байя ":"Ойлголоо, "+n+". Хариу өгсөнд баярлалаа ";
    if(INVITE.rsvpPhone){const body=encodeURIComponent((yes?"Ochino  ":"Ochij chadahguine ")+n+" ("+c+" hun)");
      t.insertAdjacentHTML("beforeend",'<br><a style="font-size:1rem;color:var(--red)" href="sms:'+INVITE.rsvpPhone+'?&body='+body+'">Мессэж илгээх</a>');}
  });

  /* music */
  const mb=$("mus");let on=false,audio=null,ctx=null,timer=null,master=null;
  function synth(){
    ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1100;lp.connect(master);
    [73.4,110].forEach(f=>{const o=ctx.createOscillator();o.type="triangle";o.frequency.value=f;const g=ctx.createGain();g.gain.value=.12;o.connect(g).connect(lp);o.start()});
    const sc=[293.7,329.6,370,440,493.9,587.3,440,370,329.6];let i=0;
    function note(){const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sawtooth";o.frequency.value=sc[i++%sc.length]*(Math.random()<.2?.5:1);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+2.2);
      o.connect(g).connect(lp);o.start(t);o.stop(t+2.4)}
    note();timer=setInterval(note,1800);
  }
  async function setMusic(want){
    try{
      if(INVITE.music){audio=audio||Object.assign(new Audio(INVITE.music),{loop:true,volume:.5});want?await audio.play():audio.pause();}
      else{
        if(!master)synth();
        if(want){await ctx.resume();await new Promise(r=>setTimeout(r,250));if(ctx.state!=="running")throw new Error("AudioContext did not start");}
        master.gain.setTargetAtTime(want?.8:0,ctx.currentTime,.4);
      }
      on=want;
      mb.title="";
    }catch(error){
      on=false;
      if(error&&error.name==="NotAllowedError")mb.title="Хөгжим эхлүүлэхийн тулд дэлгэцэд хүрнэ үү.";
      else{mb.title="Хөгжим ачаалж чадсангүй.";console.error("Unable to play invitation music:",error)}
    }
    mb.classList.toggle("on",on);mb.setAttribute("aria-pressed",on);
    mb.textContent=on?"🔇 Хөгжим унтраах":"🎵 Хөгжим асаах";
  }
  /* Автоматаар эхлүүлэх: хөтөч зөвшөөрвөл шууд, үгүй бол эхний хүрэлт/дарлт дээр */
  const gestures=["pointerdown","touchend","keydown","click"];
  function stopWaiting(){gestures.forEach(t=>removeEventListener(t,firstGesture,true))}
  function firstGesture(e){if(e.target.closest&&e.target.closest("#mus"))return;stopWaiting();setMusic(true)}
  gestures.forEach(t=>addEventListener(t,firstGesture,{capture:true,passive:true}));
  setMusic(true).then(()=>{if(on)stopWaiting()});
  mb.onclick=e=>{e.stopPropagation();stopWaiting();setMusic(!on)};
})();
