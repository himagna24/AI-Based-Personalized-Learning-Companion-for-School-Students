export const SUBJECTS = [
  { id: 'math', label: 'Mathematics', icon: '🔢', color: '#6C63FF' },
  { id: 'physics', label: 'Physics', icon: '⚛️', color: '#FF6584' },
  { id: 'chemistry', label: 'Chemistry', icon: '🧪', color: '#43C59E' },
  { id: 'biology', label: 'Biology', icon: '🧬', color: '#F7B731' },
  { id: 'cs', label: 'Computer Science', icon: '💻', color: '#4FC3F7' },
  { id: 'english', label: 'English', icon: '📖', color: '#FF8C42' },
  { id: 'history', label: 'History', icon: '🏛️', color: '#A29BFE' },
  { id: 'geography', label: 'Geography', icon: '🌍', color: '#55EFC4' },
];

export const ASSESSMENT_QUESTIONS = [
  // Basic (3)
  {
    id: 1,
    level: 'basic',
    question: 'What is 15 × 8?',
    options: ['100', '120', '115', '130'],
    correct: 1,
    subject: 'math',
  },
  {
    id: 2,
    level: 'basic',
    question: 'Which planet is closest to the Sun?',
    options: ['Earth', 'Venus', 'Mercury', 'Mars'],
    correct: 2,
    subject: 'physics',
  },
  {
    id: 3,
    level: 'basic',
    question: 'What is the chemical symbol for water?',
    options: ['WO', 'H₂O', 'HO₂', 'W₂O'],
    correct: 1,
    subject: 'chemistry',
  },
  // Intermediate (2)
  {
    id: 4,
    level: 'intermediate',
    question: 'Solve: If 3x + 7 = 22, what is x?',
    options: ['3', '4', '5', '6'],
    correct: 2,
    subject: 'math',
  },
  {
    id: 5,
    level: 'intermediate',
    question: 'Newton\'s second law states F = ?',
    options: ['m + a', 'm / a', 'm × a', 'a / m'],
    correct: 2,
    subject: 'physics',
  },
];

export const DAILY_QUIZ_BANK = {
  math: [
    { question: 'What is the value of π (pi) to 2 decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correct: 1 },
    { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: 2 },
    { question: 'What is 25% of 200?', options: ['25', '40', '50', '75'], correct: 2 },
    { question: 'What is the area of a circle with radius 7? (use π=22/7)', options: ['144', '154', '164', '174'], correct: 1 },
    { question: 'Solve: 2³ × 2² = ?', options: ['16', '32', '64', '128'], correct: 1 },
  ],
  physics: [
    { question: 'What is the speed of light in vacuum?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correct: 0 },
    { question: 'What type of energy does a moving object have?', options: ['Potential', 'Thermal', 'Kinetic', 'Chemical'], correct: 2 },
    { question: 'What is the SI unit of force?', options: ['Watt', 'Joule', 'Newton', 'Pascal'], correct: 2 },
    { question: 'What happens to resistance when temperature increases (for metals)?', options: ['Decreases', 'Increases', 'Stays same', 'Becomes zero'], correct: 1 },
    { question: 'Which law explains why a book stays at rest on a table?', options: ['Newton\'s 1st', 'Newton\'s 2nd', 'Newton\'s 3rd', 'Ohm\'s Law'], correct: 0 },
  ],
  chemistry: [
    { question: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], correct: 1 },
    { question: 'What is the pH of pure water?', options: ['0', '5', '7', '14'], correct: 2 },
    { question: 'Which gas is produced when metals react with acids?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 3 },
    { question: 'What is the chemical formula for table salt?', options: ['NaCl', 'KCl', 'CaCl₂', 'MgCl₂'], correct: 0 },
    { question: 'Which type of bond is formed by sharing electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correct: 1 },
  ],
  biology: [
    { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 2 },
    { question: 'How many chromosomes do humans have?', options: ['23', '46', '48', '44'], correct: 1 },
    { question: 'Which blood group is the universal donor?', options: ['A', 'B', 'AB', 'O'], correct: 3 },
    { question: 'What is the process by which plants make food?', options: ['Respiration', 'Digestion', 'Photosynthesis', 'Transpiration'], correct: 2 },
    { question: 'DNA stands for?', options: ['Deoxyribonucleic Acid', 'Dynamic Nucleic Acid', 'Deoxyribose Nitrogen Acid', 'None'], correct: 0 },
  ],
  cs: [
    { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Control Processing Unit', 'Core Processing Unit'], correct: 0 },
    { question: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Tree'], correct: 1 },
    { question: 'What is the binary representation of decimal 10?', options: ['1010', '1001', '1100', '0110'], correct: 0 },
    { question: 'Which language is known as the "mother of all languages"?', options: ['C++', 'Java', 'C', 'Assembly'], correct: 2 },
    { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Transfer Markup Language', 'None'], correct: 0 },
  ],
  english: [
    { question: 'What is a synonym for "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct: 1 },
    { question: 'Which of the following is a noun?', options: ['Run', 'Beautiful', 'Happiness', 'Quickly'], correct: 2 },
    { question: 'What is the plural of "child"?', options: ['Childs', 'Childes', 'Children', 'Childrens'], correct: 2 },
    { question: 'Which tense is used: "She has eaten"?', options: ['Simple Past', 'Present Perfect', 'Past Perfect', 'Future'], correct: 1 },
    { question: 'What figure of speech is "as brave as a lion"?', options: ['Metaphor', 'Simile', 'Alliteration', 'Hyperbole'], correct: 1 },
  ],
  history: [
    { question: 'When did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2 },
    { question: 'Who was the first President of the USA?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'], correct: 2 },
    { question: 'In which year did India gain independence?', options: ['1945', '1946', '1947', '1948'], correct: 2 },
    { question: 'Who built the Taj Mahal?', options: ['Akbar', 'Shah Jahan', 'Humayun', 'Aurangzeb'], correct: 1 },
    { question: 'The French Revolution began in which year?', options: ['1776', '1789', '1804', '1815'], correct: 1 },
  ],
  geography: [
    { question: 'What is the largest continent?', options: ['Africa', 'Europe', 'Asia', 'Australia'], correct: 2 },
    { question: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1 },
    { question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 },
    { question: 'Which is the smallest country in the world?', options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], correct: 2 },
    { question: 'Mount Everest is located in which mountain range?', options: ['Andes', 'Alps', 'Rockies', 'Himalayas'], correct: 3 },
  ],
};

export const SUBJECT_KEYWORDS = {
  math: ['math', 'algebra', 'geometry', 'calculus', 'equation', 'number', 'arithmetic', 'triangle', 'circle', 'derivative', 'integral', 'matrix', 'vector', 'probability', 'statistics'],
  physics: ['physics', 'force', 'motion', 'velocity', 'acceleration', 'newton', 'gravity', 'energy', 'wave', 'light', 'optics', 'electricity', 'magnetic', 'quantum', 'thermodynamics'],
  chemistry: ['chemistry', 'atom', 'molecule', 'element', 'compound', 'reaction', 'acid', 'base', 'ph', 'bond', 'periodic', 'electron', 'proton', 'neutron', 'organic', 'inorganic'],
  biology: ['biology', 'cell', 'dna', 'rna', 'gene', 'chromosome', 'evolution', 'photosynthesis', 'respiration', 'organism', 'plant', 'animal', 'enzyme', 'protein', 'mitosis'],
  cs: ['computer', 'programming', 'algorithm', 'data structure', 'code', 'software', 'hardware', 'network', 'database', 'internet', 'binary', 'array', 'stack', 'queue', 'python', 'java', 'javascript'],
  english: ['english', 'grammar', 'noun', 'verb', 'adjective', 'tense', 'vocabulary', 'poem', 'essay', 'literature', 'sentence', 'paragraph', 'pronoun', 'preposition', 'synonym', 'antonym'],
  history: ['history', 'war', 'revolution', 'empire', 'dynasty', 'ancient', 'medieval', 'civilization', 'colonial', 'independence', 'treaty', 'king', 'queen', 'battle', 'century'],
  geography: ['geography', 'continent', 'country', 'capital', 'river', 'mountain', 'ocean', 'climate', 'latitude', 'longitude', 'map', 'terrain', 'population', 'desert', 'forest'],
};
