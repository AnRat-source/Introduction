/* AnRat Layers — original interconnected puzzle game using AnRat's public word APIs. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const TYPES = ['letterlock','anagram','crossword','wordsearch'];
  const META = {
    letterlock:{name:'LetterLock',symbol:'▦',caption:'Guess the word',blurb:'Guess the five-letter word in six tries. Green means correct spot, gold means the letter belongs elsewhere.'},
    anagram:{name:'Anagram',symbol:'⤨',caption:'Unscramble letters',blurb:'Rearrange the scrambled letters into a real word. Tap letters in order, then check your answer.'},
    crossword:{name:'Crossword',symbol:'▤',caption:'Solve the clues',blurb:'Solve crossing clues to uncover the mystery word in the horizontal row.'},
    wordsearch:{name:'Word Search',symbol:'⌕',caption:'Trace the letters',blurb:'Find the secret word in any direction: forward, backward, horizontal, vertical, or diagonal.'}
  };
  const FALLBACK = [
    {id:'offline-1',title:'Everyday Essentials',groups:[
      {difficulty:1,category:'Hot drinks',words:['COFFEE','TEA','COCOA','CHAI']},
      {difficulty:2,category:'Writing implements',words:['PENCIL','PEN','MARKER','CRAYON']},
      {difficulty:3,category:'Keyboard keys',words:['SHIFT','ENTER','SPACE','TAB']},
      {difficulty:4,category:'Things you can crack',words:['CODE','EGG','JOKE','SAFE']}]},
    {id:'offline-2',title:'Under the Sea',groups:[
      {difficulty:1,category:'Sea creatures',words:['SHARK','SQUID','WHALE','OCTOPUS']},
      {difficulty:2,category:'Parts of a ship',words:['BOW','STERN','DECK','HULL']},
      {difficulty:3,category:'Ocean movements',words:['TIDE','CURRENT','WAVE','SWELL']},
      {difficulty:4,category:'Words preceding fish',words:['STAR','CAT','GOLD','JELLY']}]},
    {id:'offline-3',title:'Big Screen',groups:[
      {difficulty:1,category:'Film genres',words:['HORROR','COMEDY','DRAMA','ACTION']},
      {difficulty:2,category:'Movie production roles',words:['ACTOR','EDITOR','DIRECTOR','PRODUCER']},
      {difficulty:3,category:'Words heard on a film set',words:['ROLL','CUT','TAKE','MARK']},
      {difficulty:4,category:'Things with a plot',words:['STORY','GARDEN','MOVIE','SCHEME']}]},
    {id:'offline-4',title:'Little Wonders',groups:[
      {difficulty:1,category:'Wild animals',words:['ZEBRA','TIGER','LION','BEAR']},
      {difficulty:2,category:'Sweet treats',words:['CAKE','CANDY','COOKIE','FUDGE']},
      {difficulty:3,category:'Things in the sky',words:['CLOUD','STAR','COMET','MOON']},
      {difficulty:4,category:'Music makers',words:['PIANO','DRUM','FLUTE','HARP']}]}
  ];
  const FALLBACK_CLUES = {
    ACE:'Top playing card',ACT:'Something that is done',AGE:'Years since birth',AIR:'What we breathe',ANT:'Tiny colony insect',ARC:'Part of a circle',ARM:'Upper-body limb',ART:'Creative expression',ASH:'Fire remains',AWE:'Wonder and admiration',BAG:'Carrier with handles',BAR:'Long counter',BAT:'Flying night mammal',BAY:'Coastal inlet',BED:'Place to sleep',BEE:'Honey-making insect',BET:'A wager',BIN:'Trash container',BOG:'Swampy ground',BOW:'Shoots arrows',BOX:'Square container',BUD:'Unopened flower',BUG:'Insect or coding error',BUS:'Large public vehicle',CAB:'Taxi',CAP:'Head covering',CAR:'Four-wheeled vehicle',CAT:'Household feline',COW:'Milk-giving farm animal',CUB:'Young bear',CUP:'Small drinking vessel',CUT:'Slice through',DAY:'Twenty-four hours',DEN:'Wild animal home',DEW:'Morning moisture',DIG:'Move earth',DOG:'Loyal pet that barks',DOT:'Tiny round mark',DRY:'Not wet',EAR:'Organ for hearing',EAT:'Consume food',EEL:'Snake-shaped fish',EGG:'Birds lay one',ELF:'Fantasy helper',ELK:'Large antlered deer',END:'The finish',ERA:'Period of history',EYE:'Organ for seeing',FAN:'Blows air',FIG:'Small sweet fruit',FIN:'Fish appendage',FLY:'Travel through air',FOG:'Cloud near the ground',FOX:'Clever red canine',GAS:'One state of matter',GEM:'Precious stone',GUM:'Chewing substance',GYM:'Workout place',HAM:'Cured meat',HAT:'Worn on your head',HAY:'Dried grass',HEN:'Female chicken',HOP:'Small jump',HUG:'A warm embrace',ICE:'Frozen water',INK:'Pen fluid',ION:'Charged atom',IVY:'Climbing vine',JAM:'Fruit spread',JAR:'Glass container',JAW:'Part of a skull',JET:'Fast aircraft',JOB:'Paid work',JOG:'Run slowly',JOY:'Happiness',JUG:'Large pouring container',KEY:'Opens a lock',LAB:'Research room',LAP:'One circuit',LAW:'Enforced rule',LEG:'Used for walking',LID:'Container cover',LOG:'Cut tree segment',MAP:'Shows places',MAT:'Small floor covering',MIX:'Combine together',MOP:'Floor-cleaning tool',MUD:'Wet dirt',MUG:'Coffee cup',NAP:'Short sleep',NET:'Mesh for catching',NOD:'Move head in agreement',NUT:'Hard-shelled seed',OAK:'Acorn-bearing tree',OAR:'Boat paddle',OAT:'Breakfast grain',OIL:'Slippery liquid',OWL:'Night bird',PAN:'Flat cooking vessel',PAW:'Animal foot',PEA:'Little green vegetable',PEN:'Writing tool',PET:'Animal companion',PIE:'Pastry with filling',PIG:'Farm animal',PIN:'Small metal fastener',POT:'Cooking container',RAM:'Male sheep',RAT:'Small rodent',RAW:'Not cooked',RED:'Stop sign color',RIB:'Curved chest bone',RIM:'Outer edge',RIP:'Tear',ROD:'Thin straight bar',ROW:'A line of things',RUG:'Floor covering',RUN:'Move quickly on foot',SAD:'Not happy',SAP:'Tree fluid',SAW:'Cutting tool',SEA:'Large saltwater body',SEE:'Use your eyes',SET:'Collection',SEW:'Make stitches',SIP:'Take a tiny drink',SIR:'Polite male address',SIT:'Take a seat',SKI:'Slide on snow',SKY:'Above the clouds',SOB:'Cry',SON:'Male child',SOW:'Plant seeds',SPA:'Relaxation retreat',SPY:'Secret agent',SUN:'Our nearest star',TAN:'Light brown',TAP:'A faucet',TAR:'Road-making substance',TAX:'Government charge',TEA:'Leaf-steeped drink',TEN:'The number after nine',TIE:'Formal neckwear',TIN:'Metal in cans',TIP:'Helpful suggestion',TOE:'Foot digit',TOP:'Highest part',TOY:'Child plaything',TRY:'Make an attempt',TUB:'Bath container',TUG:'Pull firmly',TWO:'One plus one',URN:'Large decorative vase',USE:'Employ',VAN:'Large road vehicle',VAT:'Industrial container',VET:'Animal doctor',VIA:'By way of',VOW:'A promise',WAR:'Armed conflict',WAX:'Candle material',WAY:'A route',WEB:'Spider construction',WET:'Not dry',WIG:'Artificial hair',WIN:'Succeed',WIT:'Clever humor',WOK:'Round cooking pan',YAK:'Hairy Himalayan animal',YAM:'Starchy root',YES:'A positive answer',ZIP:'Sliding fastener',ZOO:'Place with wild animals'
  };

  const today = new Date();
  const dayKey = [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
  $('#dateLabel').textContent = today.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}).toUpperCase();
  const hash = str => {let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const random = seed => {let s=seed>>>0;return () => {s=(s+0x6d2b79f5)|0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}};
  const shuffle = (values,rng=Math.random) => {const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result};
  const clean = w => String(w).trim().toUpperCase();
  const lettersOnly = w => /^[A-Z]+$/.test(w);
  const timeFormat = ms => {const s=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
  const getJSON = (key,defaultValue) => {try{return JSON.parse(localStorage.getItem(key))??defaultValue}catch{return defaultValue}};
  const dateDiff = (a,b) => Math.round((Date.parse(a+'T12:00:00')-Date.parse(b+'T12:00:00'))/86400000);
  const usesSiteRelay=location.hostname==='terminal.local'||location.hostname.endsWith('.chatgpt.site');
  const apiBase=usesSiteRelay?'/api':'https://api.anrat.link';
  const endpoints = {connections:apiBase+'/connections',crossword:apiBase+'/crossword',words:apiBase+'/words?length=5'};
  let snapshotPromise=null;
  const fetchJSON = async path => {
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),19000);
    try{
      const response=await fetch(path,{signal:controller.signal,headers:{accept:'application/json'}});
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      const data=await response.json();data.__source=response.headers.get('X-AnRat-Source')||'live';return data;
    }catch(error){
      snapshotPromise ||= fetch('./api-snapshot.json').then(r=>{if(!r.ok)throw Error('Snapshot unavailable');return r.json()});
      const snapshot=await snapshotPromise;
      const url=new URL(path,location.href),key='/api'+url.pathname.replace(/^\/api/,'')+url.search;
      if(!snapshot[key])throw error;
      return {...snapshot[key],__source:'snapshot'};
    }finally{clearTimeout(timer)}
  };
  let puzzles=FALLBACK, dictionary=Object.entries(FALLBACK_CLUES).map(([word,clue])=>({word,clue})), wordCatalogue=new Set(), apiOnline=false;
  let roundOffset=Number(sessionStorage.getItem('anrat.layers.offset')||0)||0;
  let puzzle=null,locks={},boardOrder=[],state=null,stateKey='',activeModal=null,miniSession={},toastTimer=null,started=false,soundOn=true,hasInteracted=false;
  let justUnlockedType=null,justSolvedGroup=null;

  const validPuzzle = p => p&&Array.isArray(p.groups)&&p.groups.length===4&&p.groups.every(g=>typeof g.category==='string'&&Array.isArray(g.words)&&g.words.length===4&&g.words.every(w=>typeof w==='string'&&w.trim()))&&new Set(p.groups.flatMap(g=>g.words.map(clean))).size===16;
  function planLocks(p,seed){
    const groups=p.groups;
    const rng=random(seed);
    const eligibility={letterlock:w=>lettersOnly(w)&&w.length===5,anagram:w=>lettersOnly(w)&&w.length>=4&&w.length<=12,crossword:w=>lettersOnly(w)&&w.length>=3&&w.length<=8,wordsearch:w=>lettersOnly(w)&&w.length>=4&&w.length<=9};
    const order=['letterlock','crossword','wordsearch','anagram'];
    const result={};
    function assign(index,used){
      if(index===order.length)return true;
      const type=order[index];
      const options=shuffle(groups.flatMap((g,gi)=>g.words.map(clean).filter(eligibility[type]).map(word=>({gi,word}))),rng)
        .sort((a,b)=>type==='crossword'?Number(!!dictionary.find(d=>d.word===b.word))-Number(!!dictionary.find(d=>d.word===a.word)):0);
      for(const item of options){if(used.has(item.gi))continue;result[type]=item.word;used.add(item.gi);if(assign(index+1,used))return true;used.delete(item.gi)}
      delete result[type];return false;
    }
    return assign(0,new Set())?result:null;
  }
  /* Bonus rounds are composed from the category catalogue plus fresh word families.
     Groups from the API keep their human-written meaning, while family groups are
     drawn from the crossword clue list and checked against the word-list API. */
  function generatedWordFamilies(rng){
    const suffixes=['IGHT','OUND','ATCH','ABLE','AKE','EAR','ELL','ONE','ATE','INK','ASH','ORE','OOK','ALL','ANT','AME','EST','ICK','AIN','OON','ARK'];
    const candidateWords=new Set(dictionary.map(entry=>entry.word).filter(word=>
      lettersOnly(word)&&word.length>=4&&word.length<=7&&(word.length!==5||!wordCatalogue.size||wordCatalogue.has(word))));
    return shuffle(suffixes,rng).map(suffix=>{
      const options=shuffle([...candidateWords].filter(word=>word.endsWith(suffix)),rng);
      return options.length>=4?{difficulty:4,category:`Words ending in -${suffix.toLowerCase()}`,words:options.slice(0,4)}:null;
    }).filter(Boolean);
  }
  function generateBonusRound(offset){
    const seed=hash(`${dayKey}:bonus:${offset}`),rng=random(seed);
    const byLevel=[1,2,3,4].map(difficulty=>shuffle(puzzles.flatMap(p=>p.groups.filter(g=>g.difficulty===difficulty)),rng));
    if(byLevel.some(groups=>!groups.length))return null;
    const families=generatedWordFamilies(rng),familyLevel=1+Math.floor(rng()*4);
    for(let attempt=0;attempt<150;attempt++){
      const family=families.length?families[(attempt+offset)%families.length]:null;
      const groups=[],used=new Set();
      let valid=true;
      for(let level=1;level<=4;level++){
        const choices=level===familyLevel&&family?[family]:shuffle(byLevel[level-1],rng);
        const group=choices.find(candidate=>candidate.words.every(word=>!used.has(clean(word)))&&
          (!family||level===familyLevel||candidate.words.every(word=>!clean(word).endsWith(family.category.slice('Words ending in -'.length).toUpperCase()))));
        if(!group){valid=false;break}
        groups.push({...group,difficulty:level,words:group.words.map(clean)});
        group.words.forEach(word=>used.add(clean(word)));
      }
      if(!valid)continue;
      const candidate={id:`mix-${dayKey}-${offset}`,title:`Word Mix #${offset}`,groups};
      const planned=planLocks(candidate,hash(`${seed}:locks`));
      if(planned)return {candidate,planned};
    }
    return null;
  }
  function findRound(offset){
    if(offset>0){const generated=generateBonusRound(offset);if(generated)return generated}
    const pool=shuffle(puzzles,random(hash(dayKey+':board')));
    for(let i=0;i<pool.length;i++){const candidate=pool[(i+offset)%pool.length];const planned=planLocks(candidate,hash(dayKey+':'+candidate.id+':'+offset));if(planned)return {candidate,planned}}
    for(const candidate of FALLBACK){const planned=planLocks(candidate,hash(dayKey+':'+candidate.id));if(planned)return {candidate,planned}}
    throw Error('No compatible puzzles');
  }
  function beginRound(offset=roundOffset){
    roundOffset=offset;sessionStorage.setItem('anrat.layers.offset',String(offset));
    const round=findRound(offset);puzzle=round.candidate;locks=round.planned;
    const rng=random(hash(dayKey+':'+puzzle.id+':layout:'+offset));
    boardOrder=shuffle(puzzle.groups.flatMap((g,group)=>g.words.map(word=>({word:clean(word),group,lockType:TYPES.find(type=>locks[type]===clean(word))||null}))),rng);
    stateKey=`anrat.layers.v2:${dayKey}:${puzzle.id}:${offset}`;
    const saved=getJSON(stateKey,null);
    if(saved&&(saved.unlocked?.length||saved.solved?.length||saved.selected?.length||saved.endedAt))hasInteracted=true;
    state={unlocked:[],solved:[],selected:[],mistakes:4,startedAt:Date.now(),endedAt:null,won:false,order:boardOrder.map(t=>t.word),...saved};
    state.unlocked=(state.unlocked||[]).filter(t=>TYPES.includes(t));
    state.solved=(state.solved||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<4);
    state.selected=(state.selected||[]).filter(word=>boardOrder.some(t=>t.word===word));
    state.mistakes=Math.max(0,Math.min(4,Number(state.mistakes)));
    const ordered=new Map(boardOrder.map(t=>[t.word,t]));
    if(Array.isArray(state.order)&&state.order.length===16&&state.order.every(w=>ordered.has(w)))boardOrder=state.order.map(w=>ordered.get(w));
    activeModal=null;miniSession={};closeModal(true);
    $('#puzzleTag').textContent=offset===0?'DAILY · #'+String(puzzle.id):'BONUS · #'+String(puzzle.id);
    $('#puzzleTitle').textContent=puzzle.title||'The final connection';
    $('#boardSubhead').textContent='Four secret groups. Sixteen connected words.';
    render();
  }
  function save(){if(!state)return;state.order=boardOrder.map(t=>t.word);try{localStorage.setItem(stateKey,JSON.stringify(state))}catch{}}
  function getStats(){return getJSON('anrat.layers.stats.v2',{played:0,wins:0,streak:0,bestStreak:0,lastDay:null,totalSeconds:0})}
  function completeRound(won){
    if(state.endedAt)return;
    state.endedAt=Date.now();state.won=won;
    if(roundOffset===0){
      const stats=getStats();
      const recordKey=`anrat.layers.recorded:${dayKey}`;
      if(!localStorage.getItem(recordKey)){
        stats.played++;if(won)stats.wins++;
        stats.streak=stats.lastDay===dayKey?stats.streak:stats.lastDay&&dateDiff(dayKey,stats.lastDay)===1?stats.streak+1:1;
        stats.bestStreak=Math.max(stats.bestStreak,stats.streak);
        stats.lastDay=dayKey;stats.totalSeconds+=Math.floor((state.endedAt-state.startedAt)/1000);
        localStorage.setItem('anrat.layers.stats.v2',JSON.stringify(stats));localStorage.setItem(recordKey,'1');
      }
    }
    save();render();sound(won?'win':'error');
    setTimeout(()=>{if(!activeModal)openEnd()},550);
  }
  function unlock(type){
    if(state.unlocked.includes(type))return;
    state.unlocked.push(type);save();sound('win');justUnlockedType=type;render();
    activeModal=null;closeModal(true);
    toast(`✦ ${locks[type]} unlocked! One more piece of the puzzle.`);
  }
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500)}
  function setMessage(message,kind=''){const el=$('#boardMessage');el.textContent=message;el.className='board-message'+(kind?' '+kind:'')}
  function sound(type){if(!soundOn)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const notes=type==='win'?[520,650,820]:type==='error'?[205,165]:[380];notes.forEach((hz,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=hz;o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.0001,ctx.currentTime+i*.08);g.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+i*.08+.01);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+i*.08+.18);o.start(ctx.currentTime+i*.08);o.stop(ctx.currentTime+i*.08+.2)});setTimeout(()=>ctx.close(),900)}catch{}}
  function render(){
    if(!state)return;
    const unlocked=state.unlocked.length;
    $('#unlockedCount').textContent=unlocked+' / 4';$('#unlockBar').style.width=unlocked*25+'%';
    $('#groupsValue').innerHTML=state.solved.length+'<span>/4</span>';
    $('#streakValue').innerHTML=getStats().streak+'<span> days</span>';
    $('#solvedCounter').textContent=`${state.solved.length} OF 4 GROUPS`;
    $('#mistakesCount').textContent=`${state.mistakes} LEFT`;
    $('#hearts').innerHTML=Array.from({length:4},(_,i)=>`<span class="${i>=state.mistakes?'spent':''}">♥</span>`).join('');
    $('#hearts').setAttribute('aria-label',`${state.mistakes} mistakes remaining`);
    $('#challengeList').innerHTML=TYPES.map(type=>{const m=META[type],done=state.unlocked.includes(type);return `<button class="challenge-item ${done?'done':''}" data-type="${type}" data-open="${type}" aria-label="${m.name}, ${done?'solved':'not solved'}"><span class="challenge-icon">${done?'✓':m.symbol}</span><span><span class="challenge-name">${m.name}</span><span class="challenge-status">${done?'UNLOCKED · '+escapeHTML(locks[type]):m.caption.toUpperCase()}</span></span><span class="challenge-arrow">${done?'✓':'↗'}</span></button>`}).join('');
    const solvedGroups=$('#solvedGroups');solvedGroups.innerHTML=state.solved.map(gi=>{const g=puzzle.groups[gi];return `<div class="solved-group level-${Math.max(1,Math.min(4,Number(g.difficulty)||1))} ${justSolvedGroup===gi?'animate-in':''}"><b>${escapeHTML(g.category)}</b><span>${g.words.map(escapeHTML).join(' · ')}</span></div>`}).join('');
    const remaining=boardOrder.filter(t=>!state.solved.includes(t.group));
    $('#wordBoard').innerHTML=remaining.map(t=>{
      const locked=t.lockType&&!state.unlocked.includes(t.lockType);
      if(locked)return `<button type="button" class="word-tile locked" data-lock="${t.lockType}" data-open="${t.lockType}" aria-label="Play ${META[t.lockType].name} to reveal a hidden word"><span class="tile-icon">${META[t.lockType].symbol}</span><span class="tile-type">${META[t.lockType].name.toUpperCase()}</span></button>`;
      const selected=state.selected.includes(t.word);
      return `<button type="button" class="word-tile ${selected?'selected':''} ${t.lockType?'revealed':''} ${justUnlockedType===t.lockType?'animate-in':''}" data-word="${escapeHTML(t.word)}" aria-pressed="${selected}">${escapeHTML(t.word)}</button>`;
    }).join('');
    justUnlockedType=null;justSolvedGroup=null;
    $('#submitButton').disabled=state.selected.length!==4||!!state.endedAt;
    $('[data-action="shuffle"]').disabled=!!state.endedAt;
    $('[data-action="deselect"]').disabled=state.selected.length===0||!!state.endedAt;
    if(state.endedAt)setMessage(state.won?'Brilliant! All four connections are solved. ✦':'Out of guesses — the remaining connections are revealed.',state.won?'good':'bad');
    else if(unlocked===4&&state.solved.length===0)setMessage('All four words revealed. Find their hidden connections!','good');
    else if(state.selected.length===4)setMessage('Four words selected. Ready to submit your group?');
    else setMessage(state.solved.length?'Nice! Keep discovering the remaining groups.':'Tap a mystery tile to play a mini-game, or choose four related words.');
    tick();
  }
  function tick(){if(!state)return;const elapsed=(state.endedAt||Date.now())-state.startedAt;$('#timeValue').textContent=timeFormat(elapsed)}
  function updateSelectionUI(){
    // Preserve existing tiles and solved-category nodes while selecting words.
    // Replacing their HTML would restart each reveal animation and flash the board.
    for(const tile of $$('#wordBoard [data-word]')){
      const selected=state.selected.includes(tile.dataset.word);
      tile.classList.toggle('selected',selected);
      tile.setAttribute('aria-pressed',String(selected));
    }
    $('#submitButton').disabled=state.selected.length!==4||!!state.endedAt;
    $('[data-action="deselect"]').disabled=state.selected.length===0||!!state.endedAt;
    if(state.selected.length===4)setMessage('Four words selected. Ready to submit your group?');
    else setMessage(state.solved.length?'Keep finding the remaining groups.':'Select four related words, or tap a mystery tile to unlock it.');
  }
  function toggleWord(word){
    if(state.endedAt)return;
    hasInteracted=true;
    if(state.selected.includes(word))state.selected=state.selected.filter(w=>w!==word);
    else if(state.selected.length<4)state.selected.push(word);
    else{toast('Choose only four words at a time.');return}
    sound('click');save();updateSelectionUI();
  }
  function submitGroup(){
    if(!state||state.selected.length!==4||state.endedAt)return;
    hasInteracted=true;
    const matched=puzzle.groups.findIndex(g=>g.words.every(w=>state.selected.includes(clean(w))));
    if(matched!==-1){
      if(!state.solved.includes(matched))state.solved.push(matched);
      state.selected=[];justSolvedGroup=matched;save();render();
      setMessage('Perfect connection: '+puzzle.groups[matched].category,'good');sound('win');
      if(state.solved.length===4)completeRound(true);
    }else{
      const oneAway=puzzle.groups.some(g=>g.words.filter(w=>state.selected.includes(clean(w))).length===3);
      state.mistakes--;state.selected=[];
      if(state.mistakes===0){state.correctGroups=state.solved.length;state.solved=[0,1,2,3];save();completeRound(false)}
      else{save();render();setMessage(oneAway?'One away! Three of those words belong together.':'Not quite. Try a different combination.','bad');sound('error')}
    }
  }
  function shuffleBoard(){
    hasInteracted=true;
    const available=boardOrder.filter(t=>!state.solved.includes(t.group));
    const rng=random((Date.now()>>>0)^hash(puzzle.id));
    const shuffled=shuffle(available,rng);let index=0;
    boardOrder=boardOrder.map(t=>state.solved.includes(t.group)?t:shuffled[index++]);save();render();
  }

  async function loadAPIs(){
    const [connections,crosswords,words]=await Promise.allSettled([fetchJSON(endpoints.connections),fetchJSON(endpoints.crossword),fetchJSON(endpoints.words)]);
    if(connections.status==='fulfilled'){
      const list=Array.isArray(connections.value.puzzles)?connections.value.puzzles.filter(validPuzzle):[];
      if(list.length){puzzles=list;apiOnline=connections.value.__source==='live'}
    }
    if(crosswords.status==='fulfilled'){
      const map=crosswords.value.lengths||{};
      const entries=Object.values(map).flatMap(words=>Object.entries(words||{}).map(([word,clue])=>({word:clean(word),clue:String(clue)}))).filter(d=>/^[A-Z]{3,8}$/.test(d.word)&&d.clue&&d.clue!=='undefined');
      if(entries.length>25)dictionary=entries;
    }
    if(words.status==='fulfilled'){
      const map=words.value.lengths||{};
      wordCatalogue=new Set(Object.values(map).flatMap(w=>Array.isArray(w)?w.map(clean):[]).filter(lettersOnly));
    }
    $('#apiStatus').textContent=apiOnline?'LIVE API SYNCED':puzzles===FALLBACK?'OFFLINE PACK READY':'API DATA READY';
    if(!hasInteracted)beginRound(roundOffset);
    started=true;
  }

  /* Modal shell and the four unlock challenges */
  function frame(kicker,title,description,content){return `<div class="modal-inner"><div class="modal-header"><span class="modal-eyebrow">${escapeHTML(kicker)}</span><h2 id="modalTitle">${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p></div><div class="modal-divider"></div>${content}</div>`}
  function openModal(content,kind){
    activeModal=kind;
    $('#modalBody').innerHTML=content;
    $('#overlay').hidden=false;document.body.style.overflow='hidden';
    $('.modal').scrollTop=0;
    $('.modal-close').focus();
  }
  function closeModal(silent=false){
    $('#overlay').hidden=true;document.body.style.overflow='';activeModal=null;
    if(!silent)$('[data-action="how"]')?.focus();
  }
  function openMini(type){
    if(!state||!TYPES.includes(type))return;
    hasInteracted=true;
    if(state.unlocked.includes(type)){toast(`${locks[type]} is already unlocked!`);return}
    if(!miniSession[type]){
      if(type==='letterlock')miniSession[type]={guesses:[],current:'',error:''};
      if(type==='anagram')miniSession[type]={order:shuffle(locks[type].split('').map((letter,index)=>({letter,index})),random(hash(locks[type]+puzzle.id))),picked:[],error:''};
      if(type==='crossword')miniSession[type]={grid:buildCrossword(locks[type]),filled:{},complete:[],selected:'',cursor:0,error:''};
      if(type==='wordsearch')miniSession[type]={grid:buildWordsearch(locks[type]),start:null,end:null,dragging:false,error:''};
    }
    if(type==='crossword'&&!miniSession[type].selected)miniSession[type].selected=miniSession[type].grid.entries.find(e=>e.id!=='target')?.id||'target';
    openModal('',type);
    renderMini();
  }
  function keyRows(){return ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((line,i)=>`<div class="key-row">${line.split('').map(letter=>`<button type="button" class="key" data-mini-key="${letter}">${letter}</button>`).join('')}${i===2?'<button type="button" class="key wide" data-mini-key="BACKSPACE">⌫</button>':''}</div>`).join('')}
  function renderMini(){
    if(!activeModal||!TYPES.includes(activeModal))return;
    const type=activeModal,m=META[type],target=locks[type];
    let inner='';
    if(type==='letterlock')inner=renderLetterLock();
    if(type==='anagram')inner=renderAnagram();
    if(type==='crossword')inner=renderCrossword();
    if(type==='wordsearch')inner=renderWordsearch();
    $('#modalBody').innerHTML=frame(`MINI-GAME · ${TYPES.indexOf(type)+1} OF 4`,m.name,m.blurb,inner);
    if(type==='wordsearch')attachSearchPointer();
  }
  function winMini(type){
    if(activeModal!==type)return;
    unlock(type);
  }

  /* LetterLock: Wordle feedback with duplicate-letter accounting */
  function scoreGuess(guess,target){
    const result=Array(target.length).fill('absent'),counts={};
    for(let i=0;i<target.length;i++)if(guess[i]===target[i])result[i]='correct';else counts[target[i]]=(counts[target[i]]||0)+1;
    for(let i=0;i<target.length;i++)if(result[i]!=='correct'&&counts[guess[i]]>0){result[i]='present';counts[guess[i]]--}
    return result;
  }
  function renderLetterLock(){
    const s=miniSession.letterlock,target=locks.letterlock;
    const rows=Array.from({length:6},(_,i)=>{const guess=s.guesses[i]||((i===s.guesses.length)?s.current:'');const feedback=s.guesses[i]?scoreGuess(guess,target):[];return `<div class="letterlock-row">${Array.from({length:5},(_,j)=>`<span class="letterlock-cell ${feedback[j]|| (guess[j]?'filled':'')}">${guess[j]||''}</span>`).join('')}</div>`}).join('');
    const colors={};for(const guess of s.guesses){const result=scoreGuess(guess,target);guess.split('').forEach((letter,i)=>{const rank={absent:1,present:2,correct:3};if((rank[result[i]]||0)>(rank[colors[letter]]||0))colors[letter]=result[i]})}
    const keyboard=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((line,i)=>`<div class="key-row">${line.split('').map(c=>`<button type="button" class="key ${colors[c]||''}" data-mini-key="${c}">${c}</button>`).join('')}${i===2?'<button type="button" class="key wide" data-mini-key="BACKSPACE">⌫</button><button type="button" class="key wide" data-mini-key="ENTER">ENTER</button>':''}</div>`).join('');
    return `<div class="letterlock-grid">${rows}</div><p class="modal-status ${s.error?'bad':''}">${escapeHTML(s.error||`${6-s.guesses.length} guesses remaining · ${target.length} letters`)}</p><div class="mini-keyboard">${keyboard}</div>`;
  }
  function letterlockKey(letter){
    const s=miniSession.letterlock;if(!s||activeModal!=='letterlock')return;
    s.error='';
    if(letter==='BACKSPACE')s.current=s.current.slice(0,-1);
    else if(letter==='ENTER'){
      if(s.current.length!==5){s.error='Enter a five-letter guess.';renderMini();return}
      if(wordCatalogue.size&& !wordCatalogue.has(s.current) && s.current!==locks.letterlock){s.error='That word is not in the word list.';renderMini();return}
      s.guesses.push(s.current);
      if(s.current===locks.letterlock){winMini('letterlock');return}
      s.current='';sound('click');
      if(s.guesses.length>=6){s.error='No guesses left. Try a new LetterLock round!';s.guesses=[]}
    }
    else if(/^[A-Z]$/.test(letter)&&s.current.length<5)s.current+=letter;
    renderMini();
  }

  /* Anagram: four-word grouping's secret word, not a disconnected answer */
  function renderAnagram(){
    const s=miniSession.anagram,target=locks.anagram;
    const slots=Array.from({length:target.length},(_,i)=>{const index=s.picked[i],item=index===undefined?null:s.order[index];const correct=item?.letter===target[i];return `<button type="button" class="anagram-slot ${item?'filled':''} ${correct?'correct':''}" data-anagram-back="${i}" aria-label="${item?'Remove '+item.letter+(correct?', correct position':''):'Empty letter slot'}">${item?item.letter:'·'}</button>`}).join('');
    const pool=s.order.map((item,i)=>`<button type="button" class="anagram-letter" data-anagram-pick="${i}" ${s.picked.includes(i)?'disabled':''} aria-label="Add ${item.letter}">${item.letter}</button>`).join('');
    return `<div class="anagram-tray">${slots}</div><p class="anagram-caption">${target.length} LETTERS · ONE HIDDEN WORD</p><div class="anagram-pool">${pool}</div><p class="modal-status ${s.error?'bad':''}">${escapeHTML(s.error||'Tap the letters to spell the secret word.')}</p><div class="mini-controls"><button type="button" class="game-button" data-mini-action="anagram-back">⌫ Back</button><button type="button" class="game-button" data-mini-action="anagram-shuffle">⇄ Shuffle</button><button type="button" class="game-button" data-mini-action="anagram-clear">Clear</button><button type="button" class="game-button primary" data-mini-action="anagram-check">Check word ↗</button></div>`;
  }
  function anagramPick(index){const s=miniSession.anagram;if(!s||s.picked.includes(index)||s.picked.length>=locks.anagram.length)return;s.picked.push(index);s.error='';renderMini()}
  function anagramAction(action){
    const s=miniSession.anagram;if(!s)return;
    if(action==='anagram-back')s.picked.pop();
    if(action==='anagram-clear')s.picked=[];
    if(action==='anagram-shuffle'){const unused=s.order.filter((_,i)=>!s.picked.includes(i));const used=s.picked.map(i=>s.order[i]);s.order=[...used,...shuffle(unused)];s.picked=used.map((_,i)=>i)}
    if(action==='anagram-check'){
      if(s.picked.length!==locks.anagram.length)s.error='Use every letter first.';
      else if(s.picked.map(i=>s.order[i].letter).join('')===locks.anagram){winMini('anagram');return}
      else{s.error='Not quite! Rearrange the letters and try again.';sound('error')}
    }
    renderMini();
  }

  /* Build a compact interlocking crossword through the target answer. */
  function buildCrossword(target){
    const rng=random(hash(dayKey+':cross:'+target+':'+puzzle.id));
    const choices=shuffle(Array.from({length:target.length},(_,i)=>i),rng).sort((a,b)=>(a%2)-(b%2));
    const used=new Set([target]),entries=[{id:'target',word:target,clue:'The hidden word — solve the crossing clues',dir:'across',cells:[]}];
    const baseRow=5;
    for(const col of choices){
      if(entries.length>=Math.min(5,Math.ceil(target.length/2)+1))break;
      if(entries.some(e=>e.id!=='target'&&Math.abs(e.col-col)<2))continue;
      const options=shuffle(dictionary.filter(d=>d.word!==target&&d.word.length>=3&&d.word.length<=6&&d.word.includes(target[col])&&!used.has(d.word)&&d.clue.length<=105),rng);
      const candidate=options.find(d=>d.word.includes(target[col]));
      if(!candidate)continue;
      const matches=candidate.word.split('').map((letter,i)=>letter===target[col]?i:-1).filter(i=>i>=0);
      const position=matches[Math.floor(rng()*matches.length)];
      entries.push({id:'down-'+col,word:candidate.word,clue:candidate.clue,dir:'down',col,start:baseRow-position,cells:[]});
      used.add(candidate.word);
    }
    if(entries.length<3){
      // This is unusual with the live clue catalogue, but keep the game playable offline.
      const backup=shuffle(Object.entries(FALLBACK_CLUES).map(([word,clue])=>({word,clue})),rng);
      for(let col=0;col<target.length&&entries.length<3;col++){
        if(entries.some(e=>e.id!=='target'&&Math.abs(e.col-col)<2))continue;
        const candidate=backup.find(d=>d.word.includes(target[col])&&!used.has(d.word));if(!candidate)continue;
        const position=candidate.word.indexOf(target[col]);entries.push({id:'down-'+col,word:candidate.word,clue:candidate.clue,dir:'down',col,start:baseRow-position,cells:[]});used.add(candidate.word);
      }
    }
    const low=Math.min(baseRow,...entries.slice(1).map(e=>e.start));
    const high=Math.max(baseRow,...entries.slice(1).map(e=>e.start+e.word.length-1));
    const rows=high-low+1,cols=target.length,grid=Array.from({length:rows},()=>Array(cols).fill(null));
    entries[0].cells=target.split('').map((letter,c)=>`${baseRow-low},${c}`);
    for(const entry of entries.slice(1))entry.cells=entry.word.split('').map((letter,i)=>`${entry.start-low+i},${entry.col}`);
    for(const entry of entries)entry.cells.forEach((key,i)=>{const [r,c]=key.split(',').map(Number);if(!grid[r][c])grid[r][c]={letter:entry.word[i],key};});
    const starts=new Map();const sorted=entries.map(e=>({...e,startCell:e.cells[0]})).sort((a,b)=>{const [ar,ac]=a.startCell.split(',').map(Number),[br,bc]=b.startCell.split(',').map(Number);return ar-br||ac-bc});
    sorted.forEach(e=>{if(!starts.has(e.startCell))starts.set(e.startCell,starts.size+1)});
    entries.forEach(e=>e.num=starts.get(e.cells[0]));
    return {rows,cols,grid,entries};
  }
  function renderCrossword(){
    const s=miniSession.crossword,cw=s.grid;
    const selected=cw.entries.find(e=>e.id===s.selected)||cw.entries[0];
    const grid=cw.grid.flatMap((row,r)=>row.map((cell,c)=>{
      const key=`${r},${c}`;
      if(!cell)return '<div class="cross-cell blank"></div>';
      const inWord=selected.cells.includes(key),active=selected.cells[s.cursor]===key,solved=cw.entries.some(e=>s.complete.includes(e.id)&&e.cells.includes(key));
      const first=cw.entries.find(e=>e.cells[0]===key);
      return `<button type="button" class="cross-cell ${inWord?'in-word':''} ${active?'active':''} ${solved?'solved':''}" data-cross-cell="${key}" aria-label="Crossword cell ${r+1}, ${c+1}">${first?`<small>${first.num}</small>`:''}${s.filled[key]||''}</button>`;
    })).join('');
    const clueHTML=dir=>cw.entries.filter(e=>e.dir===dir).map(e=>`<button type="button" class="${e.id===s.selected?'active':''} ${s.complete.includes(e.id)?'done':''}" data-cross-clue="${e.id}"><b>${e.num}.</b> ${escapeHTML(e.clue)} (${e.word.length}) ${s.complete.includes(e.id)?'✓':''}</button>`).join('');
    return `<div class="crossword-selected"><b>${selected.num} ${selected.dir.toUpperCase()}</b> ${escapeHTML(selected.clue)}</div><div class="crossword-layout"><div><div class="crossword-grid" style="grid-template-columns:repeat(${cw.cols},minmax(0,1fr));max-width:${Math.min(370,cw.cols*48)}px">${grid}</div></div><div class="crossword-clues"><section><h3>Across</h3>${clueHTML('across')}</section><section><h3>Down</h3>${clueHTML('down')}</section></div></div><p class="modal-status ${s.error?'bad':''}">${escapeHTML(s.error||'Tap a clue and type its answer. Check the mystery word to unlock it.')}</p><div class="mini-controls"><button type="button" class="game-button" data-mini-action="cross-back">⌫ Back</button><button type="button" class="game-button" data-mini-action="cross-clear">Clear word</button><button type="button" class="game-button primary" data-mini-action="cross-check">Check answer ↗</button></div><div class="mini-keyboard">${keyRows()}</div>`;
  }
  function crossSelect(id,at=0){const s=miniSession.crossword;if(!s)return;s.selected=id;s.cursor=at;s.error='';renderMini()}
  function crossNextWord(step=1){
    const s=miniSession.crossword;if(!s)return;
    const entries=s.grid.entries.filter(entry=>!s.complete.includes(entry.id)).sort((a,b)=>a.num-b.num||(a.dir==='across'?-1:1));
    if(!entries.length)return;
    const index=entries.findIndex(entry=>entry.id===s.selected);
    const next=index<0?entries[0]:entries[(index+step+entries.length)%entries.length];
    crossSelect(next.id,0);
  }
  function crossSelectCell(key){
    const s=miniSession.crossword,cw=s.grid;let entry=cw.entries.find(e=>e.id===s.selected&&e.cells.includes(key));
    const matches=cw.entries.filter(e=>e.cells.includes(key));
    if(entry&&matches.length>1&&entry.cells[s.cursor]===key)entry=matches.find(e=>e!==entry);
    if(!entry)entry=matches.find(e=>!s.complete.includes(e.id))||matches[0];
    if(entry)crossSelect(entry.id,entry.cells.indexOf(key));
  }
  function crossKey(letter){
    const s=miniSession.crossword;if(!s||!s.grid)return;
    const entry=s.grid.entries.find(e=>e.id===s.selected);if(!entry||s.complete.includes(entry.id))return;
    s.error='';
    if(letter==='BACKSPACE'){
      let pos=s.cursor;if(!s.filled[entry.cells[pos]]||lockedCrossCell(s,entry.cells[pos]))pos=entry.cells.findLastIndex((k,i)=>i<pos&&s.filled[k]&&!lockedCrossCell(s,k));
      if(pos>=0&&!lockedCrossCell(s,entry.cells[pos])){delete s.filled[entry.cells[pos]];s.cursor=pos}
    }else if(/^[A-Z]$/.test(letter)){
      let pos=entry.cells.findIndex((k,i)=>i>=s.cursor&&!lockedCrossCell(s,k));
      if(pos<0)pos=entry.cells.findIndex(k=>!lockedCrossCell(s,k));
      if(pos>=0){s.filled[entry.cells[pos]]=letter;const next=entry.cells.findIndex((k,i)=>i>pos&&!lockedCrossCell(s,k));s.cursor=next>=0?next:pos}
      if(entry.cells.every((k,i)=>s.filled[k]===entry.word[i])){crossCheck();return}
    }
    renderMini();
  }
  function lockedCrossCell(s,key){return s.grid.entries.some(e=>s.complete.includes(e.id)&&e.cells.includes(key))}
  function crossCheck(){
    const s=miniSession.crossword,entry=s.grid.entries.find(e=>e.id===s.selected);
    if(!entry)return;
    if(entry.cells.map(k=>s.filled[k]||'').join('')!==entry.word){s.error='Not quite right. Try the clue again.';sound('error');renderMini();return}
    if(!s.complete.includes(entry.id))s.complete.push(entry.id);
    entry.cells.forEach((k,i)=>s.filled[k]=entry.word[i]);s.error='Correct!';sound('win');
    if(entry.id==='target'){winMini('crossword');return}
    const next=s.grid.entries.find(e=>!s.complete.includes(e.id));if(next){s.selected=next.id;s.cursor=0}
    const target=s.grid.entries[0];
    if(target.cells.every((k,i)=>s.filled[k]===target.word[i])){winMini('crossword');return}
    renderMini();
  }
  function crossAction(action){
    const s=miniSession.crossword,entry=s.grid.entries.find(e=>e.id===s.selected);
    if(action==='cross-back'){crossKey('BACKSPACE');return}
    if(action==='cross-clear'&&entry){entry.cells.forEach(k=>{if(!lockedCrossCell(s,k))delete s.filled[k]});s.cursor=0;s.error='';renderMini()}
    if(action==='cross-check')crossCheck();
  }

  /* Word Search: guaranteed single target, including backward and diagonal paths */
  function buildWordsearch(target,variation=0){
    const size=9,rng=random(hash(dayKey+':search:'+target+':'+puzzle.id+':'+variation));
    const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    const possible=[];
    for(let r=0;r<size;r++)for(let c=0;c<size;c++)for(const [dr,dc] of dirs){
      const endR=r+dr*(target.length-1),endC=c+dc*(target.length-1);
      if(endR>=0&&endR<size&&endC>=0&&endC<size)possible.push({r,c,dr,dc});
    }
    const position=possible[Math.floor(rng()*possible.length)];
    const alphabet='EEEEEEEEEEEEAAAAAAAARRRRRRRIIIIIIIOOOOOOOTTNNNSSSLLLCCCDDDPPPGGHHHMMFFYYBWVKXJQZ';
    const grid=Array.from({length:size*size},()=>alphabet[Math.floor(rng()*alphabet.length)]);
    const cells=[];for(let i=0;i<target.length;i++){const index=(position.r+position.dr*i)*size+(position.c+position.dc*i);grid[index]=target[i];cells.push(index)}
    return {size,grid,cells};
  }
  function searchClue(target){
    const definition=dictionary.find(d=>d.word===target)?.clue||FALLBACK_CLUES[target];
    return definition?definition:`A ${target.length}-letter word beginning with “${target[0]}”`;
  }
  function renderWordsearch(){
    const s=miniSession.wordsearch,target=locks.wordsearch;
    const cells=s.grid.grid.map((letter,index)=>`<span class="search-cell" data-search-cell="${index}" aria-label="Letter ${letter}">${letter}</span>`).join('');
    return `<div class="search-clue"><b>YOUR CLUE</b><span>${escapeHTML(searchClue(target))}</span></div><div class="search-grid" role="application" aria-label="9 by 9 word search grid">${cells}<svg class="search-line" aria-hidden="true"><line x1="0" y1="0" x2="0" y2="0" style="display:none"></line></svg></div><p class="modal-status ${s.error?'bad':''}">${escapeHTML(s.error||`Drag across ${target.length} connected letters. All eight directions count.`)}</p><div class="mini-controls"><button type="button" class="game-button" data-mini-action="search-shuffle">New letter layout ⇄</button></div>`;
  }
  function selectedSearchCells(){
    const s=miniSession.wordsearch;if(s.start===null||s.end===null)return [];
    const size=s.grid.size,r0=Math.floor(s.start/size),c0=s.start%size,r1=Math.floor(s.end/size),c1=s.end%size;
    const dr=r1-r0,dc=c1-c0;
    if(dr!==0&&dc!==0&&Math.abs(dr)!==Math.abs(dc))return [s.start];
    const length=Math.max(Math.abs(dr),Math.abs(dc))+1;
    const stepR=Math.sign(dr),stepC=Math.sign(dc);
    return Array.from({length},(_,i)=>(r0+stepR*i)*size+c0+stepC*i);
  }
  function updateSearchTrace(){
    const indices=selectedSearchCells(),grid=$('.search-grid');if(!grid)return;
    $$('.search-cell',grid).forEach((cell,i)=>cell.classList.toggle('active',indices.includes(i)));
    const line=$('.search-line line',grid);
    if(indices.length<2){line.style.display='none';return}
    const first=$(`[data-search-cell="${indices[0]}"]`,grid),last=$(`[data-search-cell="${indices[indices.length-1]}"]`,grid);
    const box=grid.getBoundingClientRect(),a=first.getBoundingClientRect(),b=last.getBoundingClientRect();
    const svg=$('.search-line',grid);svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    line.setAttribute('x1',a.left-box.left+a.width/2);line.setAttribute('y1',a.top-box.top+a.height/2);
    line.setAttribute('x2',b.left-box.left+b.width/2);line.setAttribute('y2',b.top-box.top+b.height/2);
    line.style.display='';
  }
  function attachSearchPointer(){
    const grid=$('.search-grid');if(!grid)return;
    grid.addEventListener('pointerdown',e=>{
      const cell=e.target.closest('[data-search-cell]');if(!cell)return;
      const s=miniSession.wordsearch;s.start=Number(cell.dataset.searchCell);s.end=s.start;s.dragging=true;s.error='';
      grid.setPointerCapture(e.pointerId);updateSearchTrace();e.preventDefault();
    });
    grid.addEventListener('pointermove',e=>{
      const s=miniSession.wordsearch;if(!s.dragging)return;
      const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-search-cell]');
      if(cell&&grid.contains(cell)){s.end=Number(cell.dataset.searchCell);updateSearchTrace()}
    });
    const finish=()=>{
      const s=miniSession.wordsearch;if(!s.dragging)return;s.dragging=false;
      const indices=selectedSearchCells(),candidate=indices.map(i=>s.grid.grid[i]).join('');
      if(candidate===locks.wordsearch||candidate.split('').reverse().join('')===locks.wordsearch){winMini('wordsearch');return}
      s.error=indices.length>1?'That is not the hidden word. Try another direction.':'';
      s.start=s.end=null;updateSearchTrace();
      const label=$('.modal-status');if(label){label.textContent=s.error||'Drag across connected letters.';label.classList.toggle('bad',!!s.error)}
      if(s.error)sound('error');
    };
    grid.addEventListener('pointerup',finish);grid.addEventListener('pointercancel',finish);
  }

  /* Information, stats, completion, sharing */
  function openHow(){
    openModal(frame('THE RULES','How to play','Five connected challenges in one game. The whole board is built around four hidden categories.',
      `<ol class="rules-list"><li><strong>Unlock four missing words.</strong> Tap the special tiles or use the left-side mini-game menu. Play LetterLock, Anagram, Crossword, and Word Search.</li><li><strong>Study the full board.</strong> The four words you unlock join twelve visible words. Each belongs to exactly one group of four.</li><li><strong>Find a connection.</strong> Tap any four related words, then press Submit group. Correct groups become colorful solved rows.</li><li><strong>Watch your mistakes.</strong> You have four chances on the final board. Three words from a group earn a “One away!” nudge.</li><li><strong>Come back tomorrow.</strong> The daily puzzle is chosen by date. You can also play bonus rounds whenever you want.</li></ol><div class="mini-controls"><button type="button" class="game-button primary" data-action="close">LET'S PLAY ↗</button></div>`),'how');
  }
  function openStats(){
    const stats=getStats(),winRate=stats.played?Math.round(100*stats.wins/stats.played):0;
    openModal(frame('YOUR JOURNEY','Your stats','Daily progress stays in this browser. Bonus rounds do not affect your streak.',
      `<div class="stats-grid"><div><span>PLAYED</span><b>${stats.played}</b></div><div><span>WIN RATE</span><b>${winRate}%</b></div><div><span>STREAK</span><b>${stats.streak}</b></div><div><span>BEST STREAK</span><b>${stats.bestStreak}</b></div><div><span>WINS</span><b>${stats.wins}</b></div><div><span>TIME TODAY</span><b style="font-size:20px">${timeFormat((state?.endedAt||Date.now())-(state?.startedAt||Date.now()))}</b></div></div><div class="mini-controls"><button type="button" class="game-button" data-action="share">Copy today's result</button><button type="button" class="game-button primary" data-action="close">Back to puzzle ↗</button></div>`),'stats');
  }
  function openEnd(){
    if(!state?.endedAt)return;
    const won=state.won,elapsed=timeFormat(state.endedAt-state.startedAt);
    const text=won?'Every layer, connected.':'The mystery is revealed.';
    openModal(frame('ROUND COMPLETE',won?'Brilliantly done.':'Almost there.','',
      `<div class="end-banner"><div class="end-symbol">${won?'✦':'◈'}</div><h2>${text}</h2><p>${won?'You found all four hidden connections.':'No more mistakes remain, but every puzzle is another chance to learn.'}</p></div><div class="stats-grid"><div><span>WORDS REVEALED</span><b>${state.unlocked.length}/4</b></div><div><span>GROUPS FOUND</span><b>${won?'4':state.correctGroups||0}</b></div><div><span>TIME</span><b style="font-size:23px">${elapsed}</b></div></div><div class="mini-controls"><button type="button" class="game-button" data-action="share">Share result</button><button type="button" class="game-button" data-action="close">View board</button><button type="button" class="game-button primary" data-action="new">Another puzzle ↗</button></div>`),'end');
  }
  async function share(){
    if(!state)return;
    const lines=[`AnRat Layers · ${dayKey}`,`${state.won?4:state.endedAt?state.correctGroups||0:state.solved.length}/4 groups · ${state.unlocked.length}/4 layers`,`${state.won?'✦ Solved!':state.endedAt?'◇ Better luck next time':'◈ In progress'} · ${timeFormat((state.endedAt||Date.now())-state.startedAt)}`,'🟪🟦🟩🟨',new URL('./',location.href).href];
    const value=lines.join('\n');
    try{await navigator.clipboard.writeText(value);toast('Result copied! Share it with a friend.')}catch{toast('Clipboard unavailable on this device.')}
  }

  /* Delegated controls + hardware keyboard */
  document.addEventListener('click',event=>{
    const open=event.target.closest('[data-open]');if(open){openMini(open.dataset.open);return}
    const word=event.target.closest('[data-word]');if(word){toggleWord(word.dataset.word);return}
    const pick=event.target.closest('[data-anagram-pick]');if(pick){anagramPick(Number(pick.dataset.anagramPick));return}
    const back=event.target.closest('[data-anagram-back]');if(back){const s=miniSession.anagram;s.picked.splice(Number(back.dataset.anagramBack),1);renderMini();return}
    const clue=event.target.closest('[data-cross-clue]');if(clue){crossSelect(clue.dataset.crossClue);return}
    const cell=event.target.closest('[data-cross-cell]');if(cell){crossSelectCell(cell.dataset.crossCell);return}
    const key=event.target.closest('[data-mini-key]');if(key){if(activeModal==='letterlock')letterlockKey(key.dataset.miniKey);if(activeModal==='crossword')crossKey(key.dataset.miniKey);return}
    const mini=event.target.closest('[data-mini-action]');if(mini){
      if(activeModal==='anagram')anagramAction(mini.dataset.miniAction);
      if(activeModal==='crossword')crossAction(mini.dataset.miniAction);
      if(activeModal==='wordsearch'&&mini.dataset.miniAction==='search-shuffle'){const s=miniSession.wordsearch;miniSession.wordsearch={grid:buildWordsearch(locks.wordsearch,(s.variation||0)+1),start:null,end:null,dragging:false,error:'',variation:(s.variation||0)+1};renderMini()}
      return;
    }
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!action)return;
    if(action==='close')closeModal();
    if(action==='how')openHow();
    if(action==='stats')openStats();
    if(action==='submit')submitGroup();
    if(action==='shuffle')shuffleBoard();
    if(action==='deselect'){state.selected=[];save();updateSelectionUI()}
    if(action==='today'){hasInteracted=true;beginRound(0);toast("You're playing today's puzzle.")}
    if(action==='new'){hasInteracted=true;beginRound(roundOffset+1);toast('Fresh puzzle loaded!')}
    if(action==='share')share();
    if(action==='sound'){soundOn=!soundOn;event.target.textContent=soundOn?'♫':'♪';event.target.classList.toggle('muted',!soundOn);event.target.setAttribute('aria-pressed',String(soundOn));event.target.title=soundOn?'Sound on':'Sound off';if(soundOn)sound('click')}
  });
  $('#overlay').addEventListener('click',event=>{if(event.target===$('#overlay'))closeModal()});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&activeModal){closeModal();return}
    if(activeModal==='letterlock'&&!event.ctrlKey&&!event.metaKey&&!event.altKey){const letter=event.key.toUpperCase();if(/^[A-Z]$/.test(letter)||letter==='ENTER'||letter==='BACKSPACE'){event.preventDefault();letterlockKey(letter)}return}
    if(activeModal==='crossword'&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
      if(event.key==='Tab'){event.preventDefault();crossNextWord(event.shiftKey?-1:1);return}
      const letter=event.key.toUpperCase();
      if(/^[A-Z]$/.test(letter)||letter==='BACKSPACE'){event.preventDefault();crossKey(letter)}
      if(letter==='ENTER'){event.preventDefault();crossCheck()}
      return;
    }
    if(activeModal==='anagram'&&!event.ctrlKey&&!event.metaKey&&!event.altKey){const letter=event.key.toUpperCase();if(/^[A-Z]$/.test(letter)){const s=miniSession.anagram,index=s.order.findIndex((item,i)=>item.letter===letter&&!s.picked.includes(i));if(index>=0)anagramPick(index)}if(letter==='BACKSPACE')anagramAction('anagram-back');if(letter==='ENTER')anagramAction('anagram-check');return}
    if(!activeModal&&event.key==='Enter'&&state?.selected.length===4){event.preventDefault();submitGroup()}
  });
  setInterval(tick,1000);
  beginRound(roundOffset);
  loadAPIs().catch(error=>{console.error('Initialization failed',error);puzzles=FALLBACK;$('#apiStatus').textContent='OFFLINE PACK READY'});
})();
