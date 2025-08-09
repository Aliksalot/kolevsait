import levels from './levels.json' with {type: 'json'}

let game;

const Rs = 250;
const Rb = 500;
const letterSize = 100;
//375
const letterR = Rs + ((Rb - Rs) / 2);

const circleCenter = document.querySelector(".circle-center");

const win = () => {
  document.getElementById('win').style.display = 'block';
}

class Line {

  destroy () {
    this.htmlElement.remove();
  }

  constructor (x1, y1, x2, y2) {
    //console.log(`Creating line [${x1}, ${y1}]-[${x2}, ${y2}]`);
    const line = document.createElement('div');
    line.classList.add('line');

    const lineHeight = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    line.style.height = lineHeight;
    line.style.left = Math.min(x1, x2) + (Math.abs(x2 - x1) / 2);
    line.style.top = Math.min(y1, y2) + (Math.abs(y2 - y1) /2) - (lineHeight / 2);
    //line.style.transform = 'translate(-50%, -50%)';

    const deg = -(Math.atan2(x1 - x2, y1 - y2)) * 180 / Math.PI;
    line.style.rotate = `${deg}deg`;
    document.body.appendChild(line);

    this.htmlElement = line;
    
  }
}

const letterClicked = (event) => {
  const letter = event.target.innerHTML;
  const letterId = event.target.id;
  if(!game.writingMode) {
    game.writingMode = true;
    game.writtenLetters.push(letter);
    game.writtenLetterIds.push(letterId);
    game.lineDrawStack.push(event.target);
  }
}

const letterHovered = (event) => {
  const letterId = event.target.id;
  const letter = event.target.innerHTML;

  if(game.writingMode && !game.writtenLetterIds.includes(letterId)) {
    game.writtenLetters.push(letter);
    game.writtenLetterIds.push(letterId);
    game.lineDrawStack.push(event.target);
    if(game.lineDrawStack.length >= 2) {
      const l1 = game.lineDrawStack.pop().getBoundingClientRect();
      const l2 = game.lineDrawStack.pop().getBoundingClientRect();
      game.lines.push(new Line(l1.left + letterSize / 2, l1.top + letterSize / 2, l2.left + letterSize / 2, l2.top + letterSize / 2));
    }
    game.lineDrawStack.push(event.target);
  }
}

const drawMouseLine  = (event) => {

  if(!game.writingMode) return;
  
  if(game.letters && game.letters.length <= game.writtenLetters.length) {
    game.mouseFollowLine.destroy();
    return;
  }

  game.mouseFollowLine && game.mouseFollowLine.destroy();
  const mouseX = event.clientX, mouseY = event.clientY;
  const letter = game.lineDrawStack[game.lineDrawStack.length - 1].getBoundingClientRect();

  game.mouseFollowLine = new Line(mouseX, mouseY, letter.left + letterSize / 2, letter.top + letterSize / 2);
}

const disableWritingMode = () => {
  game.currentLevel.words.tryWord(game.writtenLetters.toString().replaceAll(",",""));
  console.log(game.writtenLetters.toString().replaceAll(",",""));
  game.writingMode = false;
  game.writtenLetters = [];
  game.writtenLetterIds = [];
  while(game.lines.length > 0) {
    const line = game.lines.pop();
    if(line){
      line.destroy();
    }
  }
  if(game.mouseFollowLine) {
    game.mouseFollowLine.destroy();
  }
}

class Letter {

  constructor (letter) {

    const el = document.createElement("div");

    el.style.width = letterSize;
    el.style.height = letterSize;
    el.innerHTML = letter;
    el.classList.add("letter");

    el.addEventListener("mouseover", letterHovered);
    el.addEventListener("mousedown", letterClicked);

    this.htmlElement = el;
  }

}

class Wheel {

  drawLetter(letter, index, letterCnt) {
    const deg = (2 * Math.PI / letterCnt) * index;

    const top = Math.sin(deg) * letterR / 2;
    const left = Math.cos(deg) * letterR / 2;

    const letterEl = new Letter(letter);

    letterEl.htmlElement.style.top = top;
    letterEl.htmlElement.style.left = left;
    letterEl.htmlElement.id = Math.floor(Math.random() * 10000);
    
    circleCenter.appendChild(letterEl.htmlElement);

    this.letterElements.push(letterEl);
  }

  constructor(letters) {

    circleCenter.innerHTML = '';
    this.letterElements = [];

    for(let i = 0; i < letters.length; i ++) { 
      this.drawLetter(letters[i], i, letters.length);
    }

    console.log(this.letterElements);
  }

}

const createWordField = (wordLength, wordId, word) => {
  const field = document.createElement('input');
  field.classList.add('out');
  field.style.minWidth = 60 * wordLength
  field.disabled = true;
  field.placeholder = Array.from({length: wordLength}).fill("_ ").toString().replaceAll(",","");
  field.id = `word-${wordId}`;
  if(word){
    field.value = word;
  }
  return field;
}

class Words {

  constructor(wordList, words) { 
    if(words){
      console.log("There are words", words);
      this.wordList = wordList;
      this.wordsContainer = document.getElementById('words');
      this.wordsContainer.innerHTML = '';
      this.completedWords = words.completedWords;
      for(const word of wordList) {
        if(words.completedWords.includes(wordList.indexOf(word))){
          this.wordsContainer.appendChild(createWordField(word.length, wordList.indexOf(word), word));
        }else{
          this.wordsContainer.appendChild(createWordField(word.length, wordList.indexOf(word)));
        }
      }
      return;
    }

    this.wordList = wordList;
    console.log(wordList);
    this.wordsContainer = document.getElementById('words');
    this.wordsContainer.innerHTML = '';
    this.completedWords = [];
    for(const word of wordList) {
      this.wordsContainer.appendChild(createWordField(word.length, wordList.indexOf(word)));
    }
  }

  checkLevelCompletion() {
    if(this.completedWords.length >= this.wordList.length){
      game.currentLevel.complete();
    }
    game.saveToLocal();
  }
  
  tryWord(word) {

    const wordIndex = this.wordList.indexOf(word);
    console.log("trying", word, "index:", wordIndex);
    if(wordIndex >= 0) {
      const field = document.getElementById(`word-${wordIndex}`);
      field.value = word;
      this.completedWords.push(wordIndex);
      this.checkLevelCompletion();
    }

  }
}

class Level {

  complete() {
    game.nextLevel();
  }

  constructor(index, level) {
    if(level) {
      this.wheel = new Wheel(levels[index].letters, level.wheel);
      this.words = new Words(levels[index].words, level.words);
    }else {
      this.wheel = new Wheel(levels[index].letters);
      this.words = new Words(levels[index].words);
    }
  }

}

class Game {

  constructor(levels, currentLevelNumber) {
    this.levels = levels;
    this.currentLevel = new Level(currentLevelNumber);
    this.currentLevelNumber = currentLevelNumber;
    this.writingMode = false;
    this.lineDrawStack = [];
    this.writtenLetters = [];
    this.writtenLetterIds = [];
    this.lines = [];
    this.mouseFollowLine = null;
  }

  loadFromLocal() {
    const stateFromLocal = localStorage.getItem('gamestate');
    if(!stateFromLocal) return;
    console.log("Loading from local...");

    const game = JSON.parse(stateFromLocal);

    this.levels = game.levels;
    this.currentLevel = new Level(game.currentLevelNumber, game.currentLevel);
    this.currentLevelNumber = game.currentLevelNumber
    this.writingMode = false;
    this.lineDrawStack = [];
    this.writtenLetters = [];
    this.writtenLetterIds = [];
    this.lines = [];
    this.mouseFollowLine = null;
  }

  saveToLocal() {
    localStorage.setItem('gamestate', JSON.stringify(this))
  }

  nextLevel() {
    this.currentLevelNumber += 1;
    this.currentLevel = new Level(this.currentLevelNumber);
  }
}

game = new Game(levels, 0);
game.loadFromLocal();

window.addEventListener('mousemove', drawMouseLine);
window.addEventListener('mouseup', disableWritingMode);

