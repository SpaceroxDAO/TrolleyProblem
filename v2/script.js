// ===== GAME STATE =====
let currentScenario = 0;
let choices = [];
let isAnimating = false;
let animationFrame;
let trolleyX = 30;

// ===== PHILOSOPHICAL SCORES =====
let scores = {
  utilitarian: 0,
  deontological: 0,
  virtueEthics: 0,
  careEthics: 0,
  contractarian: 0,
  naturalRights: 0,
  // Trait scores
  activeHarm: 0,      // + = willing to actively harm, - = passive only
  impartiality: 0,    // + = impartial, - = partial to loved ones
  consequentialism: 0, // + = outcomes matter, - = rules matter
  flexibility: 0      // + = flexible principles, - = absolute principles
};

let previousChoices = {}; // Track for consistency
let inconsistencies = 0;

// ===== SCENARIOS =====
const scenarios = [
  {
    id: "classic",
    category: "FOUNDATIONAL DILEMMA",
    title: "THE CLASSIC TROLLEY",
    description: "A runaway trolley speeds toward five railway workers. You stand by a lever that can divert it to a side track, where only one worker stands. The five cannot escape in time.",
    stakes: 30,
    choiceA: {
      text: "Do nothing - let the trolley continue",
      emoji: "🚫",
      result: "You allowed five people to die rather than directly cause one death. Your hands remain 'clean,' but five families grieve tonight.",
      outcomeText: "5 LOST",
      scores: { deontological: 2, naturalRights: 1, activeHarm: -2, consequentialism: -2 },
      implications: [
        { icon: "📜", text: "Aligns with duty-based ethics - you didn't actively kill", positive: true },
        { icon: "💀", text: "Utilitarian critique: you could have saved four net lives", positive: false }
      ]
    },
    choiceB: {
      text: "Pull the lever - divert the trolley",
      emoji: "🔀",
      result: "You diverted the trolley, killing one to save five. You chose to act, accepting moral responsibility for one death to prevent five.",
      outcomeText: "1 LOST, 5 SAVED",
      scores: { utilitarian: 2, consequentialism: 2, activeHarm: 1, flexibility: 1 },
      implications: [
        { icon: "📊", text: "Utilitarian calculus: +4 net lives saved", positive: true },
        { icon: "⚖️", text: "You actively caused a death - some say this is never justified", positive: false }
      ]
    },
    scene: "classic",
    consistencyKey: "leverPull"
  },
  {
    id: "fatman",
    category: "MEANS VS ENDS",
    title: "THE FOOTBRIDGE",
    description: "You're on a footbridge above the tracks. A large man leans over the railing. The only way to stop the trolley and save five workers is to push him off - his body would stop the trolley, but he would die.",
    stakes: 50,
    choiceA: {
      text: "Don't push - his life is not yours to take",
      emoji: "🚫",
      result: "You refused to use another human being as a mere instrument. Five died, but you preserved the man's dignity as an end in himself.",
      outcomeText: "5 LOST",
      scores: { deontological: 3, naturalRights: 2, virtueEthics: 1, activeHarm: -2 },
      implications: [
        { icon: "👤", text: "Kant's imperative: never use humanity merely as a means", positive: true },
        { icon: "🤔", text: "Is there a moral difference between pushing and pulling a lever?", positive: false }
      ]
    },
    choiceB: {
      text: "Push him - save the five workers",
      emoji: "👐",
      result: "You used a human being as a tool to save five others. The utilitarian math is the same as the lever, but something feels different.",
      outcomeText: "1 LOST, 5 SAVED",
      scores: { utilitarian: 2, consequentialism: 2, activeHarm: 3, flexibility: 2 },
      implications: [
        { icon: "📊", text: "Same outcome as the lever - five saved, one lost", positive: true },
        { icon: "🔧", text: "You treated a person as a tool - a violation of human dignity", positive: false }
      ]
    },
    scene: "bridge",
    consistencyKey: "physicalHarm",
    consistencyCheck: (prev) => prev.leverPull === 'B' ? 'B' : null
  },
  {
    id: "grandma",
    category: "PARTIALITY & CARE",
    title: "THE LOVED ONE",
    description: "The trolley approaches a fork. On one track stands your grandmother, the person who raised you. On the other track stand five strangers. You control the switch.",
    stakes: 70,
    choiceA: {
      text: "Save your grandmother - family comes first",
      emoji: "👵",
      result: "You saved the person who gave you everything. Love and loyalty trumped impartial calculation. Five strangers' families will never understand.",
      outcomeText: "GRANDMA SAVED",
      scores: { careEthics: 3, impartiality: -3, virtueEthics: 1 },
      implications: [
        { icon: "💕", text: "Care ethics: relationships create special obligations", positive: true },
        { icon: "⚖️", text: "Violated impartiality - aren't all lives equal?", positive: false }
      ]
    },
    choiceB: {
      text: "Save the five strangers - maximize lives",
      emoji: "👥",
      result: "You chose impartial calculation over love. Five families celebrate while you bury the woman who raised you. Was this strength or coldness?",
      outcomeText: "5 SAVED",
      scores: { utilitarian: 3, impartiality: 3, consequentialism: 2 },
      implications: [
        { icon: "📊", text: "Strict utilitarian logic: five lives outweigh one", positive: true },
        { icon: "💔", text: "Betrayed someone who trusted you completely", positive: false }
      ]
    },
    scene: "family",
    consistencyKey: "partiality"
  },
  {
    id: "transplant",
    category: "INSTITUTIONAL TRUST",
    title: "THE SURGEON'S DILEMMA",
    description: "You're a surgeon with five patients dying from organ failure. A healthy traveler is in for a checkup. You could secretly harvest his organs, saving all five patients. No one would ever know.",
    stakes: 80,
    choiceA: {
      text: "Don't harvest - medicine has sacred limits",
      emoji: "⚕️",
      result: "You let five patients die to preserve medical ethics and institutional trust. If doctors could kill patients, no one would trust hospitals again.",
      outcomeText: "5 LOST",
      scores: { deontological: 3, contractarian: 3, naturalRights: 2, virtueEthics: 2 },
      implications: [
        { icon: "🏥", text: "Preserved trust in medical institutions", positive: true },
        { icon: "💀", text: "Five people died when you could have saved them", positive: false }
      ]
    },
    choiceB: {
      text: "Harvest organs - five lives are worth it",
      emoji: "🔪",
      result: "You murdered an innocent to save five. The utilitarian math works, but you've become what medicine swore to prevent.",
      outcomeText: "1 KILLED, 5 SAVED",
      scores: { utilitarian: 1, consequentialism: 3, activeHarm: 3, flexibility: 3 },
      implications: [
        { icon: "📊", text: "Five people live who would have died", positive: true },
        { icon: "⚠️", text: "You committed murder - and destroyed trust in medicine", positive: false }
      ]
    },
    scene: "hospital",
    consistencyKey: "institutionalKill"
  },
  {
    id: "torture",
    category: "EXTREME MEASURES",
    title: "THE TICKING BOMB",
    description: "A terrorist has planted a bomb that will kill thousands. You've captured him, but he won't reveal the location. Torture would almost certainly make him talk. Time is running out.",
    stakes: 90,
    choiceA: {
      text: "Don't torture - some lines cannot be crossed",
      emoji: "🚫",
      result: "You refused to torture, even to save thousands. The bomb exploded. You preserved your moral integrity, but at a devastating cost.",
      outcomeText: "THOUSANDS LOST",
      scores: { deontological: 3, naturalRights: 3, virtueEthics: 2, flexibility: -3 },
      implications: [
        { icon: "⚖️", text: "Maintained absolute prohibition on torture", positive: true },
        { icon: "💀", text: "Thousands died when torture might have saved them", positive: false }
      ]
    },
    choiceB: {
      text: "Torture him - thousands of lives depend on it",
      emoji: "⛓️",
      result: "You tortured him, got the information, and saved thousands. But you've now become someone who tortures. Can you live with that?",
      outcomeText: "THOUSANDS SAVED",
      scores: { utilitarian: 3, consequentialism: 3, flexibility: 3, activeHarm: 3 },
      implications: [
        { icon: "🛡️", text: "Saved thousands of innocent lives", positive: true },
        { icon: "👤", text: "You tortured a human being - violated absolute dignity", positive: false }
      ]
    },
    scene: "interrogation",
    consistencyKey: "torture"
  },
  {
    id: "promise",
    category: "DUTY VS OUTCOME",
    title: "THE DEATHBED PROMISE",
    description: "Your dying friend gives you $1 million to deliver to his estranged son. But the son is a drug addict who will waste it. You could donate it to a charity that would save 100 lives in Africa.",
    stakes: 60,
    choiceA: {
      text: "Keep the promise - honor your friend's wish",
      emoji: "🤝",
      result: "You kept your word to a dead friend, knowing the money would likely be wasted. A promise is sacred, even when breaking it would do more good.",
      outcomeText: "PROMISE KEPT",
      scores: { deontological: 3, virtueEthics: 2, consequentialism: -2 },
      implications: [
        { icon: "📜", text: "Honored a sacred trust between friends", positive: true },
        { icon: "💔", text: "100 lives could have been saved with that money", positive: false }
      ]
    },
    choiceB: {
      text: "Donate to charity - save 100 lives",
      emoji: "🌍",
      result: "You broke your promise to save 100 lives. Your friend trusted you, but those lives are real. Was loyalty worth more than 100 people?",
      outcomeText: "100 LIVES SAVED",
      scores: { utilitarian: 3, consequentialism: 3, flexibility: 2, deontological: -1 },
      implications: [
        { icon: "❤️", text: "Saved 100 lives that would have been lost", positive: true },
        { icon: "🤝", text: "Betrayed a dying friend's final wish", positive: false }
      ]
    },
    scene: "promise",
    consistencyKey: "promiseKeeping"
  },
  {
    id: "child",
    category: "AGE & POTENTIAL",
    title: "THE CHILD'S LIFE",
    description: "A trolley approaches two tracks. On one track is a 5-year-old child with their whole life ahead of them. On the other are three elderly patients in hospice, each with less than a year to live.",
    stakes: 65,
    choiceA: {
      text: "Save the child - they have more years to live",
      emoji: "👶",
      result: "You saved the child, valuing potential future life over current existence. The elderly patients' families question whether their loved ones' remaining time was worthless.",
      outcomeText: "CHILD SAVED",
      scores: { utilitarian: 2, consequentialism: 1, flexibility: 1 },
      implications: [
        { icon: "📈", text: "Maximized expected life-years saved", positive: true },
        { icon: "👴", text: "Implied elderly lives are worth less", positive: false }
      ]
    },
    choiceB: {
      text: "Save the three - each life counts equally",
      emoji: "👥",
      result: "You treated all lives as equal regardless of age. Three people live longer, but a child's potential-filled future was cut short.",
      outcomeText: "3 SAVED",
      scores: { deontological: 2, naturalRights: 2, impartiality: 2 },
      implications: [
        { icon: "⚖️", text: "All lives valued equally - no age discrimination", positive: true },
        { icon: "💔", text: "A child lost 70+ potential years of life", positive: false }
      ]
    },
    scene: "agedecision",
    consistencyKey: "lifeYears"
  },
  {
    id: "lying",
    category: "TRUTH & PROTECTION",
    title: "THE MURDERER AT THE DOOR",
    description: "A man with a knife asks if your friend is hiding in your house. They are. If you tell the truth, the man will kill your friend. If you lie, your friend will escape safely.",
    stakes: 55,
    choiceA: {
      text: "Tell the truth - lying is always wrong",
      emoji: "📜",
      result: "You told the truth and the murderer found your friend. Kant would approve of your honesty, but your friend is dead because of it.",
      outcomeText: "FRIEND KILLED",
      scores: { deontological: 3, flexibility: -3 },
      implications: [
        { icon: "✓", text: "Maintained absolute commitment to truth", positive: true },
        { icon: "💀", text: "Your rigid honesty got your friend killed", positive: false }
      ]
    },
    choiceB: {
      text: "Lie to save your friend",
      emoji: "🛡️",
      result: "You lied and your friend survived. The duty to protect trumped the duty to tell truth. Sometimes compassion requires deception.",
      outcomeText: "FRIEND SAVED",
      scores: { careEthics: 3, virtueEthics: 2, flexibility: 2, consequentialism: 2 },
      implications: [
        { icon: "❤️", text: "Protected someone who trusted you", positive: true },
        { icon: "📜", text: "Violated the principle of honesty", positive: false }
      ]
    },
    scene: "door",
    consistencyKey: "lying"
  },
  {
    id: "omelas",
    category: "SYSTEMIC ETHICS",
    title: "THE ONES WHO WALK AWAY",
    description: "You discover that your city's prosperity depends on one child being kept in perpetual misery in a basement. Everyone knows, everyone benefits, and the child cannot be freed without destroying everything.",
    stakes: 85,
    choiceA: {
      text: "Accept the system - the greater good demands it",
      emoji: "🏛️",
      result: "You accepted that one child's suffering enables millions to flourish. You benefit from the arrangement every day. Can you live with that knowledge?",
      outcomeText: "SYSTEM MAINTAINED",
      scores: { utilitarian: 2, contractarian: 2, consequentialism: 3, flexibility: 2 },
      implications: [
        { icon: "🏙️", text: "Millions continue to live in prosperity", positive: true },
        { icon: "👶", text: "You're complicit in torturing a child forever", positive: false }
      ]
    },
    choiceB: {
      text: "Reject it - no prosperity is worth this",
      emoji: "🚶",
      result: "You walked away from Omelas, refusing to benefit from systematic cruelty. You gave up everything rather than be complicit in evil.",
      outcomeText: "WALKED AWAY",
      scores: { deontological: 3, naturalRights: 3, virtueEthics: 3, flexibility: -2 },
      implications: [
        { icon: "✨", text: "Refused to profit from innocent suffering", positive: true },
        { icon: "🏚️", text: "Gave up your prosperity and community", positive: false }
      ]
    },
    scene: "omelas",
    consistencyKey: "systemicEvil"
  },
  {
    id: "sacrifice",
    category: "SELF-SACRIFICE",
    title: "THE HERO'S CHOICE",
    description: "You're on the track. The trolley approaches five workers. You can throw yourself in front of it - your body would stop it, saving all five. You are certain to die.",
    stakes: 75,
    choiceA: {
      text: "Step aside - you have no obligation to die",
      emoji: "💔",
      result: "You valued your own life, as most would. Self-sacrifice is heroic but not obligatory. Yet five died when you could have saved them.",
      outcomeText: "5 LOST",
      scores: { naturalRights: 1, contractarian: 1, activeHarm: -2 },
      implications: [
        { icon: "👤", text: "No moral theory requires self-sacrifice", positive: true },
        { icon: "💀", text: "Five died when you had the power to save them", positive: false }
      ]
    },
    choiceB: {
      text: "Sacrifice yourself - be the hero",
      emoji: "🦸",
      result: "You gave your life for five strangers. The ultimate act of selflessness. Supererogatory - beyond what morality demands, into moral sainthood.",
      outcomeText: "YOU DIED, 5 SAVED",
      scores: { virtueEthics: 3, utilitarian: 2, careEthics: 1, activeHarm: 2 },
      implications: [
        { icon: "🌟", text: "Achieved moral heroism through self-sacrifice", positive: true },
        { icon: "💀", text: "You died - some say this is never required", positive: false }
      ]
    },
    scene: "sacrifice",
    consistencyKey: "selfSacrifice"
  },
  {
    id: "justice",
    category: "GUILT & INNOCENCE",
    title: "THE GUILTY ONE",
    description: "The trolley approaches. On one track is a convicted murderer who killed three children and will be released next month. On the other track are two innocent people.",
    stakes: 70,
    choiceA: {
      text: "Save the murderer - all lives have equal worth",
      emoji: "⚖️",
      result: "You saved a child murderer over two innocents. You refused to play judge, holding that even the guilty have a right to life.",
      outcomeText: "MURDERER SAVED",
      scores: { deontological: 3, naturalRights: 3, impartiality: 3 },
      implications: [
        { icon: "⚖️", text: "All lives valued equally regardless of character", positive: true },
        { icon: "😰", text: "A child killer lives while two innocents died", positive: false }
      ]
    },
    choiceB: {
      text: "Save the innocents - the murderer forfeited his right",
      emoji: "👥",
      result: "You let the murderer die and saved two innocents. Justice and innocence mattered. But who appointed you to decide who deserves life?",
      outcomeText: "2 INNOCENTS SAVED",
      scores: { utilitarian: 2, virtueEthics: 2, flexibility: 2, impartiality: -1 },
      implications: [
        { icon: "✨", text: "Prioritized innocent lives over guilty ones", positive: true },
        { icon: "👨‍⚖️", text: "You became judge, jury, and executioner", positive: false }
      ]
    },
    scene: "justice",
    consistencyKey: "desertBased"
  },
  {
    id: "final",
    category: "THE ULTIMATE TEST",
    title: "THE CONVERGENCE",
    description: "Your grandmother is on one track. On the other: a cure for cancer that will save millions, but it's being carried by a convicted murderer - he's the only one who knows the formula. You cannot save both.",
    stakes: 100,
    choiceA: {
      text: "Save your grandmother",
      emoji: "👵",
      result: "You chose love over logic, family over humanity. The cure was lost forever. Millions will die, but your grandmother will be at your wedding.",
      outcomeText: "GRANDMA SAVED",
      scores: { careEthics: 5, impartiality: -5, consequentialism: -3 },
      implications: [
        { icon: "💕", text: "Love and loyalty trumped cold calculation", positive: true },
        { icon: "🌍", text: "Millions will die from cancer because of you", positive: false }
      ]
    },
    choiceB: {
      text: "Save the cure (and the murderer)",
      emoji: "💊",
      result: "You sacrificed your grandmother to save millions. Pure utilitarian logic. She would have understood... wouldn't she?",
      outcomeText: "MILLIONS SAVED",
      scores: { utilitarian: 5, impartiality: 5, consequentialism: 5, careEthics: -2 },
      implications: [
        { icon: "🌍", text: "Millions of lives saved across generations", positive: true },
        { icon: "💔", text: "Betrayed the person who loved you most", positive: false }
      ]
    },
    scene: "final",
    consistencyKey: "ultimateChoice"
  }
];

// ===== PHILOSOPHER DATA =====
const philosophers = [
  { name: "John Stuart Mill", school: "utilitarian", threshold: 60, desc: "Champion of the greatest good for the greatest number" },
  { name: "Peter Singer", school: "utilitarian", threshold: 70, desc: "Radical altruist and preference utilitarian" },
  { name: "Jeremy Bentham", school: "utilitarian", threshold: 50, desc: "Founder of modern utilitarianism" },
  { name: "Immanuel Kant", school: "deontological", threshold: 60, desc: "Duty-based ethics and the categorical imperative" },
  { name: "W.D. Ross", school: "deontological", threshold: 50, desc: "Prima facie duties and moral pluralism" },
  { name: "Aristotle", school: "virtueEthics", threshold: 55, desc: "Virtue as the path to eudaimonia (flourishing)" },
  { name: "Philippa Foot", school: "virtueEthics", threshold: 50, desc: "Pioneer of virtue ethics revival" },
  { name: "Nel Noddings", school: "careEthics", threshold: 55, desc: "Ethics of care and relationships" },
  { name: "Carol Gilligan", school: "careEthics", threshold: 50, desc: "Care ethics as distinct moral voice" },
  { name: "John Rawls", school: "contractarian", threshold: 55, desc: "Justice as fairness behind the veil of ignorance" },
  { name: "John Locke", school: "naturalRights", threshold: 55, desc: "Natural rights to life, liberty, and property" },
  { name: "Robert Nozick", school: "naturalRights", threshold: 60, desc: "Rights as side constraints on action" }
];

// ===== AUDIO =====
let audioCtx;
function initAudio() { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function playSound(type) {
  if (!audioCtx) initAudio();
  try {
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination); gain.gain.value = 0.1;
    switch(type) {
      case 'select': osc.frequency.value = 440; osc.start(); osc.stop(audioCtx.currentTime + 0.1); break;
      case 'confirm': osc.frequency.value = 520; osc.start(); setTimeout(() => osc.frequency.value = 660, 80); osc.stop(audioCtx.currentTime + 0.15); break;
      case 'impact': osc.type = 'sawtooth'; osc.frequency.value = 100; gain.gain.value = 0.2; osc.start(); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); osc.stop(audioCtx.currentTime + 0.3); break;
      case 'warning': osc.type = 'square'; osc.frequency.value = 200; osc.start(); osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.1); osc.stop(audioCtx.currentTime + 0.2); break;
    }
  } catch(e) {}
}

// ===== GAME FLOW =====
function startGame() {
  playSound('confirm');
  currentScenario = 0;
  choices = [];
  previousChoices = {};
  inconsistencies = 0;
  scores = { utilitarian: 0, deontological: 0, virtueEthics: 0, careEthics: 0, contractarian: 0, naturalRights: 0, activeHarm: 0, impartiality: 0, consequentialism: 0, flexibility: 0 };
  hideAllScreens();
  document.getElementById('game-play').classList.remove('hidden');
  loadScenario();
}

function hideAllScreens() {
  ['title-screen', 'game-play', 'result-screen', 'summary-screen'].forEach(id => document.getElementById(id).classList.add('hidden'));
}

function loadScenario() {
  const scenario = scenarios[currentScenario];
  trolleyX = 30;
  isAnimating = false;

  document.getElementById('scenario-num').textContent = currentScenario + 1;
  document.getElementById('consistency-score').textContent = Math.max(0, 100 - (inconsistencies * 15));
  document.getElementById('scenario-category').textContent = scenario.category;
  document.getElementById('scenario-title').textContent = scenario.title;

  typeText(document.getElementById('dialogue-text'), scenario.description);

  const choiceA = document.getElementById('choice-a');
  const choiceB = document.getElementById('choice-b');
  choiceA.querySelector('.choice-text').textContent = scenario.choiceA.emoji + ' ' + scenario.choiceA.text;
  choiceB.querySelector('.choice-text').textContent = scenario.choiceB.emoji + ' ' + scenario.choiceB.text;
  choiceA.classList.remove('selected', 'not-selected');
  choiceB.classList.remove('selected', 'not-selected');
  choiceA.disabled = false;
  choiceB.disabled = false;

  document.querySelector('.stakes-fill').style.width = scenario.stakes + '%';
  document.getElementById('animation-overlay').classList.add('hidden');

  drawScene(scenario.scene);
}

function typeText(element, text, speed = 15) {
  element.textContent = '';
  element.classList.add('typing');
  let i = 0;
  function type() {
    if (i < text.length) { element.textContent += text.charAt(i); i++; setTimeout(type, speed); }
    else { element.classList.remove('typing'); }
  }
  type();
}

// ===== CHOICE HANDLING =====
function makeChoice(choice) {
  if (isAnimating) return;
  isAnimating = true;
  playSound('confirm');

  const scenario = scenarios[currentScenario];
  const result = choice === 'A' ? scenario.choiceA : scenario.choiceB;

  // Check for consistency
  let isInconsistent = false;
  if (scenario.consistencyCheck) {
    const expected = scenario.consistencyCheck(previousChoices);
    if (expected && choice !== expected) {
      isInconsistent = true;
      inconsistencies++;
    }
  }

  previousChoices[scenario.consistencyKey] = choice;
  choices.push({ scenario: scenario.id, choice, isInconsistent });

  // Apply scores
  Object.keys(result.scores).forEach(key => {
    scores[key] = (scores[key] || 0) + result.scores[key];
  });

  // Animate UI
  const choiceA = document.getElementById('choice-a');
  const choiceB = document.getElementById('choice-b');
  choiceA.disabled = true;
  choiceB.disabled = true;

  if (choice === 'A') { choiceA.classList.add('selected'); choiceB.classList.add('not-selected'); }
  else { choiceB.classList.add('selected'); choiceA.classList.add('not-selected'); }

  playScenarioAnimation(scenario.scene, choice, result, isInconsistent);
}

// ===== ANIMATIONS =====
function playScenarioAnimation(sceneType, choice, result, isInconsistent) {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('animation-overlay');
  const outcomeText = document.getElementById('outcome-text');
  const flash = document.getElementById('impact-flash');

  overlay.classList.remove('hidden');
  let frame = 0;
  const totalFrames = 100;

  function animate() {
    frame++;
    drawSceneAnimated(ctx, canvas, sceneType, frame, choice);

    if (frame === 65) {
      playSound('impact');
      flash.classList.add('flash');
      document.getElementById('scene-container').classList.add('shake');
      setTimeout(() => { flash.classList.remove('flash'); document.getElementById('scene-container').classList.remove('shake'); }, 400);
    }

    if (frame === 80) {
      outcomeText.textContent = result.outcomeText;
      outcomeText.classList.add('show');
    }

    if (frame < totalFrames) { animationFrame = requestAnimationFrame(animate); }
    else { setTimeout(() => { outcomeText.classList.remove('show'); showResult(result, isInconsistent); }, 600); }
  }
  animate();
}

function drawScene(sceneType) {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  drawSceneAnimated(ctx, canvas, sceneType, 0, '');
}

function drawSceneAnimated(ctx, canvas, sceneType, frame, choice) {
  const w = canvas.width, h = canvas.height;

  // Background
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2d4a22';
  ctx.fillRect(0, h - 35, w, 35);

  // Scene-specific drawing
  if (sceneType === 'hospital' || sceneType === 'promise' || sceneType === 'door' || sceneType === 'interrogation' || sceneType === 'omelas') {
    drawIndoorScene(ctx, w, h, sceneType, frame, choice);
  } else {
    drawOutdoorScene(ctx, w, h, sceneType, frame, choice);
  }
}

function drawOutdoorScene(ctx, w, h, sceneType, frame, choice) {
  // Tracks
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, h - 50);
  ctx.lineTo(w, h - 50);
  ctx.stroke();

  if (sceneType !== 'sacrifice') {
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h - 50);
    ctx.lineTo(w * 0.45, h - 80);
    ctx.lineTo(w, h - 80);
    ctx.stroke();
  }

  // Trolley position
  let trolleyY = h - 70;
  if (frame > 0) {
    trolleyX = 20 + (frame / 65) * (w * 0.4);
    if (frame > 65) {
      const postFrame = frame - 65;
      if (choice === 'B' && sceneType !== 'sacrifice') {
        trolleyX = w * 0.4 + postFrame * 2;
        trolleyY = h - 70 - postFrame * 0.6;
      } else {
        trolleyX = w * 0.4 + postFrame * 2;
      }
    }
  }

  // Draw people based on scene
  const hitFrame = 70;

  if (sceneType === 'classic' || sceneType === 'bridge' || sceneType === 'agedecision' || sceneType === 'justice') {
    // Main track people
    const count = sceneType === 'agedecision' ? 3 : (sceneType === 'justice' ? 2 : 5);
    for (let i = 0; i < count; i++) {
      const px = w * 0.55 + i * 20, py = h - 65;
      if (choice === 'A' && frame > hitFrame) { drawX(ctx, px, py); }
      else { drawPerson(ctx, px, py, sceneType === 'agedecision' ? '#aaa' : '#ffcc00'); }
    }
    // Side track person
    const sideColor = sceneType === 'agedecision' ? '#ffcc00' : (sceneType === 'justice' ? '#ff6666' : '#ffcc00');
    const sidePx = w * 0.65, sidePy = h - 95;
    if (choice === 'B' && frame > hitFrame) { drawX(ctx, sidePx, sidePy); }
    else { drawPerson(ctx, sidePx, sidePy, sideColor, sceneType === 'agedecision' ? 0.7 : 1); }
  }

  if (sceneType === 'family' || sceneType === 'final') {
    // Grandma on side track
    const gmPx = w * 0.65, gmPy = h - 95;
    if (choice === 'A' && frame > hitFrame) { drawX(ctx, w * 0.55 + 40, h - 65); }
    else { for (let i = 0; i < 5; i++) drawPerson(ctx, w * 0.55 + i * 18, h - 65, '#ffcc00'); }

    if (choice === 'B' && frame > hitFrame) { drawX(ctx, gmPx, gmPy); }
    else {
      drawPerson(ctx, gmPx, gmPy, '#ff99cc');
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(gmPx, gmPy - 8, 4, 0, Math.PI, true);
      ctx.fill();
    }
  }

  if (sceneType === 'sacrifice') {
    drawPerson(ctx, w * 0.4, h - 65, '#66ffcc');
    for (let i = 0; i < 5; i++) {
      if (choice === 'A' && frame > hitFrame) { drawX(ctx, w * 0.55 + i * 18, h - 65); }
      else { drawPerson(ctx, w * 0.55 + i * 18, h - 65, '#ffcc00'); }
    }
    if (choice === 'B' && frame > hitFrame) {
      drawX(ctx, w * 0.4, h - 65);
      ctx.strokeStyle = '#f1fa8c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w * 0.4, h - 80, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (sceneType === 'bridge') {
    ctx.fillStyle = '#533483';
    ctx.fillRect(w * 0.25, h - 110, w * 0.35, 15);
    ctx.fillStyle = '#3d2660';
    ctx.fillRect(w * 0.27, h - 95, 8, 60);
    ctx.fillRect(w * 0.52, h - 95, 8, 60);

    let fatManY = h - 125;
    if (choice === 'B' && frame > 25) {
      fatManY = Math.min(h - 65, h - 125 + (frame - 25) * 2);
      if (frame > hitFrame) { drawX(ctx, w * 0.4, h - 65); }
      else if (fatManY < h - 65) { drawPerson(ctx, w * 0.4, fatManY, '#ff9966', 1.4); }
    } else {
      drawPerson(ctx, w * 0.4, fatManY, '#ff9966', 1.4);
    }
    drawPerson(ctx, w * 0.32, h - 125, '#66ffcc', 0.9);
  }

  // Draw trolley
  drawTrolley(ctx, trolleyX, trolleyY, frame);
}

function drawIndoorScene(ctx, w, h, sceneType, frame, choice) {
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, h - 40, w, 40);

  const hitFrame = 70;

  if (sceneType === 'hospital') {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(10 + i * 52, h - 90, 45, 35);
      ctx.strokeStyle = '#999';
      ctx.strokeRect(10 + i * 52, h - 90, 45, 35);

      if (choice === 'A' && frame > hitFrame) { drawX(ctx, 32 + i * 52, h - 100); }
      else if (choice === 'B' && frame > hitFrame) {
        ctx.fillStyle = '#50fa7b';
        ctx.beginPath();
        ctx.arc(32 + i * 52, h - 100, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      else { drawPerson(ctx, 32 + i * 52, h - 100, '#ff6666', 0.7); }
    }

    if (choice === 'B' && frame > hitFrame) { drawX(ctx, w - 45, h - 60); }
    else { drawPerson(ctx, w - 45, h - 60, '#66ff66'); }
    drawPerson(ctx, w - 80, h - 60, '#66ffcc');
  }

  if (sceneType === 'promise') {
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(w * 0.3, h - 100, w * 0.4, 60);
    ctx.fillStyle = '#f1fa8c';
    ctx.fillRect(w * 0.4, h - 85, 30, 20);
    ctx.fillStyle = '#daa520';
    ctx.font = '20px serif';
    ctx.fillText('$', w * 0.47, h - 68);

    drawPerson(ctx, w * 0.25, h - 60, '#aaa');
    if (choice === 'B' && frame > 50) {
      for (let i = 0; i < 5; i++) { drawPerson(ctx, w * 0.6 + i * 15, h - 60 - i * 5, '#66ff66', 0.6); }
    }
  }

  if (sceneType === 'door') {
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(w * 0.4, h - 120, 50, 90);
    ctx.fillStyle = '#daa520';
    ctx.beginPath();
    ctx.arc(w * 0.4 + 40, h - 70, 4, 0, Math.PI * 2);
    ctx.fill();

    drawPerson(ctx, w * 0.3, h - 60, '#66ffcc');
    drawPerson(ctx, w * 0.55, h - 60, '#ff4444');
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.57, h - 50);
    ctx.lineTo(w * 0.62, h - 70);
    ctx.stroke();

    if (choice === 'A' && frame > hitFrame) { drawX(ctx, w * 0.2, h - 80); }
    else { drawPerson(ctx, w * 0.2, h - 80, '#66ff66', 0.8); }
  }

  if (sceneType === 'interrogation') {
    ctx.fillStyle = '#333';
    ctx.fillRect(w * 0.35, h - 100, 80, 50);
    drawPerson(ctx, w * 0.5, h - 75, '#ff6666');
    drawPerson(ctx, w * 0.3, h - 60, '#66ffcc');

    if (choice === 'B' && frame > 40 && frame < hitFrame) {
      ctx.fillStyle = '#f1fa8c';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(w * 0.5 + Math.random() * 20 - 10, h - 85 + Math.random() * 10, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (sceneType === 'omelas') {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(w * 0.3, h - 100, w * 0.4, 70);

    drawPerson(ctx, w * 0.5, h - 70, '#aaa', 0.7);

    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(0, 0, w * 0.25, h);
    ctx.fillRect(w * 0.75, 0, w * 0.25, h);

    for (let i = 0; i < 3; i++) {
      drawPerson(ctx, w * 0.1 + i * 20, h - 60, '#50fa7b', 0.6);
      drawPerson(ctx, w * 0.8 + i * 15, h - 60, '#50fa7b', 0.6);
    }
  }
}

function drawTrolley(ctx, x, y, frame) {
  const shake = frame > 0 && frame < 65 ? Math.sin(frame * 0.5) * 1.5 : 0;
  ctx.fillStyle = '#e94560';
  ctx.fillRect(x, y + shake, 40, 20);
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(x + 4, y + 3 + shake, 12, 8);
  ctx.fillRect(x + 20, y + 3 + shake, 12, 8);
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + 10, y + 20, 5, 0, Math.PI * 2);
  ctx.arc(x + 30, y + 20, 5, 0, Math.PI * 2);
  ctx.fill();

  if (frame > 0 && frame < 65) {
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 8 - i * 6, y + 4 + i * 6 + shake);
      ctx.lineTo(x - 18 - i * 6, y + 4 + i * 6 + shake);
      ctx.stroke();
    }
  }
}

function drawPerson(ctx, x, y, color, scale = 1) {
  const s = scale;
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x, y, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(x - 4 * s, y + 5 * s, 8 * s, 12 * s);
  ctx.fillRect(x - 8 * s, y + 6 * s, 4 * s, 8 * s);
  ctx.fillRect(x + 4 * s, y + 6 * s, 4 * s, 8 * s);
}

function drawX(ctx, x, y) {
  ctx.strokeStyle = '#ff5555';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 8);
  ctx.lineTo(x + 8, y + 12);
  ctx.moveTo(x + 8, y - 8);
  ctx.lineTo(x - 8, y + 12);
  ctx.stroke();
}

// ===== RESULTS =====
function showResult(result, isInconsistent) {
  hideAllScreens();
  document.getElementById('result-screen').classList.remove('hidden');

  document.getElementById('result-icon').textContent = result.outcomeText.includes('SAVED') ? '⚡' : '🚫';
  document.getElementById('result-title').textContent = result.outcomeText;
  document.getElementById('result-text').textContent = result.result;

  const implList = document.getElementById('implications-list');
  implList.innerHTML = '';
  result.implications.forEach(imp => {
    const div = document.createElement('div');
    div.className = 'implication-item';
    div.innerHTML = `<span class="implication-icon">${imp.icon}</span><span class="implication-text ${imp.positive ? 'implication-positive' : 'implication-negative'}">${imp.text}</span>`;
    implList.appendChild(div);
  });

  const alert = document.getElementById('consistency-alert');
  if (isInconsistent) {
    alert.classList.remove('hidden');
    playSound('warning');
  } else {
    alert.classList.add('hidden');
  }

  isAnimating = false;
}

function nextScenario() {
  playSound('select');
  currentScenario++;
  if (currentScenario >= scenarios.length) { showSummary(); }
  else {
    hideAllScreens();
    document.getElementById('game-play').classList.remove('hidden');
    loadScenario();
  }
}

// ===== FINAL SUMMARY =====
function showSummary() {
  hideAllScreens();
  document.getElementById('summary-screen').classList.remove('hidden');

  // Calculate percentages
  const maxScore = scenarios.length * 3;
  const pcts = {
    util: Math.min(100, Math.max(0, (scores.utilitarian / maxScore) * 100 + 50)),
    deont: Math.min(100, Math.max(0, (scores.deontological / maxScore) * 100 + 50)),
    virtue: Math.min(100, Math.max(0, (scores.virtueEthics / maxScore) * 100 + 50)),
    care: Math.min(100, Math.max(0, (scores.careEthics / maxScore) * 100 + 50)),
    contract: Math.min(100, Math.max(0, (scores.contractarian / maxScore) * 100 + 50)),
    rights: Math.min(100, Math.max(0, (scores.naturalRights / maxScore) * 100 + 50))
  };

  // Find primary philosophy
  const philScores = [
    { name: 'UTILITARIAN', score: pcts.util, desc: 'You believe the right action is whatever produces the best overall consequences. The ends can justify the means, and we should impartially maximize well-being for all sentient beings.' },
    { name: 'DEONTOLOGIST', score: pcts.deont, desc: 'You believe certain actions are inherently right or wrong, regardless of consequences. Moral rules and duties must be followed, and some things (like using people as mere means) are never justified.' },
    { name: 'VIRTUE ETHICIST', score: pcts.virtue, desc: 'You focus on character rather than rules or consequences. The right action is what a virtuous person would do. Cultivating wisdom, courage, and compassion matters more than following formulas.' },
    { name: 'CARE ETHICIST', score: pcts.care, desc: 'You believe relationships and context matter morally. We have special obligations to those close to us, and empathy and care should guide our decisions more than abstract principles.' },
    { name: 'CONTRACTARIAN', score: pcts.contract, desc: 'You believe morality is based on agreements rational people would make. Fair rules are those everyone could accept from behind a veil of ignorance about their position in society.' },
    { name: 'RIGHTS THEORIST', score: pcts.rights, desc: 'You believe individuals have fundamental rights that cannot be violated, even for good consequences. These natural rights act as side constraints on what we may do to others.' }
  ];

  philScores.sort((a, b) => b.score - a.score);
  const primary = philScores[0];

  document.getElementById('primary-type').textContent = primary.name;
  document.getElementById('primary-description').textContent = primary.desc;

  // Set bar widths
  setTimeout(() => {
    document.getElementById('bar-util').style.width = pcts.util + '%';
    document.getElementById('bar-deont').style.width = pcts.deont + '%';
    document.getElementById('bar-virtue').style.width = pcts.virtue + '%';
    document.getElementById('bar-care').style.width = pcts.care + '%';
    document.getElementById('bar-contract').style.width = pcts.contract + '%';
    document.getElementById('bar-rights').style.width = pcts.rights + '%';
  }, 100);

  document.getElementById('pct-util').textContent = Math.round(pcts.util) + '%';
  document.getElementById('pct-deont').textContent = Math.round(pcts.deont) + '%';
  document.getElementById('pct-virtue').textContent = Math.round(pcts.virtue) + '%';
  document.getElementById('pct-care').textContent = Math.round(pcts.care) + '%';
  document.getElementById('pct-contract').textContent = Math.round(pcts.contract) + '%';
  document.getElementById('pct-rights').textContent = Math.round(pcts.rights) + '%';

  // Trait markers (0-100 scale, 50 = middle)
  const traitAction = Math.min(100, Math.max(0, (scores.activeHarm / 20) * 50 + 50));
  const traitScope = Math.min(100, Math.max(0, (scores.impartiality / 20) * 50 + 50));
  const traitFocus = Math.min(100, Math.max(0, (scores.consequentialism / 20) * 50 + 50));
  const traitHarm = Math.min(100, Math.max(0, (scores.flexibility / 20) * 50 + 50));

  setTimeout(() => {
    document.getElementById('marker-action').style.left = traitAction + '%';
    document.getElementById('marker-scope').style.left = traitScope + '%';
    document.getElementById('marker-focus').style.left = traitFocus + '%';
    document.getElementById('marker-harm').style.left = traitHarm + '%';
  }, 300);

  // Matching philosophers
  const philList = document.getElementById('philosopher-list');
  philList.innerHTML = '';
  const matchedPhils = philosophers.filter(p => {
    const score = p.school === 'utilitarian' ? pcts.util :
                  p.school === 'deontological' ? pcts.deont :
                  p.school === 'virtueEthics' ? pcts.virtue :
                  p.school === 'careEthics' ? pcts.care :
                  p.school === 'contractarian' ? pcts.contract : pcts.rights;
    return score >= p.threshold;
  });

  matchedPhils.slice(0, 5).forEach(p => {
    const tag = document.createElement('div');
    tag.className = 'philosopher-tag';
    tag.textContent = p.name;
    tag.title = p.desc;
    philList.appendChild(tag);
  });

  if (matchedPhils.length === 0) {
    const tag = document.createElement('div');
    tag.className = 'philosopher-tag';
    tag.textContent = 'Unique Perspective';
    philList.appendChild(tag);
  }

  // Consistency
  const consistency = Math.max(0, 100 - (inconsistencies * 15));
  document.getElementById('final-consistency').textContent = consistency;

  let consistencyText = '';
  if (consistency >= 85) {
    consistencyText = 'Your choices show remarkable internal consistency. You apply your moral principles uniformly across different scenarios, suggesting a well-developed ethical framework.';
  } else if (consistency >= 60) {
    consistencyText = 'Your choices show moderate consistency. Like most people, you sometimes apply different principles in similar situations, revealing the complexity of real moral reasoning.';
  } else {
    consistencyText = 'Your choices varied significantly across scenarios. This may reflect moral pluralism (different situations call for different approaches) or intuitions that resist systematic theory.';
  }
  document.getElementById('consistency-explanation').textContent = consistencyText;
}

function restartGame() {
  playSound('confirm');
  hideAllScreens();
  document.getElementById('title-screen').classList.remove('hidden');
}

window.addEventListener('resize', () => {
  if (!document.getElementById('game-play').classList.contains('hidden') && !isAnimating) {
    drawScene(scenarios[currentScenario].scene);
  }
});
