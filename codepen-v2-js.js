// ===== GAME STATE =====
let currentScenario = 0;
let choices = [];
let isAnimating = false;
let animationFrame;
let trolleyX = 30;
let scenarioPath = []; // Track the branching path taken
let breakingPoints = {}; // Track where player's principles broke

// ===== GAME MODE =====
let gameMode = 'normal'; // 'normal' or 'hard'
const TIMER_DURATION = 20; // seconds for hard mode
let timerInterval = null;
let timeRemaining = TIMER_DURATION;
let timerExpired = false;
let timeoutChoices = 0; // Track how many times player timed out

// ===== PHILOSOPHICAL SCORES =====
let scores = {
  utilitarian: 0,
  deontological: 0,
  virtueEthics: 0,
  careEthics: 0,
  contractarian: 0,
  naturalRights: 0,
  existentialist: 0,
  pragmatist: 0,
  // Trait scores
  activeHarm: 0,
  impartiality: 0,
  consequentialism: 0,
  flexibility: 0
};

let previousChoices = {};
let inconsistencies = 0;

// ===== REAL PHILOSOPHICAL RESOURCES =====
const philosophyInfo = {
  utilitarian: {
    name: "Utilitarianism",
    color: "#50fa7b",
    shortDesc: "The right action produces the greatest good for the greatest number.",
    fullDesc: "Utilitarianism holds that the best action is the one that maximizes overall well-being or 'utility.' Founded by Jeremy Bentham and refined by John Stuart Mill, it's a consequentialist theory—only outcomes matter morally. Modern effective altruism draws heavily from utilitarian principles.",
    keyPrinciple: "The Greatest Happiness Principle",
    critiques: [
      "Can justify harming minorities for majority benefit",
      "Impossible to calculate all consequences",
      "Ignores individual rights and justice"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/utilitarianism-history/",
      wikipedia: "https://en.wikipedia.org/wiki/Utilitarianism",
      iep: "https://iep.utm.edu/util-a-r/"
    },
    books: [
      { title: "Utilitarianism", author: "John Stuart Mill", year: 1863 },
      { title: "The Methods of Ethics", author: "Henry Sidgwick", year: 1874 },
      { title: "Practical Ethics", author: "Peter Singer", year: 1979 }
    ],
    quote: {
      text: "Actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse of happiness.",
      author: "John Stuart Mill"
    }
  },
  deontological: {
    name: "Deontology",
    color: "#8be9fd",
    shortDesc: "Some actions are inherently right or wrong, regardless of consequences.",
    fullDesc: "Deontological ethics, primarily associated with Immanuel Kant, holds that morality is about following rules and duties. The categorical imperative demands we act only according to rules we could will to be universal laws, and never treat humanity merely as a means to an end.",
    keyPrinciple: "The Categorical Imperative",
    critiques: [
      "Can lead to rigid, inflexible moral rules",
      "Difficult to resolve conflicts between duties",
      "Ignores consequences that seem morally relevant"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/ethics-deontological/",
      wikipedia: "https://en.wikipedia.org/wiki/Deontology",
      iep: "https://iep.utm.edu/kantmeta/"
    },
    books: [
      { title: "Groundwork of the Metaphysics of Morals", author: "Immanuel Kant", year: 1785 },
      { title: "The Right and the Good", author: "W.D. Ross", year: 1930 },
      { title: "A Theory of Justice", author: "John Rawls", year: 1971 }
    ],
    quote: {
      text: "Act only according to that maxim whereby you can at the same time will that it should become a universal law.",
      author: "Immanuel Kant"
    }
  },
  virtueEthics: {
    name: "Virtue Ethics",
    color: "#f1fa8c",
    shortDesc: "Focus on developing good character rather than following rules.",
    fullDesc: "Virtue ethics, originating with Aristotle, emphasizes character development over rule-following or consequence-calculation. The goal is eudaimonia (flourishing) achieved through cultivating virtues like courage, justice, temperance, and practical wisdom (phronesis).",
    keyPrinciple: "Eudaimonia (Human Flourishing)",
    critiques: [
      "Vague about what to do in specific situations",
      "Cultural disagreement about what virtues are",
      "Circular: virtuous acts are what virtuous people do"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/ethics-virtue/",
      wikipedia: "https://en.wikipedia.org/wiki/Virtue_ethics",
      iep: "https://iep.utm.edu/virtue/"
    },
    books: [
      { title: "Nicomachean Ethics", author: "Aristotle", year: -350 },
      { title: "After Virtue", author: "Alasdair MacIntyre", year: 1981 },
      { title: "Virtues and Vices", author: "Philippa Foot", year: 1978 }
    ],
    quote: {
      text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      author: "Aristotle"
    }
  },
  careEthics: {
    name: "Care Ethics",
    color: "#ff79c6",
    shortDesc: "Relationships and context matter more than abstract principles.",
    fullDesc: "Care ethics, developed by Carol Gilligan and Nel Noddings, emphasizes the importance of response to others in their particular circumstances. Rather than applying universal rules impartially, we should attend to relationships, vulnerability, and the needs of those we're connected to.",
    keyPrinciple: "Relational Responsibility",
    critiques: [
      "May justify favoritism and partiality",
      "Difficult to extend to strangers or distant others",
      "Risk of exploitation of caregivers"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/feminism-ethics/",
      wikipedia: "https://en.wikipedia.org/wiki/Ethics_of_care",
      iep: "https://iep.utm.edu/care-eth/"
    },
    books: [
      { title: "In a Different Voice", author: "Carol Gilligan", year: 1982 },
      { title: "Caring: A Feminine Approach to Ethics", author: "Nel Noddings", year: 1984 },
      { title: "The Ethics of Care", author: "Virginia Held", year: 2006 }
    ],
    quote: {
      text: "The ethic of care speaks to the truth that humans are relational beings.",
      author: "Carol Gilligan"
    }
  },
  contractarian: {
    name: "Contractarianism",
    color: "#ffb86c",
    shortDesc: "Morality is based on agreements rational people would make.",
    fullDesc: "Social contract theory, from Hobbes through Rawls, grounds morality in hypothetical agreements. Rawls's famous 'veil of ignorance' asks what principles we'd choose if we didn't know our position in society. Fair rules are those everyone could rationally accept.",
    keyPrinciple: "The Veil of Ignorance",
    critiques: [
      "Based on hypothetical, not actual agreements",
      "Excludes those who can't participate in contracts",
      "May not account for historical injustices"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/contractarianism/",
      wikipedia: "https://en.wikipedia.org/wiki/Social_contract",
      iep: "https://iep.utm.edu/soc-cont/"
    },
    books: [
      { title: "Leviathan", author: "Thomas Hobbes", year: 1651 },
      { title: "A Theory of Justice", author: "John Rawls", year: 1971 },
      { title: "Morals by Agreement", author: "David Gauthier", year: 1986 }
    ],
    quote: {
      text: "Justice is the first virtue of social institutions, as truth is of systems of thought.",
      author: "John Rawls"
    }
  },
  naturalRights: {
    name: "Natural Rights Theory",
    color: "#bd93f9",
    shortDesc: "Individuals have fundamental rights that cannot be violated.",
    fullDesc: "Natural rights theory, from Locke through Nozick, holds that individuals possess inherent rights—to life, liberty, and property—that exist prior to government. These rights act as 'side constraints' that limit what may be done to people, even for good ends.",
    keyPrinciple: "Rights as Side Constraints",
    critiques: [
      "Unclear source and foundation of natural rights",
      "Rights can conflict with each other",
      "May prioritize liberty over equality"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/rights-human/",
      wikipedia: "https://en.wikipedia.org/wiki/Natural_rights_and_legal_rights",
      iep: "https://iep.utm.edu/natlaw/"
    },
    books: [
      { title: "Two Treatises of Government", author: "John Locke", year: 1689 },
      { title: "Anarchy, State, and Utopia", author: "Robert Nozick", year: 1974 },
      { title: "Taking Rights Seriously", author: "Ronald Dworkin", year: 1977 }
    ],
    quote: {
      text: "Being all equal and independent, no one ought to harm another in his life, health, liberty, or possessions.",
      author: "John Locke"
    }
  },
  existentialist: {
    name: "Existentialist Ethics",
    color: "#6272a4",
    shortDesc: "We create meaning through authentic choices and radical freedom.",
    fullDesc: "Existentialist ethics, from Kierkegaard through Sartre and Camus, emphasizes radical freedom and responsibility. There are no pre-given moral rules—we must create our own values through authentic choices. 'Existence precedes essence' means we define ourselves through our actions.",
    keyPrinciple: "Radical Freedom and Responsibility",
    critiques: [
      "Can lead to moral relativism",
      "Underestimates social constraints on freedom",
      "Anxiety-inducing emphasis on total responsibility"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/existentialism/",
      wikipedia: "https://en.wikipedia.org/wiki/Existentialism",
      iep: "https://iep.utm.edu/existent/"
    },
    books: [
      { title: "Being and Nothingness", author: "Jean-Paul Sartre", year: 1943 },
      { title: "The Myth of Sisyphus", author: "Albert Camus", year: 1942 },
      { title: "Either/Or", author: "Søren Kierkegaard", year: 1843 }
    ],
    quote: {
      text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.",
      author: "Jean-Paul Sartre"
    }
  },
  pragmatist: {
    name: "Pragmatist Ethics",
    color: "#ff5555",
    shortDesc: "Truth and morality are found in what works in practice.",
    fullDesc: "Pragmatist ethics, developed by William James and John Dewey, rejects fixed moral principles in favor of experimental inquiry. What's 'right' is what leads to growth, learning, and problem-solving in specific contexts. Morality is a tool for human flourishing, not an abstract system.",
    keyPrinciple: "Experimental Inquiry",
    critiques: [
      "May justify harmful practices if they 'work'",
      "Vague about standards for success",
      "Can devolve into mere opportunism"
    ],
    links: {
      stanford: "https://plato.stanford.edu/entries/pragmatism/",
      wikipedia: "https://en.wikipedia.org/wiki/Pragmatism",
      iep: "https://iep.utm.edu/pragmati/"
    },
    books: [
      { title: "Pragmatism", author: "William James", year: 1907 },
      { title: "Human Nature and Conduct", author: "John Dewey", year: 1922 },
      { title: "Philosophy and the Mirror of Nature", author: "Richard Rorty", year: 1979 }
    ],
    quote: {
      text: "The true is the name of whatever proves itself to be good in the way of belief.",
      author: "William James"
    }
  }
};

// ===== ENHANCED PHILOSOPHER DATA =====
const philosophers = [
  {
    name: "Peter Singer",
    school: "utilitarian",
    threshold: 70,
    desc: "Radical altruist arguing we must help distant strangers",
    link: "https://en.wikipedia.org/wiki/Peter_Singer",
    work: "Animal Liberation, The Life You Can Save"
  },
  {
    name: "John Stuart Mill",
    school: "utilitarian",
    threshold: 60,
    desc: "Refined utilitarianism with qualitative pleasures",
    link: "https://en.wikipedia.org/wiki/John_Stuart_Mill",
    work: "Utilitarianism, On Liberty"
  },
  {
    name: "Jeremy Bentham",
    school: "utilitarian",
    threshold: 50,
    desc: "Founder of utilitarianism and the felicific calculus",
    link: "https://en.wikipedia.org/wiki/Jeremy_Bentham",
    work: "An Introduction to the Principles of Morals and Legislation"
  },
  {
    name: "Immanuel Kant",
    school: "deontological",
    threshold: 60,
    desc: "Duty-based ethics and the categorical imperative",
    link: "https://en.wikipedia.org/wiki/Immanuel_Kant",
    work: "Groundwork of the Metaphysics of Morals"
  },
  {
    name: "W.D. Ross",
    school: "deontological",
    threshold: 50,
    desc: "Prima facie duties and moral pluralism",
    link: "https://en.wikipedia.org/wiki/W._D._Ross",
    work: "The Right and the Good"
  },
  {
    name: "Aristotle",
    school: "virtueEthics",
    threshold: 55,
    desc: "Virtue as the path to eudaimonia (flourishing)",
    link: "https://en.wikipedia.org/wiki/Aristotle",
    work: "Nicomachean Ethics"
  },
  {
    name: "Philippa Foot",
    school: "virtueEthics",
    threshold: 50,
    desc: "Inventor of the trolley problem, virtue ethics pioneer",
    link: "https://en.wikipedia.org/wiki/Philippa_Foot",
    work: "Virtues and Vices"
  },
  {
    name: "Alasdair MacIntyre",
    school: "virtueEthics",
    threshold: 55,
    desc: "Tradition-based virtue ethics",
    link: "https://en.wikipedia.org/wiki/Alasdair_MacIntyre",
    work: "After Virtue"
  },
  {
    name: "Nel Noddings",
    school: "careEthics",
    threshold: 55,
    desc: "Ethics of care and relational responsibility",
    link: "https://en.wikipedia.org/wiki/Nel_Noddings",
    work: "Caring: A Feminine Approach to Ethics"
  },
  {
    name: "Carol Gilligan",
    school: "careEthics",
    threshold: 50,
    desc: "Care ethics as distinct moral voice",
    link: "https://en.wikipedia.org/wiki/Carol_Gilligan",
    work: "In a Different Voice"
  },
  {
    name: "John Rawls",
    school: "contractarian",
    threshold: 55,
    desc: "Justice as fairness behind the veil of ignorance",
    link: "https://en.wikipedia.org/wiki/John_Rawls",
    work: "A Theory of Justice"
  },
  {
    name: "Thomas Hobbes",
    school: "contractarian",
    threshold: 45,
    desc: "Social contract to escape the state of nature",
    link: "https://en.wikipedia.org/wiki/Thomas_Hobbes",
    work: "Leviathan"
  },
  {
    name: "John Locke",
    school: "naturalRights",
    threshold: 55,
    desc: "Natural rights to life, liberty, and property",
    link: "https://en.wikipedia.org/wiki/John_Locke",
    work: "Two Treatises of Government"
  },
  {
    name: "Robert Nozick",
    school: "naturalRights",
    threshold: 60,
    desc: "Rights as absolute side constraints",
    link: "https://en.wikipedia.org/wiki/Robert_Nozick",
    work: "Anarchy, State, and Utopia"
  },
  {
    name: "Jean-Paul Sartre",
    school: "existentialist",
    threshold: 55,
    desc: "Radical freedom and responsibility",
    link: "https://en.wikipedia.org/wiki/Jean-Paul_Sartre",
    work: "Being and Nothingness"
  },
  {
    name: "Albert Camus",
    school: "existentialist",
    threshold: 50,
    desc: "Absurdism and revolt against meaninglessness",
    link: "https://en.wikipedia.org/wiki/Albert_Camus",
    work: "The Myth of Sisyphus"
  },
  {
    name: "John Dewey",
    school: "pragmatist",
    threshold: 55,
    desc: "Experimental ethics and moral growth",
    link: "https://en.wikipedia.org/wiki/John_Dewey",
    work: "Human Nature and Conduct"
  },
  {
    name: "William James",
    school: "pragmatist",
    threshold: 50,
    desc: "Truth is what works in practice",
    link: "https://en.wikipedia.org/wiki/William_James",
    work: "Pragmatism"
  }
];

// ===== BRANCHING SCENARIO SYSTEM =====
// Scenarios now have branches based on previous choices
// Structure: base scenarios -> escalation variants

const scenarioTree = {
  // ===== FOUNDATION: THE CLASSIC =====
  "classic": {
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
      ],
      nextScenario: "classic_escalate_A" // If they didn't pull lever, test with even more lives
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
      ],
      nextScenario: "fatman" // If they pulled lever, test if they'd push someone
    },
    scene: "classic",
    consistencyKey: "leverPull"
  },

  // Escalation for those who didn't pull the lever
  "classic_escalate_A": {
    id: "classic_escalate_A",
    category: "TESTING YOUR LIMITS",
    title: "THE HUNDRED SOULS",
    description: "Another trolley, but this time 100 people are on the main track - a whole tour group. One person stands on the side track. Will you still refuse to act?",
    stakes: 45,
    choiceA: {
      text: "Still do nothing - killing is killing",
      emoji: "🚫",
      result: "100 people died. Your principle held absolutely. Kant might approve, but the weight of 100 lives tests the strongest convictions.",
      outcomeText: "100 LOST",
      scores: { deontological: 4, naturalRights: 3, flexibility: -3 },
      implications: [
        { icon: "⚖️", text: "Maintained absolute moral principle regardless of numbers", positive: true },
        { icon: "💀", text: "100 families destroyed by your inaction", positive: false }
      ],
      nextScenario: "promise" // Move to a different ethical dimension
    },
    choiceB: {
      text: "Pull the lever - 100 is too many",
      emoji: "🔀",
      result: "Your principle broke under the weight of 100 lives. You found your limit - where passive harm becomes morally worse than active harm.",
      outcomeText: "1 LOST, 100 SAVED",
      scores: { utilitarian: 3, flexibility: 3, pragmatist: 2 },
      implications: [
        { icon: "🔓", text: "Discovered your moral breaking point", positive: true },
        { icon: "📜", text: "Your principles weren't as absolute as you thought", positive: false }
      ],
      nextScenario: "fatman",
      breaksConsistency: "leverPull"
    },
    scene: "classic",
    consistencyKey: "leverPull100"
  },

  // ===== MEANS VS ENDS: THE FOOTBRIDGE =====
  "fatman": {
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
      ],
      nextScenario: "grandma"
    },
    choiceB: {
      text: "Push him - save the five workers",
      emoji: "👐",
      result: "You used a human being as a tool to save five others. The utilitarian math is the same as the lever, but something feels different.",
      outcomeText: "1 LOST, 5 SAVED",
      scores: { utilitarian: 2, consequentialism: 2, activeHarm: 3, flexibility: 2 },
      implications: [
        { icon: "📊", text: "Same outcome as the lever - five saved, one lost", positive: true },
        { icon: "🔧", text: "You treated a person as a tool - violating human dignity", positive: false }
      ],
      nextScenario: "fatman_escalate_B"
    },
    scene: "bridge",
    consistencyKey: "physicalHarm"
  },

  // Escalation for those who pushed
  "fatman_escalate_B": {
    id: "fatman_escalate_B",
    category: "TESTING YOUR LIMITS",
    title: "THE CHILD ON THE BRIDGE",
    description: "Same scenario, but now it's a child standing on the bridge. The child is large enough to stop the trolley. Five workers below. Will you push a child to their death?",
    stakes: 75,
    choiceA: {
      text: "Not a child - I won't push them",
      emoji: "👶",
      result: "Children are different. Innocence, potential, vulnerability - something stopped you. Your utilitarianism has limits.",
      outcomeText: "5 LOST",
      scores: { deontological: 2, virtueEthics: 2, careEthics: 2, flexibility: -2 },
      implications: [
        { icon: "👶", text: "Protected childhood innocence", positive: true },
        { icon: "🤔", text: "But age doesn't change the utilitarian calculus...", positive: false }
      ],
      nextScenario: "grandma",
      breaksConsistency: "physicalHarm"
    },
    choiceB: {
      text: "Push the child - five lives outweigh one",
      emoji: "💀",
      result: "You pushed a child to their death. Pure utilitarian logic. Most people couldn't, but you maintained consistency at a terrible cost.",
      outcomeText: "CHILD LOST, 5 SAVED",
      scores: { utilitarian: 4, consequentialism: 4, activeHarm: 4, flexibility: 3 },
      implications: [
        { icon: "📊", text: "Absolutely consistent utilitarian reasoning", positive: true },
        { icon: "😰", text: "You killed a child. Can you live with that?", positive: false }
      ],
      nextScenario: "transplant"
    },
    scene: "bridge",
    consistencyKey: "pushChild"
  },

  // ===== PARTIALITY: LOVED ONES =====
  "grandma": {
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
      ],
      nextScenario: "grandma_escalate_A"
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
      ],
      nextScenario: "grandma_escalate_B"
    },
    scene: "family",
    consistencyKey: "partiality"
  },

  // Escalation for those who saved grandma
  "grandma_escalate_A": {
    id: "grandma_escalate_A",
    category: "TESTING YOUR LIMITS",
    title: "THE VILLAGE",
    description: "Your grandmother is on one track. On the other: 500 villagers fleeing a fire. The only escape route runs across these tracks. You control the switch.",
    stakes: 90,
    choiceA: {
      text: "Save grandma - she's MY grandmother",
      emoji: "👵",
      result: "500 people burned. You chose the person you love over a village. Care ethics stretched to its absolute limit.",
      outcomeText: "500 LOST",
      scores: { careEthics: 5, impartiality: -5, existentialist: 2 },
      implications: [
        { icon: "💕", text: "Love transcends numbers - you made your choice", positive: true },
        { icon: "🔥", text: "500 people died for your personal loyalty", positive: false }
      ],
      nextScenario: "lying"
    },
    choiceB: {
      text: "Save the 500 - even I have limits",
      emoji: "👥",
      result: "Your love for your grandmother couldn't survive the weight of 500 lives. You found where partiality ends.",
      outcomeText: "500 SAVED",
      scores: { utilitarian: 4, impartiality: 3, flexibility: 2, pragmatist: 2 },
      implications: [
        { icon: "⚖️", text: "Found the limit of partiality - 500 lives", positive: true },
        { icon: "💔", text: "Sacrificed your grandmother to numbers", positive: false }
      ],
      nextScenario: "transplant",
      breaksConsistency: "partiality"
    },
    scene: "family",
    consistencyKey: "partialityExtreme"
  },

  // Escalation for those who saved strangers over grandma
  "grandma_escalate_B": {
    id: "grandma_escalate_B",
    category: "TESTING YOUR LIMITS",
    title: "YOUR CHILD",
    description: "On one track: your own child. On the other: five strangers. You already let your grandmother die for strangers. Will you sacrifice your child too?",
    stakes: 95,
    choiceA: {
      text: "Save my child - I can't lose them",
      emoji: "👶",
      result: "Your impartiality broke. A child is different. YOUR child is different. Utilitarian principles crumbled before parental love.",
      outcomeText: "CHILD SAVED",
      scores: { careEthics: 4, impartiality: -4, existentialist: 2 },
      implications: [
        { icon: "👶", text: "Parental love overrides philosophical principles", positive: true },
        { icon: "📊", text: "Your impartiality has limits", positive: false }
      ],
      nextScenario: "lying",
      breaksConsistency: "partiality"
    },
    choiceB: {
      text: "Save the five - consistency matters",
      emoji: "👥",
      result: "You let your child die to save five strangers. Peter Singer might admire this. Most people would call it monstrous.",
      outcomeText: "5 SAVED",
      scores: { utilitarian: 5, impartiality: 5, consequentialism: 4 },
      implications: [
        { icon: "⚖️", text: "Perfect impartiality - even to your own child", positive: true },
        { icon: "💔", text: "Your child died for a principle", positive: false }
      ],
      nextScenario: "transplant"
    },
    scene: "family",
    consistencyKey: "sacrificeChild"
  },

  // ===== INSTITUTIONAL ETHICS: TRANSPLANT =====
  "transplant": {
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
      ],
      nextScenario: "torture"
    },
    choiceB: {
      text: "Harvest organs - five lives are worth it",
      emoji: "🔪",
      result: "You murdered an innocent to save five. The utilitarian math works, but you've become what medicine swore to prevent.",
      outcomeText: "1 KILLED, 5 SAVED",
      scores: { utilitarian: 1, consequentialism: 3, activeHarm: 3, flexibility: 3 },
      implications: [
        { icon: "📊", text: "Five people live who would have died", positive: true },
        { icon: "⚠️", text: "You committed murder - destroyed trust in medicine", positive: false }
      ],
      nextScenario: "transplant_escalate_B"
    },
    scene: "hospital",
    consistencyKey: "institutionalKill"
  },

  // Escalation for those who harvested
  "transplant_escalate_B": {
    id: "transplant_escalate_B",
    category: "TESTING YOUR LIMITS",
    title: "THE UNWILLING DONOR",
    description: "Same scenario, but the 'traveler' is a child brought in by their parents for a routine checkup. Their organs would save five adults. The parents trust you completely.",
    stakes: 95,
    choiceA: {
      text: "Not a child - I won't harvest them",
      emoji: "👶",
      result: "Children are protected. Parental trust is sacred. Your utilitarian calculations stopped at the pediatric ward.",
      outcomeText: "5 LOST",
      scores: { deontological: 3, careEthics: 3, virtueEthics: 2, flexibility: -2 },
      implications: [
        { icon: "👶", text: "Children hold special moral status", positive: true },
        { icon: "🤔", text: "But the math is the same...", positive: false }
      ],
      nextScenario: "torture",
      breaksConsistency: "institutionalKill"
    },
    choiceB: {
      text: "Harvest the child - five lives outweigh one",
      emoji: "💀",
      result: "You murdered a child in their parents' care. Your utilitarianism knows no limits. Most would call this psychopathic.",
      outcomeText: "CHILD KILLED, 5 SAVED",
      scores: { utilitarian: 3, consequentialism: 5, activeHarm: 5 },
      implications: [
        { icon: "📊", text: "Perfectly consistent - age doesn't change lives", positive: true },
        { icon: "😰", text: "You murdered a child. There's no coming back from this.", positive: false }
      ],
      nextScenario: "torture"
    },
    scene: "hospital",
    consistencyKey: "harvestChild"
  },

  // ===== EXTREME MEASURES: TORTURE =====
  "torture": {
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
      ],
      nextScenario: "torture_escalate_A"
    },
    choiceB: {
      text: "Torture him - thousands of lives depend on it",
      emoji: "⛓️",
      result: "You tortured him, got the information, and saved thousands. But you've now become someone who tortures. Can you live with that?",
      outcomeText: "THOUSANDS SAVED",
      scores: { utilitarian: 3, consequentialism: 3, flexibility: 3, activeHarm: 3, pragmatist: 2 },
      implications: [
        { icon: "🛡️", text: "Saved thousands of innocent lives", positive: true },
        { icon: "👤", text: "Violated absolute dignity - tortured a human being", positive: false }
      ],
      nextScenario: "lying"
    },
    scene: "interrogation",
    consistencyKey: "torture"
  },

  // Escalation for those who refused torture
  "torture_escalate_A": {
    id: "torture_escalate_A",
    category: "TESTING YOUR LIMITS",
    title: "YOUR FAMILY AT STAKE",
    description: "The bomb is planted at your family's home. Your spouse, children, parents - all there. The terrorist knows where the bomb is. Will you still refuse to torture him?",
    stakes: 100,
    choiceA: {
      text: "Still no torture - principles don't bend",
      emoji: "🚫",
      result: "Your family died. Your principles survived. This is the cost of absolute moral conviction. Most would break, but you didn't.",
      outcomeText: "FAMILY LOST",
      scores: { deontological: 5, naturalRights: 4, flexibility: -5 },
      implications: [
        { icon: "⚖️", text: "Absolute moral integrity, even for family", positive: true },
        { icon: "💔", text: "Your family is dead because you wouldn't bend", positive: false }
      ],
      nextScenario: "lying"
    },
    choiceB: {
      text: "Torture him - not my family",
      emoji: "⛓️",
      result: "Your principles broke when it was your own family. Personal stakes revealed the limits of your absolutism.",
      outcomeText: "FAMILY SAVED",
      scores: { careEthics: 3, flexibility: 4, pragmatist: 3, existentialist: 2 },
      implications: [
        { icon: "💕", text: "Saved the people you love most", positive: true },
        { icon: "📜", text: "Your principles weren't absolute after all", positive: false }
      ],
      nextScenario: "lying",
      breaksConsistency: "torture"
    },
    scene: "interrogation",
    consistencyKey: "tortureFamilyStake"
  },

  // ===== TRUTH AND DECEPTION =====
  "lying": {
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
      ],
      nextScenario: "promise"
    },
    choiceB: {
      text: "Lie to save your friend",
      emoji: "🛡️",
      result: "You lied and your friend survived. The duty to protect trumped the duty to tell truth. Sometimes compassion requires deception.",
      outcomeText: "FRIEND SAVED",
      scores: { careEthics: 3, virtueEthics: 2, flexibility: 2, consequentialism: 2, pragmatist: 1 },
      implications: [
        { icon: "❤️", text: "Protected someone who trusted you", positive: true },
        { icon: "📜", text: "Violated the principle of honesty", positive: false }
      ],
      nextScenario: "promise"
    },
    scene: "door",
    consistencyKey: "lying"
  },

  // ===== DUTY VS OUTCOME =====
  "promise": {
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
      ],
      nextScenario: "omelas"
    },
    choiceB: {
      text: "Donate to charity - save 100 lives",
      emoji: "🌍",
      result: "You broke your promise to save 100 lives. Your friend trusted you, but those lives are real. Was loyalty worth more than 100 people?",
      outcomeText: "100 LIVES SAVED",
      scores: { utilitarian: 3, consequentialism: 3, flexibility: 2, deontological: -1, pragmatist: 2 },
      implications: [
        { icon: "❤️", text: "Saved 100 lives that would have been lost", positive: true },
        { icon: "🤝", text: "Betrayed a dying friend's final wish", positive: false }
      ],
      nextScenario: "omelas"
    },
    scene: "promise",
    consistencyKey: "promiseKeeping"
  },

  // ===== SYSTEMIC ETHICS =====
  "omelas": {
    id: "omelas",
    category: "SYSTEMIC ETHICS",
    title: "THE ONES WHO WALK AWAY",
    description: "You discover your city's prosperity depends on one child being kept in perpetual misery in a basement. Everyone knows, everyone benefits. Freeing the child would destroy everything.",
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
      ],
      nextScenario: "sacrifice"
    },
    choiceB: {
      text: "Reject it - no prosperity is worth this",
      emoji: "🚶",
      result: "You walked away from Omelas, refusing to benefit from systematic cruelty. You gave up everything rather than be complicit in evil.",
      outcomeText: "WALKED AWAY",
      scores: { deontological: 3, naturalRights: 3, virtueEthics: 3, existentialist: 3, flexibility: -2 },
      implications: [
        { icon: "✨", text: "Refused to profit from innocent suffering", positive: true },
        { icon: "🏚️", text: "Gave up your prosperity and community", positive: false }
      ],
      nextScenario: "sacrifice"
    },
    scene: "omelas",
    consistencyKey: "systemicEvil"
  },

  // ===== SELF-SACRIFICE =====
  "sacrifice": {
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
      ],
      nextScenario: "final"
    },
    choiceB: {
      text: "Sacrifice yourself - be the hero",
      emoji: "🦸",
      result: "You gave your life for five strangers. The ultimate act of selflessness. Supererogatory - beyond what morality demands, into moral sainthood.",
      outcomeText: "YOU DIED, 5 SAVED",
      scores: { virtueEthics: 3, utilitarian: 2, careEthics: 1, activeHarm: 2, existentialist: 3 },
      implications: [
        { icon: "🌟", text: "Achieved moral heroism through self-sacrifice", positive: true },
        { icon: "💀", text: "You died - some say this is never required", positive: false }
      ],
      nextScenario: "final"
    },
    scene: "sacrifice",
    consistencyKey: "selfSacrifice"
  },

  // ===== THE FINAL TEST =====
  "final": {
    id: "final",
    category: "THE ULTIMATE TEST",
    title: "THE CONVERGENCE",
    description: "Your grandmother is on one track. On the other: a cure for cancer carried by a convicted murderer - he's the only one who knows the formula. Saving the cure saves millions. You cannot save both.",
    stakes: 100,
    choiceA: {
      text: "Save your grandmother",
      emoji: "👵",
      result: "You chose love over logic, family over humanity. The cure was lost forever. Millions will die, but your grandmother will be at your wedding.",
      outcomeText: "GRANDMA SAVED",
      scores: { careEthics: 5, impartiality: -5, consequentialism: -3, existentialist: 3 },
      implications: [
        { icon: "💕", text: "Love and loyalty trumped cold calculation", positive: true },
        { icon: "🌍", text: "Millions will die from cancer because of you", positive: false }
      ],
      nextScenario: null
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
      ],
      nextScenario: null
    },
    scene: "final",
    consistencyKey: "ultimateChoice"
  }
};

// Build scenario sequence dynamically based on choices
let scenarioSequence = [];
let currentScenarioId = "classic";

function buildInitialSequence() {
  scenarioSequence = ["classic"];
  currentScenarioId = "classic";
}

// ===== MODE SELECTION =====
function selectMode(mode) {
  gameMode = mode;
  playSound('select');

  // Update button states
  document.getElementById('mode-normal').classList.toggle('active', mode === 'normal');
  document.getElementById('mode-hard').classList.toggle('active', mode === 'hard');
}

// ===== TIMER FUNCTIONS =====
function startTimer() {
  if (gameMode !== 'hard') return;

  clearTimer();
  timeRemaining = TIMER_DURATION;
  timerExpired = false;

  const timerContainer = document.getElementById('timer-container');
  const timerFill = document.getElementById('timer-fill');
  const timerSeconds = document.getElementById('timer-seconds');

  timerContainer.classList.remove('hidden', 'urgent');
  timerFill.style.width = '100%';
  timerSeconds.textContent = timeRemaining;

  timerInterval = setInterval(() => {
    timeRemaining--;

    const percent = (timeRemaining / TIMER_DURATION) * 100;
    timerFill.style.width = percent + '%';
    timerSeconds.textContent = timeRemaining;

    // Add urgency at 5 seconds
    if (timeRemaining <= 5) {
      timerContainer.classList.add('urgent');
      playSound('warning');
    }

    // Time's up - auto-select choice A (do nothing / let trolley continue)
    if (timeRemaining <= 0) {
      clearTimer();
      timerExpired = true;
      timeoutChoices++;

      // Flash the timer
      timerSeconds.textContent = "TIME!";

      // Auto-select choice A after a brief delay
      setTimeout(() => {
        if (!isAnimating) {
          makeChoice('A');
        }
      }, 500);
    }
  }, 1000);
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const timerContainer = document.getElementById('timer-container');
  if (timerContainer) {
    timerContainer.classList.add('hidden');
    timerContainer.classList.remove('urgent');
  }
}

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
      case 'branch': osc.type = 'sine'; osc.frequency.value = 300; osc.start(); osc.frequency.setValueAtTime(450, audioCtx.currentTime + 0.1); osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2); osc.stop(audioCtx.currentTime + 0.3); break;
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
  breakingPoints = {};
  timeoutChoices = 0;
  timerExpired = false;
  scores = {
    utilitarian: 0, deontological: 0, virtueEthics: 0, careEthics: 0,
    contractarian: 0, naturalRights: 0, existentialist: 0, pragmatist: 0,
    activeHarm: 0, impartiality: 0, consequentialism: 0, flexibility: 0
  };
  buildInitialSequence();
  hideAllScreens();
  document.getElementById('game-play').classList.remove('hidden');
  loadScenario();
}

function hideAllScreens() {
  ['title-screen', 'game-play', 'result-screen', 'summary-screen'].forEach(id =>
    document.getElementById(id).classList.add('hidden'));
}

function loadScenario() {
  const scenario = scenarioTree[currentScenarioId];
  if (!scenario) {
    showSummary();
    return;
  }

  trolleyX = 30;
  isAnimating = false;

  document.getElementById('scenario-num').textContent = currentScenario + 1;
  document.getElementById('consistency-score').textContent = Math.max(0, 100 - (inconsistencies * 15));
  document.getElementById('scenario-category').textContent = scenario.category;
  document.getElementById('scenario-title').textContent = scenario.title;

  // Show branch indicator for escalation scenarios
  const branchIndicator = document.getElementById('branch-indicator');
  if (branchIndicator) {
    if (scenario.id.includes('escalate')) {
      branchIndicator.classList.remove('hidden');
      branchIndicator.textContent = '🔀 BRANCHING PATH';
    } else {
      branchIndicator.classList.add('hidden');
    }
  }

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

  // Start timer for hard mode
  startTimer();
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
  clearTimer(); // Stop the timer when choice is made
  playSound('confirm');

  const scenario = scenarioTree[currentScenarioId];
  const result = choice === 'A' ? scenario.choiceA : scenario.choiceB;

  // Check for consistency breaking (escalation scenarios)
  let isInconsistent = false;
  if (result.breaksConsistency) {
    isInconsistent = true;
    inconsistencies++;
    breakingPoints[result.breaksConsistency] = {
      scenario: scenario.title,
      previousChoice: previousChoices[result.breaksConsistency],
      newChoice: choice
    };
    playSound('branch');
  }

  previousChoices[scenario.consistencyKey] = choice;
  choices.push({
    scenarioId: scenario.id,
    choice,
    isInconsistent,
    title: scenario.title
  });

  // Apply scores
  Object.keys(result.scores).forEach(key => {
    scores[key] = (scores[key] || 0) + result.scores[key];
  });

  // Animate UI
  const choiceA = document.getElementById('choice-a');
  const choiceB = document.getElementById('choice-b');
  choiceA.disabled = true;
  choiceB.disabled = true;

  if (choice === 'A') {
    choiceA.classList.add('selected');
    choiceB.classList.add('not-selected');
  } else {
    choiceB.classList.add('selected');
    choiceA.classList.add('not-selected');
  }

  // Set next scenario based on branch
  if (result.nextScenario) {
    currentScenarioId = result.nextScenario;
  } else {
    currentScenarioId = null;
  }

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
      setTimeout(() => {
        flash.classList.remove('flash');
        document.getElementById('scene-container').classList.remove('shake');
      }, 400);
    }

    if (frame === 80) {
      outcomeText.textContent = result.outcomeText;
      outcomeText.classList.add('show');
    }

    if (frame < totalFrames) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        outcomeText.classList.remove('show');
        showResult(result, isInconsistent);
      }, 600);
    }
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
  if (['hospital', 'promise', 'door', 'interrogation', 'omelas'].includes(sceneType)) {
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

  const hitFrame = 70;

  if (['classic', 'bridge', 'agedecision', 'justice'].includes(sceneType)) {
    const count = sceneType === 'agedecision' ? 3 : (sceneType === 'justice' ? 2 : 5);
    for (let i = 0; i < count; i++) {
      const px = w * 0.55 + i * 20, py = h - 65;
      if (choice === 'A' && frame > hitFrame) { drawX(ctx, px, py); }
      else { drawPerson(ctx, px, py, sceneType === 'agedecision' ? '#aaa' : '#ffcc00'); }
    }
    const sideColor = sceneType === 'agedecision' ? '#ffcc00' : (sceneType === 'justice' ? '#ff6666' : '#ffcc00');
    const sidePx = w * 0.65, sidePy = h - 95;
    if (choice === 'B' && frame > hitFrame) { drawX(ctx, sidePx, sidePy); }
    else { drawPerson(ctx, sidePx, sidePy, sideColor, sceneType === 'agedecision' ? 0.7 : 1); }
  }

  if (['family', 'final'].includes(sceneType)) {
    const gmPx = w * 0.65, gmPy = h - 95;
    if (choice === 'A' && frame > hitFrame) {
      drawX(ctx, w * 0.55 + 40, h - 65);
    } else {
      for (let i = 0; i < 5; i++) drawPerson(ctx, w * 0.55 + i * 18, h - 65, '#ffcc00');
    }

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
      for (let i = 0; i < 5; i++) {
        drawPerson(ctx, w * 0.6 + i * 15, h - 60 - i * 5, '#66ff66', 0.6);
      }
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

  // Check if this was a timeout
  const wasTimeout = timerExpired;
  timerExpired = false; // Reset for next scenario

  if (wasTimeout) {
    document.getElementById('result-icon').textContent = '⏱️';
    document.getElementById('result-title').textContent = 'TIME EXPIRED';
    document.getElementById('result-text').textContent =
      'You hesitated too long. The trolley continued on its path. ' + result.result;
  } else {
    document.getElementById('result-icon').textContent =
      result.outcomeText.includes('SAVED') ? '⚡' : '🚫';
    document.getElementById('result-title').textContent = result.outcomeText;
    document.getElementById('result-text').textContent = result.result;
  }

  const implList = document.getElementById('implications-list');
  implList.innerHTML = '';

  // Add timeout implication if applicable
  if (wasTimeout) {
    const timeoutDiv = document.createElement('div');
    timeoutDiv.className = 'implication-item';
    timeoutDiv.innerHTML = `<span class="implication-icon">⏱️</span>` +
      `<span class="implication-text implication-negative">Inaction through indecision - the trolley waits for no one</span>`;
    implList.appendChild(timeoutDiv);
  }

  result.implications.forEach(imp => {
    const div = document.createElement('div');
    div.className = 'implication-item';
    div.innerHTML = `<span class="implication-icon">${imp.icon}</span>` +
      `<span class="implication-text ${imp.positive ? 'implication-positive' : 'implication-negative'}">${imp.text}</span>`;
    implList.appendChild(div);
  });

  const alert = document.getElementById('consistency-alert');
  if (isInconsistent) {
    alert.classList.remove('hidden');
    alert.querySelector('.alert-text').textContent =
      'This choice contradicts your earlier decision - your principles shifted!';
    playSound('warning');
  } else {
    alert.classList.add('hidden');
  }

  isAnimating = false;
}

function nextScenario() {
  playSound('select');
  currentScenario++;

  if (!currentScenarioId) {
    showSummary();
  } else {
    hideAllScreens();
    document.getElementById('game-play').classList.remove('hidden');
    loadScenario();
  }
}

// ===== FINAL SUMMARY =====
function showSummary() {
  hideAllScreens();
  clearTimer(); // Clear any running timer
  document.getElementById('summary-screen').classList.remove('hidden');

  const maxScore = choices.length * 3;
  const pcts = {
    util: Math.min(100, Math.max(0, (scores.utilitarian / maxScore) * 100 + 50)),
    deont: Math.min(100, Math.max(0, (scores.deontological / maxScore) * 100 + 50)),
    virtue: Math.min(100, Math.max(0, (scores.virtueEthics / maxScore) * 100 + 50)),
    care: Math.min(100, Math.max(0, (scores.careEthics / maxScore) * 100 + 50)),
    contract: Math.min(100, Math.max(0, (scores.contractarian / maxScore) * 100 + 50)),
    rights: Math.min(100, Math.max(0, (scores.naturalRights / maxScore) * 100 + 50)),
    exist: Math.min(100, Math.max(0, (scores.existentialist / maxScore) * 100 + 50)),
    pragma: Math.min(100, Math.max(0, (scores.pragmatist / maxScore) * 100 + 50))
  };

  // Find primary philosophy
  const philScores = [
    { key: 'utilitarian', name: 'UTILITARIAN', score: pcts.util },
    { key: 'deontological', name: 'DEONTOLOGIST', score: pcts.deont },
    { key: 'virtueEthics', name: 'VIRTUE ETHICIST', score: pcts.virtue },
    { key: 'careEthics', name: 'CARE ETHICIST', score: pcts.care },
    { key: 'contractarian', name: 'CONTRACTARIAN', score: pcts.contract },
    { key: 'naturalRights', name: 'RIGHTS THEORIST', score: pcts.rights },
    { key: 'existentialist', name: 'EXISTENTIALIST', score: pcts.exist },
    { key: 'pragmatist', name: 'PRAGMATIST', score: pcts.pragma }
  ];

  philScores.sort((a, b) => b.score - a.score);
  const primary = philScores[0];
  const primaryInfo = philosophyInfo[primary.key];

  document.getElementById('primary-type').textContent = primary.name;
  document.getElementById('primary-description').textContent = primaryInfo.fullDesc;

  // Set bar widths
  setTimeout(() => {
    document.getElementById('bar-util').style.width = pcts.util + '%';
    document.getElementById('bar-deont').style.width = pcts.deont + '%';
    document.getElementById('bar-virtue').style.width = pcts.virtue + '%';
    document.getElementById('bar-care').style.width = pcts.care + '%';
    document.getElementById('bar-contract').style.width = pcts.contract + '%';
    document.getElementById('bar-rights').style.width = pcts.rights + '%';
    document.getElementById('bar-exist').style.width = pcts.exist + '%';
    document.getElementById('bar-pragma').style.width = pcts.pragma + '%';
  }, 100);

  document.getElementById('pct-util').textContent = Math.round(pcts.util) + '%';
  document.getElementById('pct-deont').textContent = Math.round(pcts.deont) + '%';
  document.getElementById('pct-virtue').textContent = Math.round(pcts.virtue) + '%';
  document.getElementById('pct-care').textContent = Math.round(pcts.care) + '%';
  document.getElementById('pct-contract').textContent = Math.round(pcts.contract) + '%';
  document.getElementById('pct-rights').textContent = Math.round(pcts.rights) + '%';
  document.getElementById('pct-exist').textContent = Math.round(pcts.exist) + '%';
  document.getElementById('pct-pragma').textContent = Math.round(pcts.pragma) + '%';

  // Trait markers
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

  // Matching philosophers with links
  const philList = document.getElementById('philosopher-list');
  philList.innerHTML = '';
  const matchedPhils = philosophers.filter(p => {
    const score = p.school === 'utilitarian' ? pcts.util :
                  p.school === 'deontological' ? pcts.deont :
                  p.school === 'virtueEthics' ? pcts.virtue :
                  p.school === 'careEthics' ? pcts.care :
                  p.school === 'contractarian' ? pcts.contract :
                  p.school === 'naturalRights' ? pcts.rights :
                  p.school === 'existentialist' ? pcts.exist : pcts.pragma;
    return score >= p.threshold;
  });

  matchedPhils.slice(0, 5).forEach(p => {
    const tag = document.createElement('a');
    tag.className = 'philosopher-tag';
    tag.href = p.link;
    tag.target = '_blank';
    tag.rel = 'noopener noreferrer';
    tag.textContent = p.name;
    tag.title = `${p.desc}\nKey work: ${p.work}`;
    philList.appendChild(tag);
  });

  if (matchedPhils.length === 0) {
    const tag = document.createElement('div');
    tag.className = 'philosopher-tag';
    tag.textContent = 'Unique Perspective';
    philList.appendChild(tag);
  }

  // Render learning resources
  renderLearningResources(primary.key);

  // Consistency and breaking points
  const consistency = Math.max(0, 100 - (inconsistencies * 15));
  document.getElementById('final-consistency').textContent = consistency;

  let consistencyText = '';
  if (consistency >= 85) {
    consistencyText = 'Your choices show remarkable internal consistency. You apply your moral principles uniformly across different scenarios.';
  } else if (consistency >= 60) {
    consistencyText = 'Your choices show moderate consistency. Like most people, you sometimes apply different principles in similar situations.';
  } else {
    consistencyText = 'Your choices varied significantly across scenarios. This may reflect moral pluralism or intuitions that resist systematic theory.';
  }
  document.getElementById('consistency-explanation').textContent = consistencyText;

  // Show breaking points if any
  renderBreakingPoints();

  // Show hard mode stats if applicable
  renderHardModeStats();
}

function renderLearningResources(primaryKey) {
  const container = document.getElementById('learning-resources');
  if (!container) return;

  const info = philosophyInfo[primaryKey];

  let html = `
    <div class="resource-header">LEARN MORE ABOUT ${info.name.toUpperCase()}</div>
    <div class="resource-quote">
      <span class="quote-text">"${info.quote.text}"</span>
      <span class="quote-author">— ${info.quote.author}</span>
    </div>
    <div class="resource-principle">
      <span class="principle-label">Key Principle:</span>
      <span class="principle-text">${info.keyPrinciple}</span>
    </div>
    <div class="resource-links">
      <a href="${info.links.stanford}" target="_blank" rel="noopener noreferrer" class="resource-link stanford">
        📚 Stanford Encyclopedia
      </a>
      <a href="${info.links.wikipedia}" target="_blank" rel="noopener noreferrer" class="resource-link wiki">
        📖 Wikipedia
      </a>
      <a href="${info.links.iep}" target="_blank" rel="noopener noreferrer" class="resource-link iep">
        🎓 Internet Encyclopedia
      </a>
    </div>
    <div class="resource-books">
      <span class="books-label">Recommended Reading:</span>
      ${info.books.map(b => `
        <div class="book-item">
          <span class="book-title">${b.title}</span>
          <span class="book-author">${b.author} (${b.year > 0 ? b.year : Math.abs(b.year) + ' BCE'})</span>
        </div>
      `).join('')}
    </div>
    <div class="resource-critiques">
      <span class="critiques-label">Common Critiques:</span>
      ${info.critiques.map(c => `<div class="critique-item">• ${c}</div>`).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function renderBreakingPoints() {
  const container = document.getElementById('breaking-points');
  if (!container) return;

  const points = Object.entries(breakingPoints);
  if (points.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  let html = `<div class="breaking-header">YOUR MORAL BREAKING POINTS</div>`;
  html += `<p class="breaking-intro">These are moments where your principles shifted under pressure:</p>`;

  points.forEach(([key, data]) => {
    html += `
      <div class="breaking-item">
        <span class="breaking-scenario">📍 ${data.scenario}</span>
        <span class="breaking-desc">Your earlier stance shifted when faced with more extreme circumstances.</span>
      </div>
    `;
  });

  html += `<p class="breaking-reflection">Finding your limits isn't weakness—it reveals where abstract principles meet concrete reality.</p>`;
  container.innerHTML = html;
}

function renderHardModeStats() {
  // Get or create hard mode container
  let container = document.getElementById('hardmode-stats');
  if (!container) {
    container = document.createElement('div');
    container.id = 'hardmode-stats';
    // Insert before consistency report
    const consistencyReport = document.getElementById('consistency-report');
    if (consistencyReport) {
      consistencyReport.parentNode.insertBefore(container, consistencyReport);
    }
  }

  if (gameMode !== 'hard') {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.className = 'hardmode-stats';

  const totalScenarios = choices.length;
  const decisionsOnTime = totalScenarios - timeoutChoices;
  const timeoutPercent = totalScenarios > 0 ? Math.round((timeoutChoices / totalScenarios) * 100) : 0;

  let performanceText = '';
  let performanceClass = '';

  if (timeoutChoices === 0) {
    performanceText = 'Perfect under pressure! You made every decision within the time limit.';
    performanceClass = 'performance-excellent';
  } else if (timeoutPercent <= 20) {
    performanceText = 'Strong performance. You handled the pressure well with only a few hesitations.';
    performanceClass = 'performance-good';
  } else if (timeoutPercent <= 50) {
    performanceText = 'The pressure got to you sometimes. Moral decisions under time constraints reveal our instincts.';
    performanceClass = 'performance-ok';
  } else {
    performanceText = 'You froze under pressure frequently. Perhaps some decisions need more time to consider properly.';
    performanceClass = 'performance-poor';
  }

  container.innerHTML = `
    <div class="hardmode-header">⏱️ HARD MODE COMPLETE</div>
    <div class="hardmode-grid">
      <div class="hardmode-stat">
        <span class="hardmode-number">${decisionsOnTime}</span>
        <span class="hardmode-label">Decisions Made</span>
      </div>
      <div class="hardmode-stat">
        <span class="hardmode-number">${timeoutChoices}</span>
        <span class="hardmode-label">Timeouts</span>
      </div>
    </div>
    <p class="hardmode-performance ${performanceClass}">${performanceText}</p>
  `;
}

function restartGame() {
  playSound('confirm');
  hideAllScreens();
  document.getElementById('title-screen').classList.remove('hidden');
}

window.addEventListener('resize', () => {
  if (!document.getElementById('game-play').classList.contains('hidden') && !isAnimating) {
    drawScene(scenarioTree[currentScenarioId]?.scene || 'classic');
  }
});
