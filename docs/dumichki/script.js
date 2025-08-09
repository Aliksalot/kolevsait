
const Rs = 250;
const Rb = 500;
const letterSize = 100;
//375
const letterR = Rs + ((Rb - Rs) / 2);

const letters = ['к', 'о', 'л', 'е', 'в'];

const circleCenter = document.querySelector(".circle-center");

const circleCenterX = circleCenter.getBoundingClientRect().left;
const circleCenterY = circleCenter.getBoundingClientRect().top;

let writingMode = false;
let writtenLetters = [];
let lineDrawStack = [];

const lines = [];
let mouseFollowLine = null;

const win = () => {
  document.getElementById('win').style.display = 'block';
}

const writeToScreen = (word) => {
  const screen = document.getElementById('out');
  screen.value = word;
  if(word === 'колев') {
    win();
  }
}

const disableWritingMode = () => {
  writeToScreen(writtenLetters.toString().replaceAll(",",""));
  writingMode = false;
  writtenLetters = [];
  console.log(lines);
  while(lines) {
    lines.pop().destroy();
  }
}

const drawMouseLine = (event) => {

  if(!writingMode) return;
  
  if(letters.length <= writtenLetters.length) {
    mouseFollowLine.destroy();
    return;
  }

  mouseFollowLine && mouseFollowLine.destroy();
  const mouseX = event.clientX, mouseY = event.clientY;
  const letter = lineDrawStack[lineDrawStack.length - 1].getBoundingClientRect();

  mouseFollowLine = new Line(mouseX, mouseY, letter.left + letterSize / 2, letter.top + letterSize / 2);

}

window.addEventListener('mousemove', drawMouseLine);
window.addEventListener('mouseup', disableWritingMode);

const letterClicked = (event) => {
  const letter = event.target.innerHTML;
  if(!writingMode) {
    writingMode = true;
    writtenLetters.push(letter);
    lineDrawStack.push(event.target);
  }
}

const letterHovered = (event) => {
  const letter = event.target.innerHTML;

  if(writingMode && !writtenLetters.includes(letter)) {
    writtenLetters.push(letter);
    lineDrawStack.push(event.target);
    if(lineDrawStack.length >= 2) {
      const l1 = lineDrawStack.pop().getBoundingClientRect();
      const l2 = lineDrawStack.pop().getBoundingClientRect();
      lines.push(new Line(l1.left + letterSize / 2, l1.top + letterSize / 2, l2.left + letterSize / 2, l2.top + letterSize / 2));
    }
    lineDrawStack.push(event.target);
    console.log(writtenLetters);
  }
}

class Line {

  destroy () {
      this.htmlElement.remove();
  }

  constructor (x1, y1, x2, y2) {
    console.log(`Creating line [${x1}, ${y1}]-[${x2}, ${y2}]`);
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
    
    circleCenter.appendChild(letterEl.htmlElement);

    this.letterElements.push(letterEl);
  }

  constructor(letters) {

    this.letterElements = [];

    for(let i = 0; i < letters.length; i ++) { 
      this.drawLetter(letters[i], i, letters.length);
    }

    console.log("done");
    console.log(this.letterElements);
  }

}

const wheel = new Wheel(letters);
