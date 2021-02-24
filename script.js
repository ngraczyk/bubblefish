//canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameFrame = 0;
ctx.font = canvas.width / 20 + 'px Georgia';
let gameSpeed = 1;
let gameOver = false;
let enemieCreated = false;

//mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false
};

canvas.addEventListener('mousedown', function(e) {
  mouse.click = true;
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', function(e) {
  mouse.click = false;
});

//player
const playerLeft = new Image();
playerLeft.src = 'fish_swim_left.png';
const playerRight = new Image();
playerRight.src = 'fish_swim_right.png';

class Player {
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height / 2;
    this.radius = 50;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.spriteWidth = 498;
    this.spriteHeight = 327;
  }
  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;

    let theta = Math.atan2(dy, dx);
    this.angle = theta;

    if (gameFrame % 5 == 0) {
      this.frame++;
      if (this.frame >= 12) this.frame = 0;
      if (this.frame == 3 || this.frame == 7 || this.frame == 11) {
        this.frameX = 0;
      } else {
        this.frameX++;
      }
      if (this.frame < 3) this.frameY = 0;
      else if (this.frame < 7) this.frameY = 1;
      else if (this.frame < 11) this.frameY = 2;
      else this.frameY = 0;
    }

    if (mouse.x != this.x) {
      this.x -= dx / 30;
    }

    if (mouse.y != this.y) {
      this.y -= dy / 30;
    }
  }
  draw() {
    //console.log(this.x, this.y);
    if (mouse.click) {
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
    /*ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.fillRect(this.x, this.y, this.radius, 10);*/

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.x >= mouse.x) {
      ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth / 4, this.spriteHeight / 4);
    } else {
      ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth / 4, this.spriteHeight / 4);
    }

    ctx.restore();

  }
}

const player = new Player();

//bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = 'bubble_pop_frame_01.png';

class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100;
    this.radius = 50;
    this.speed = Math.random() * 5 + 1;
    this.distance;
    this.sound = Math.random() <= 0.5 ? 0 : 1;
  }
  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }
  draw() {
    /*ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.stroke();*/
    ctx.drawImage(bubbleImage, this.x - 65, this.y - 65, this.radius * 2.6, this.radius * 2.6);
  }
}

function handleBubbles() {
  if (gameFrame % 50 == 0) {
    bubblesArray.push(new Bubble());
  }

  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();

    if (bubblesArray[i].y < 0 - bubblesArray[i].radius * 2) {
      bubblesArray.splice(i, 1);
      i--;
      continue;
    }

    if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
      sounds[bubblesArray[i].sound].play();
      bubblesArray.splice(i, 1);
      i--;
      score++;
      enemieCreated = false;
    }

  }
}

const sounds = [document.createElement('audio'), document.createElement('audio')];
sounds[1].src = 'Plop.ogg';
sounds[0].src = 'bubbles-single1.wav';

//Repeating backgrounds
const background = new Image();
background.src = 'background1.png';

const BG = {
  x1: 0,
  x2: canvas.width,
  y: 0,
  width: canvas.width,
  height: canvas.height
}

function handleBackground() {
  BG.x1 -= gameSpeed;
  if (BG.x1 < -BG.width) {
    BG.x1 = BG.width;
  }
  BG.x2 -= gameSpeed;
  if (BG.x2 < -BG.width) {
    BG.x2 = BG.width;
  }
  ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
  ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

//enemie
const enemyImage = new Image();
enemyImage.src = 'enemy1.png';

class Enemy {
  constructor() {
    this.x = canvas.width - 200;
    this.y = Math.random() * (canvas.height - 150) + 90;
    this.radius = 60;
    this.speed = Math.random() * 2 + 2;
    this.frame = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 418;
    this.spriteHeight = 397;
  }
  update() {
    this.x -= this.speed;
    if (this.x < 0 - this.radius * 2) {
      this.x = canvas.width + 200;
      this.y = Math.random() * (canvas.height - 150) + 90;
      this.speed = Math.random() * 2 + 2;
    }
    if (gameFrame % 5 == 0) {
      this.frame++;
      if (this.frame >= 12) this.frame = 0;
      if (this.frame == 3 || this.frame == 7 || this.frame == 11) {
        this.frameX = 0;
      } else {
        this.frameX++;
      }
      if (this.frame < 3) this.frameY = 0;
      else if (this.frame < 7) this.frameY = 1;
      else if (this.frame < 11) this.frameY = 2;
      else this.frameY = 0;
    }

    //collision with player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + player.radius) {
      handleGameOver();
    }
  }
  draw() {
    /*ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.Pi * 2);
    ctx.fill();*/
    ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 4, this.spriteHeight / 4);
  }
}

const enemiesArray = [];

function handleEnemies() {

  if (!enemieCreated && score > 0 && score % 5 == 0) {
    enemiesArray.push(new Enemy());
    enemieCreated = true;
  }

  for (let i = 0; i < enemiesArray.length; i++) {
    enemiesArray[i].draw();
    enemiesArray[i].update();
  }
}

function handleGameOver() {
  ctx.fillStyle = 'white';
  ctx.fillText('GAME OVER, you reached score ' + score, canvas.width / 2 - canvas.width / 2.7, canvas.height / 2 - 50);
  gameOver = true;
}

//animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleBackground();
  handleBubbles();
  player.update();
  player.draw();
  handleEnemies();
  ctx.fillStyle = 'black';
  const level = enemiesArray.length + 1;
  ctx.fillText('score: ' + score + ' - level: ' + level, 20, canvas.width / 20);
  gameFrame++;
  if (!gameOver) {
    requestAnimationFrame(animate);
  }
}

animate();

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasPosition = canvas.getBoundingClientRect();
  ctx.font = canvas.width / 20 + 'px Georgia';
  if (gameOver) {
    animate();
  }
})
