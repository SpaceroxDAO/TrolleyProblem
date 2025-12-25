// ===== GAME STATE =====
let currentScenario = 0;
let savedCount = 0;
let activeChoices = 0;
let choices = [];
let audioCtx;
let isAnimating = false;

// ===== ANIMATION STATE =====
let animationFrame;
let trolleyX = 30;
let trolleySpeed = 0;
let leverPulled = false;
let sceneObjects = {};

// ===== SCENARIOS =====
const scenarios = [
  {
    title: "THE CLASSIC DILEMMA",
    description: "A runaway trolley speeds toward five workers on the track. You stand by a lever that can divert it to a side track, where only one worker stands.",
    choiceA: {
      text: "Do nothing - Let fate decide",
      emoji: "🚫",
      result: "You watched as the trolley struck five people. By not acting, you preserved your moral innocence... but at what cost?",
      saved: 0,
      killed: 5,
      active: false,
      outcomeText: "5 LOST"
    },
    choiceB: {
      text: "Pull the lever - Save the five",
      emoji: "🔀",
      result: "You diverted the trolley. One person died by your hand, but five were saved. You chose to act.",
      saved: 5,
      killed: 1,
      active: true,
      outcomeText: "1 LOST, 5 SAVED"
    },
    philosophy: "This is the original Trolley Problem, proposed by philosopher Philippa Foot in 1967. It explores the conflict between UTILITARIAN ethics (maximize good outcomes) and DEONTOLOGICAL ethics (some actions are inherently wrong).",
    scene: "classic"
  },
  {
    title: "THE FAT MAN",
    description: "The trolley approaches five workers. You're on a bridge with a large man. Pushing him onto the tracks would stop the trolley, saving five lives.",
    choiceA: {
      text: "Don't push - Respect his autonomy",
      emoji: "🚫",
      result: "You couldn't bring yourself to push another person to their death. Five died, but you didn't use someone as a mere means.",
      saved: 0,
      killed: 5,
      active: false,
      outcomeText: "5 LOST"
    },
    choiceB: {
      text: "Push him - Save the five",
      emoji: "👐",
      result: "You pushed him. His body stopped the trolley. Five lived. But you used a human being as a tool...",
      saved: 5,
      killed: 1,
      active: true,
      outcomeText: "1 LOST, 5 SAVED"
    },
    philosophy: "Judith Jarvis Thomson added this variant. Most people who would pull the lever won't push the fat man. Why? This reveals our intuition about USING people as instruments versus redirecting harm. Kant argued we must never treat humanity merely as a means.",
    scene: "bridge"
  },
  {
    title: "THE LOOP",
    description: "You can divert the trolley to a loop track. It would kill one worker there, but his body would stop the trolley before it loops back to kill the five.",
    choiceA: {
      text: "Don't divert - Accept the outcome",
      emoji: "🚫",
      result: "Without your intervention, the trolley continued its original path. You remained a bystander.",
      saved: 0,
      killed: 5,
      active: false,
      outcomeText: "5 LOST"
    },
    choiceB: {
      text: "Divert to the loop - Use physics",
      emoji: "🔄",
      result: "The trolley hit the lone worker. His body stopped it. The five survived. Was this different from pushing?",
      saved: 5,
      killed: 1,
      active: true,
      outcomeText: "1 LOST, 5 SAVED"
    },
    philosophy: "The Loop variant blurs the line. Here, unlike the simple switch, the one person's death is NECESSARY to save the five - just like pushing the fat man. Yet people are more willing to pull this lever. This challenges our moral consistency.",
    scene: "loop"
  },
  {
    title: "THE TRANSPLANT",
    description: "You're a doctor. Five patients will die without organ transplants. A healthy visitor is in your office. You could harvest his organs to save all five.",
    choiceA: {
      text: "Don't harvest - Honor medical ethics",
      emoji: "⚕️",
      result: "You let your patients die rather than murder an innocent. Medical ethics and trust in healthcare were preserved.",
      saved: 0,
      killed: 5,
      active: false,
      outcomeText: "5 LOST"
    },
    choiceB: {
      text: "Harvest organs - Save the five",
      emoji: "🔪",
      result: "You saved five patients... but murdered an innocent. You've become what medicine swore to fight against.",
      saved: 5,
      killed: 1,
      active: true,
      outcomeText: "1 LOST, 5 SAVED"
    },
    philosophy: "Almost no one chooses to harvest organs, yet the math is identical to the trolley problem. This shows we have strong intuitions about NEGATIVE duties (don't harm) versus POSITIVE duties (help others). We also value INSTITUTIONAL trust.",
    scene: "hospital"
  },
  {
    title: "THE SACRIFICE",
    description: "You are on the track. The trolley approaches five workers. You can throw yourself in front of it, stopping it with your body.",
    choiceA: {
      text: "Step aside - Self-preservation",
      emoji: "💔",
      result: "You valued your own life. Is this selfish, or simply human? The five workers perished.",
      saved: 0,
      killed: 5,
      active: false,
      outcomeText: "5 LOST"
    },
    choiceB: {
      text: "Sacrifice yourself - Be the hero",
      emoji: "🦸",
      result: "You gave your life to save five strangers. The ultimate sacrifice. The ultimate moral act?",
      saved: 5,
      killed: 1,
      active: true,
      outcomeText: "YOU + 0 LOST"
    },
    philosophy: "This variant explores SUPEREROGATION - acts that are morally good but not obligatory. We don't typically require self-sacrifice. But if the outcome is the same as pulling a lever, why do we view it differently? Are we really impartial moral agents?",
    scene: "sacrifice"
  }
];

// ===== AUDIO =====
function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
  if (!audioCtx) initAudio();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.1;

    switch(type) {
      case 'select':
        osc.frequency.value = 440;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
        break;
      case 'confirm':
        osc.frequency.value = 520;
        osc.start();
        setTimeout(() => osc.frequency.value = 660, 80);
        osc.stop(audioCtx.currentTime + 0.15);
        break;
      case 'impact':
        osc.type = 'sawtooth';
        osc.frequency.value = 100;
        gain.gain.value = 0.2;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.stop(audioCtx.currentTime + 0.3);
        break;
      case 'lever':
        osc.frequency.value = 300;
        osc.start();
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        osc.stop(audioCtx.currentTime + 0.1);
        break;
      case 'death':
        osc.type = 'square';
        osc.frequency.value = 200;
        gain.gain.value = 0.15;
        osc.start();
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.stop(audioCtx.currentTime + 0.5);
        break;
    }
  } catch(e) {}
}

// ===== GAME FLOW =====
function startGame() {
  playSound('confirm');
  currentScenario = 0;
  savedCount = 0;
  activeChoices = 0;
  choices = [];

  hideAllScreens();
  document.getElementById('game-play').classList.remove('hidden');
  loadScenario();
}

function hideAllScreens() {
  ['title-screen', 'game-play', 'result-screen', 'summary-screen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

function loadScenario() {
  const scenario = scenarios[currentScenario];

  // Reset animation state
  trolleyX = 30;
  trolleySpeed = 0;
  leverPulled = false;
  isAnimating = false;

  // Update UI
  document.getElementById('scenario-num').textContent = currentScenario + 1;
  document.getElementById('saved-count').textContent = savedCount;
  document.getElementById('scenario-title').textContent = scenario.title;

  // Typewriter effect for dialogue
  typeText(document.getElementById('dialogue-text'), scenario.description);

  // Update choices
  const choiceA = document.getElementById('choice-a');
  const choiceB = document.getElementById('choice-b');

  choiceA.querySelector('.choice-text').textContent = scenario.choiceA.emoji + ' ' + scenario.choiceA.text;
  choiceB.querySelector('.choice-text').textContent = scenario.choiceB.emoji + ' ' + scenario.choiceB.text;

  // Reset choice button states
  choiceA.classList.remove('selected', 'not-selected');
  choiceB.classList.remove('selected', 'not-selected');
  choiceA.disabled = false;
  choiceB.disabled = false;

  // Hide animation overlay
  document.getElementById('animation-overlay').classList.add('hidden');

  // Draw initial scene
  drawScene(scenario.scene);
}

function typeText(element, text, speed = 20) {
  element.textContent = '';
  element.classList.add('typing');
  let i = 0;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      element.classList.remove('typing');
    }
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
  const choiceA = document.getElementById('choice-a');
  const choiceB = document.getElementById('choice-b');

  // Disable buttons
  choiceA.disabled = true;
  choiceB.disabled = true;

  // Animate choice selection
  if (choice === 'A') {
    choiceA.classList.add('selected');
    choiceB.classList.add('not-selected');
  } else {
    choiceB.classList.add('selected');
    choiceA.classList.add('not-selected');
  }

  // Store choice
  choices.push(choice);
  savedCount += result.saved;
  if (result.active) activeChoices++;

  // Play scenario animation
  playScenarioAnimation(scenario.scene, choice, result);
}

// ===== SCENARIO ANIMATIONS =====
function playScenarioAnimation(sceneType, choice, result) {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('animation-overlay');
  const outcomeText = document.getElementById('outcome-text');
  const flash = document.getElementById('impact-flash');

  overlay.classList.remove('hidden');

  let frame = 0;
  const totalFrames = 120;
  leverPulled = choice === 'B';

  if (choice === 'B') {
    setTimeout(() => playSound('lever'), 200);
  }

  function animate() {
    frame++;

    // Clear and redraw scene with animation
    drawSceneAnimated(ctx, canvas, sceneType, frame, choice);

    // Impact at frame 80
    if (frame === 80) {
      playSound('impact');
      flash.classList.add('flash');
      document.getElementById('scene-container').classList.add('shake');
      setTimeout(() => {
        flash.classList.remove('flash');
        document.getElementById('scene-container').classList.remove('shake');
      }, 500);
    }

    // Show outcome text at frame 100
    if (frame === 100) {
      playSound('death');
      outcomeText.textContent = result.outcomeText;
      outcomeText.classList.add('show');
    }

    if (frame < totalFrames) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Animation complete, show result
      setTimeout(() => {
        outcomeText.classList.remove('show');
        showResult(result);
      }, 800);
    }
  }

  animate();
}

function drawSceneAnimated(ctx, canvas, sceneType, frame, choice) {
  const w = canvas.width;
  const h = canvas.height;

  // Clear
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, w, h);

  // Ground
  ctx.fillStyle = '#2d4a22';
  ctx.fillRect(0, h - 40, w, 40);

  // Calculate trolley position
  let trolleyTargetX;
  let trolleyY = h - 85;

  if (frame < 80) {
    // Moving towards decision point
    trolleyX = 30 + (frame / 80) * (w * 0.5 - 30);
  } else {
    // After decision point
    const postFrame = frame - 80;
    if (choice === 'B' && (sceneType === 'classic' || sceneType === 'loop')) {
      // Divert up
      trolleyX = w * 0.5 + postFrame * 3;
      trolleyY = h - 85 - postFrame * 0.8;
    } else {
      // Continue straight
      trolleyX = w * 0.5 + postFrame * 3;
    }
  }

  // Draw tracks based on scene
  drawTracks(ctx, w, h, sceneType, choice, frame);

  // Draw people (some may be "hit" after frame 80)
  drawPeopleAnimated(ctx, w, h, sceneType, choice, frame);

  // Draw lever
  if (sceneType !== 'hospital') {
    drawLeverAnimated(ctx, w * 0.35, h - 100, choice === 'B' && frame > 20);
  }

  // Draw trolley
  if (sceneType !== 'hospital') {
    drawTrolleyAnimated(ctx, trolleyX, trolleyY, frame);
  }

  // Scene-specific elements
  if (sceneType === 'bridge') {
    drawBridge(ctx, w, h, choice, frame);
  } else if (sceneType === 'hospital') {
    drawHospitalAnimated(ctx, w, h, choice, frame);
  }
}

function drawTracks(ctx, w, h, sceneType, choice, frame) {
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 8;

  // Main track
  ctx.beginPath();
  ctx.moveTo(0, h - 60);
  ctx.lineTo(w, h - 60);
  ctx.stroke();

  // Side/loop track
  if (sceneType === 'classic' || sceneType === 'loop') {
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h - 60);
    ctx.lineTo(w * 0.5, h - 90);
    ctx.lineTo(w, h - 90);
    ctx.stroke();
  }

  // Track ties
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 2;
  for (let i = 0; i < w; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, h - 56);
    ctx.lineTo(i, h - 64);
    ctx.stroke();
  }
}

function drawPeopleAnimated(ctx, w, h, sceneType, choice, frame) {
  const hitFrame = 85;

  if (sceneType === 'hospital') return; // Hospital handles its own

  // Five people on main track
  for (let i = 0; i < 5; i++) {
    const px = w * 0.6 + i * 25;
    const py = h - 80;

    // If choice A (no action), they get hit
    if (choice === 'A' && frame > hitFrame) {
      // Dead - draw X
      ctx.strokeStyle = '#ff5555';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 8, py - 8);
      ctx.lineTo(px + 8, py + 15);
      ctx.moveTo(px + 8, py - 8);
      ctx.lineTo(px - 8, py + 15);
      ctx.stroke();
    } else {
      drawPerson(ctx, px, py, '#ffcc00');
    }
  }

  // One person on side track (for classic/loop)
  if (sceneType === 'classic' || sceneType === 'loop') {
    const px = w * 0.7;
    const py = h - 110;

    if (choice === 'B' && frame > hitFrame) {
      ctx.strokeStyle = '#ff5555';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 8, py - 8);
      ctx.lineTo(px + 8, py + 15);
      ctx.moveTo(px + 8, py - 8);
      ctx.lineTo(px - 8, py + 15);
      ctx.stroke();
    } else {
      drawPerson(ctx, px, py, '#ffcc00');
    }
  }

  // You (sacrifice scenario)
  if (sceneType === 'sacrifice') {
    const px = w * 0.4;
    const py = h - 80;

    if (choice === 'B' && frame > hitFrame) {
      ctx.strokeStyle = '#ff5555';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 8, py - 8);
      ctx.lineTo(px + 8, py + 15);
      ctx.moveTo(px + 8, py - 8);
      ctx.lineTo(px - 8, py + 15);
      ctx.stroke();

      // Halo
      ctx.strokeStyle = '#f1fa8c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py - 15, 12, 0, Math.PI * 2);
      ctx.stroke();
    } else if (choice === 'B' && frame > 40) {
      // Moving into position
      drawPerson(ctx, px, py, '#66ffcc');
    } else if (choice === 'A' && frame > 40) {
      // Stepping aside
      drawPerson(ctx, px - 40, py, '#66ffcc');
    } else {
      drawPerson(ctx, px, py, '#66ffcc');
    }
  }
}

function drawBridge(ctx, w, h, choice, frame) {
  // Bridge structure
  ctx.fillStyle = '#533483';
  ctx.fillRect(w * 0.3, h - 120, w * 0.4, 20);

  // Supports
  ctx.fillStyle = '#3d2660';
  ctx.fillRect(w * 0.32, h - 100, 10, 70);
  ctx.fillRect(w * 0.58, h - 100, 10, 70);

  // Fat man
  const fatManX = w * 0.45;
  let fatManY = h - 140;

  if (choice === 'B' && frame > 30) {
    // Falling
    const fallFrame = frame - 30;
    fatManY = h - 140 + fallFrame * 2;

    if (frame > 60) {
      fatManY = h - 50; // On track
    }

    if (frame > 85) {
      // Dead
      ctx.strokeStyle = '#ff5555';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fatManX - 10, h - 58);
      ctx.lineTo(fatManX + 10, h - 30);
      ctx.moveTo(fatManX + 10, h - 58);
      ctx.lineTo(fatManX - 10, h - 30);
      ctx.stroke();
      return;
    }
  }

  if (fatManY < h - 50) {
    drawPerson(ctx, fatManX, fatManY, '#ff9966', 1.5);
  }

  // You on bridge
  drawPerson(ctx, w * 0.38, h - 140, '#66ffcc');
}

function drawHospitalAnimated(ctx, w, h, choice, frame) {
  // Hospital background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, w, h);

  // Floor
  ctx.fillStyle = '#ddd';
  ctx.fillRect(0, h - 50, w, 50);

  // Tile pattern
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, h - 50);
    ctx.lineTo(i, h);
    ctx.stroke();
  }

  // Hospital beds with patients
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(15 + i * 58, h - 100, 50, 40);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.strokeRect(15 + i * 58, h - 100, 50, 40);

    if (choice === 'A' && frame > 85) {
      // Patients die
      ctx.strokeStyle = '#ff5555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(32 + i * 58, h - 115);
      ctx.lineTo(48 + i * 58, h - 95);
      ctx.moveTo(48 + i * 58, h - 115);
      ctx.lineTo(32 + i * 58, h - 95);
      ctx.stroke();
    } else if (choice === 'B' && frame > 85) {
      // Patients saved - draw heart
      ctx.fillStyle = '#50fa7b';
      ctx.beginPath();
      ctx.arc(37 + i * 58, h - 108, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawPerson(ctx, 40 + i * 58, h - 110, '#ff6666', 0.8);
    }
  }

  // Healthy visitor
  if (choice === 'B' && frame > 85) {
    // Dead
    ctx.strokeStyle = '#ff5555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w - 58, h - 78);
    ctx.lineTo(w - 42, h - 50);
    ctx.moveTo(w - 42, h - 78);
    ctx.lineTo(w - 58, h - 50);
    ctx.stroke();
  } else {
    drawPerson(ctx, w - 50, h - 70, '#66ff66');
  }

  // Doctor (you)
  drawPerson(ctx, w - 90, h - 70, '#66ffcc');
}

function drawTrolleyAnimated(ctx, x, y, frame) {
  // Add shake when moving fast
  const shake = frame < 80 ? Math.sin(frame * 0.5) * 2 : 0;

  // Trolley body
  ctx.fillStyle = '#e94560';
  ctx.fillRect(x, y + shake, 50, 25);

  // Windows
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(x + 5, y + 3 + shake, 15, 10);
  ctx.fillRect(x + 25, y + 3 + shake, 15, 10);

  // Wheels with rotation
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + 12, y + 25, 6, 0, Math.PI * 2);
  ctx.arc(x + 38, y + 25, 6, 0, Math.PI * 2);
  ctx.fill();

  // Wheel spokes
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  const wheelAngle = frame * 0.3;
  [x + 12, x + 38].forEach(wx => {
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(wheelAngle) * 4, y + 25 + Math.sin(wheelAngle) * 4);
    ctx.lineTo(wx - Math.cos(wheelAngle) * 4, y + 25 - Math.sin(wheelAngle) * 4);
    ctx.stroke();
  });

  // Motion lines
  if (frame < 80) {
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 10 - i * 8, y + 5 + i * 7 + shake);
      ctx.lineTo(x - 25 - i * 8, y + 5 + i * 7 + shake);
      ctx.stroke();
    }
  }

  // Sparks after impact
  if (frame > 82 && frame < 95) {
    ctx.fillStyle = '#f1fa8c';
    for (let i = 0; i < 5; i++) {
      const sparkX = x + 25 + Math.random() * 30 - 15;
      const sparkY = y + Math.random() * 20;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLeverAnimated(ctx, x, y, pulled) {
  // Base
  ctx.fillStyle = '#666';
  ctx.fillRect(x - 5, y + 15, 15, 10);

  // Lever arm
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 20);

  if (pulled) {
    ctx.lineTo(x + 15, y); // Pulled right
  } else {
    ctx.lineTo(x - 5, y); // Default left
  }
  ctx.stroke();

  // Handle
  ctx.fillStyle = pulled ? '#50fa7b' : '#e94560';
  ctx.beginPath();
  if (pulled) {
    ctx.arc(x + 15, y, 6, 0, Math.PI * 2);
  } else {
    ctx.arc(x - 5, y, 6, 0, Math.PI * 2);
  }
  ctx.fill();
}

function drawPerson(ctx, x, y, color, scale = 1) {
  const s = scale;

  // Head
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x, y, 6 * s, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = color;
  ctx.fillRect(x - 5 * s, y + 6 * s, 10 * s, 15 * s);

  // Arms
  ctx.fillRect(x - 10 * s, y + 8 * s, 5 * s, 10 * s);
  ctx.fillRect(x + 5 * s, y + 8 * s, 5 * s, 10 * s);
}

// ===== STATIC SCENE DRAWING =====
function drawScene(sceneType) {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, w, h);

  // Ground
  ctx.fillStyle = '#2d4a22';
  ctx.fillRect(0, h - 40, w, 40);

  // Draw based on scene type
  switch(sceneType) {
    case 'classic':
    case 'loop':
      drawTracks(ctx, w, h, sceneType, '', 0);
      drawTrolleyAnimated(ctx, 30, h - 85, 0);
      for (let i = 0; i < 5; i++) drawPerson(ctx, w * 0.6 + i * 25, h - 80, '#ffcc00');
      drawPerson(ctx, w * 0.7, h - 110, '#ffcc00');
      drawLeverAnimated(ctx, w * 0.35, h - 100, false);
      break;
    case 'bridge':
      drawTracks(ctx, w, h, sceneType, '', 0);
      drawTrolleyAnimated(ctx, 30, h - 55, 0);
      for (let i = 0; i < 5; i++) drawPerson(ctx, w * 0.6 + i * 20, h - 50, '#ffcc00');
      drawBridge(ctx, w, h, '', 0);
      break;
    case 'hospital':
      drawHospitalAnimated(ctx, w, h, '', 0);
      break;
    case 'sacrifice':
      drawTracks(ctx, w, h, sceneType, '', 0);
      drawTrolleyAnimated(ctx, 30, h - 85, 0);
      drawPerson(ctx, w * 0.4, h - 80, '#66ffcc');
      for (let i = 0; i < 5; i++) drawPerson(ctx, w * 0.6 + i * 25, h - 80, '#ffcc00');
      break;
  }
}

// ===== RESULT SCREEN =====
function showResult(result) {
  const scenario = scenarios[currentScenario];

  hideAllScreens();
  document.getElementById('result-screen').classList.remove('hidden');

  document.getElementById('result-icon').textContent = result.active ? '⚡' : '🚫';
  document.getElementById('result-title').textContent = result.active ? 'ACTION TAKEN' : 'INACTION';
  document.getElementById('result-text').textContent = result.result;
  document.getElementById('philosophy-text').textContent = scenario.philosophy;
  document.getElementById('toll-saved-num').textContent = result.saved;
  document.getElementById('toll-lost-num').textContent = result.killed;

  isAnimating = false;
}

function nextScenario() {
  playSound('select');
  currentScenario++;

  if (currentScenario >= scenarios.length) {
    showSummary();
  } else {
    hideAllScreens();
    document.getElementById('game-play').classList.remove('hidden');
    loadScenario();
  }
}

// ===== SUMMARY SCREEN =====
function showSummary() {
  hideAllScreens();
  document.getElementById('summary-screen').classList.remove('hidden');

  document.getElementById('final-saved').textContent = savedCount + ' lives';
  document.getElementById('active-choices').textContent = activeChoices + ' / 5';

  let philType, philSummary;

  if (activeChoices >= 4) {
    philType = 'UTILITARIAN';
    philSummary = 'You consistently chose to maximize good outcomes, even when it required difficult actions. You believe the ends can justify the means, and that we have a moral duty to minimize suffering.';
  } else if (activeChoices <= 1) {
    philType = 'DEONTOLOGIST';
    philSummary = 'You prioritized moral rules over outcomes. Killing is wrong, regardless of consequences. You believe some actions are inherently immoral, and we cannot use people as mere means to an end.';
  } else {
    philType = 'MORAL PLURALIST';
    philSummary = 'Your choices varied based on context. You recognize that both rules and consequences matter, and that different situations call for different ethical frameworks. This reflects how most humans actually make moral decisions.';
  }

  document.getElementById('philosophy-type').textContent = philType;
  document.getElementById('philosophy-summary').textContent = philSummary;
}

function restartGame() {
  playSound('confirm');
  hideAllScreens();
  document.getElementById('title-screen').classList.remove('hidden');
}

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
  if (!document.getElementById('game-play').classList.contains('hidden') && !isAnimating) {
    drawScene(scenarios[currentScenario].scene);
  }
});
