'use strict';
const LEFT_KEYCODE = 37;
const RIGHT_KEYCODE = 39;
const RANGE_VALUE = 550;
const MAX_BOUND_COFFEE = 640;
const STEP_MOVE = 20;
const TIME_GAME = 20; // в секундах
const btnStart = document.querySelector('.game__btn-start');
const btnReset = document.querySelector('.game__btn-reset');
const coffeeList = document.querySelector('.game__coffe-list');
const moose = document.querySelector('.game__moose');
const progress = document.querySelector('.game__proogress');
const counts = document.querySelector('.game__counts span');
const lives = document.querySelector('.game__life span');
const level = document.querySelector('.game__level span');
const modal = document.querySelector('.game__modal');

const game = {
  isPlay: false,
  level: 0,
  lives: 5,
  counts: 0,
  speed: 2.7,

  addCount() {
    this.counts++;
    counts.textContent = this.counts;
  },

  addMiss() {
    this.lives--;
    if (this.lives < 0) {
      gameOver();
    } else {
      lives.textContent = this.lives;
    }
  },

  nextLevel() {
    this.level++;
    level.textContent = this.level;
  },

  speedUp() {
    this.speed -= 0.1;
  }
};

function getRandomValue(min, max) {
  return Math.ceil(Math.random() * (max - min) + min);
}

// Логика создания и отрисовки падающих стаканов
function createCoffee() {
  const coffeeElement = document.createElement('li');
  coffeeElement.innerHTML = `<img src="img/coffee.png" width="50" height="50">`;
  coffeeElement.style.width = `50px`;
  coffeeElement.style.position = `absolute`;
  coffeeElement.style.top = `20px`;

  const leftPosition = getRandomValue(0, MAX_BOUND_COFFEE);
  coffeeElement.style.left = `${leftPosition}px`;

  return coffeeElement;
}


function renderCoffee() {
  const coffee = createCoffee();
  coffeeList.appendChild(coffee);

  const tl = gsap.timeline();

  tl.to(coffee, {y: 445, duration: game.speed, ease: `none`});
  tl.then(()=> {
    if (isCollision(coffee, moose)) {
      tl.to(coffee, {duration: 0.2, ease: `none`, scale: 1.2});
      tl.to(coffee, {duration: 0.3, ease: `none`, scale: 1, opacity: 0, onComplete: game.addCount.bind(game)});
    } else {
      tl.to(coffee, {y: 600, duration: 1, ease: `none`, opacity: 0, onComplete: game.addMiss.bind(game)});
    }
  });
}

// Обнаружение соприкосновения
function isCollision(obj1, obj2) {
  const obj1X1 = Math.round(obj1.getBoundingClientRect().x);
  const obj1X2 = obj1X1 + Math.round(obj1.getBoundingClientRect().width);
  const obj2X1 = Math.round(obj2.getBoundingClientRect().x);
  const obj2X2 = obj2X1 + Math.round(obj2.getBoundingClientRect().width);

  if (obj1X1 > obj2X1 && obj1X1 < obj2X2 || obj1X2 > obj2X1 && obj1X2 < obj2X2) {
    return true;
  } else {
    return false;
  }
}

// Логика передвижения лося
let currentX = STEP_MOVE;

function addMooseMove(evt) {
  if (evt.keyCode === LEFT_KEYCODE) {
    if (currentX > 0) {
      currentX -= STEP_MOVE;
      moose.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
  } else if (evt.keyCode === RIGHT_KEYCODE) {
    if (currentX < RANGE_VALUE) {
      currentX += STEP_MOVE;
      moose.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
  }
}

// Логика таймера
function progressTimer(time) {
  let count = 0;
  const timeMl = Math.round(time * 10);
  const timerId = setInterval(() => {
    if (count > 100 || !game.isPlay) {
      clearInterval(timerId);
      if (game.isPlay) {
        game.nextLevel();
        game.speedUp();
        progressTimer(TIME_GAME);
      }
    } else {
      progress.value = count;
      count++;
    }
  }, timeMl);
}


// Логика отрисовки общего процесса
function renderAllCoffee() {
  const time = getRandomValue(1, 3) * 1000;
  const timerId = setTimeout(() => {
    if (game.isPlay) {
      renderCoffee();
      renderAllCoffee();
    } else {
      clearTimeout(timerId);
    }
  }, time);
}

function onStartPlayGame() {
  document.addEventListener('keydown', addMooseMove);
  game.isPlay = true;
  progressTimer(TIME_GAME);
  btnStart.style.display = `none`;
  btnReset.style.display = `none`;
  renderAllCoffee();
}

// Функция проигрыша
function gameOver() {
  game.isPlay = false;

  while (coffeeList.firstChild) {
    coffeeList.removeChild(coffeeList.firstChild);
  }

  modal.style.display = `flex`;
  btnReset.style.display = `block`;
  document.removeEventListener('keydown', addMooseMove);
}

// Ообработчик новой игры
function onResetClick() {
  modal.style.display = `none`;
  game.level = 0;
  game.lives = 5;
  game.counts = 0;
  game.speed = 2.7;
  level.textContent = game.level;
  lives.textContent = game.lives;
  counts.textContent = game.counts;
  onStartPlayGame();
}


btnStart.addEventListener('click', onStartPlayGame);
btnReset.addEventListener('click', onResetClick);
