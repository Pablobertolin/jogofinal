/* script.js - final pixel retro with W/S controls, detailed buildings, 3 lanes, obstacles between lanes */

const GAME_CONTAINER = document.getElementById('game-container');
const PLAYER_CAR = document.getElementById('player-car');
const SCORE_DISPLAY = document.getElementById('score-display');
const LIVES_DISPLAY = document.getElementById('lives-display');
const GAME_OVER_MESSAGE = document.getElementById('game-over-message');
const FINAL_SCORE_DISPLAY = document.getElementById('final-score');
const bgMusic = document.getElementById('bg-music');
const hitSound = document.getElementById('hit-sound');

const CONTAINER_HEIGHT = 420;
const CAR_HEIGHT = 60;
const OBSTACLE_SIZE = 50;

const ROAD_TOP = Math.round(CONTAINER_HEIGHT * (1 - 0.46));
const LANE_HEIGHT = Math.round((CONTAINER_HEIGHT - ROAD_TOP - 20) / 3);
const LANE_CENTERS = [
  ROAD_TOP + Math.round(LANE_HEIGHT/2),
  ROAD_TOP + LANE_HEIGHT + Math.round(LANE_HEIGHT/2),
  ROAD_TOP + (LANE_HEIGHT*2) + Math.round(LANE_HEIGHT/2)
];

const BETWEEN_POSITIONS = [
  Math.round((LANE_CENTERS[0] + LANE_CENTERS[1]) / 2) - Math.round(OBSTACLE_SIZE/2),
  Math.round((LANE_CENTERS[1] + LANE_CENTERS[2]) / 2) - Math.round(OBSTACLE_SIZE/2),
  Math.round((LANE_CENTERS[0] + LANE_CENTERS[2]) / 2) - Math.round(OBSTACLE_SIZE/2)
];

let score = 0;
let lives = 3;
let gameOver = false;
let gameSpeed = 6;
let car = { x: 56, currentLane: 1 };

function drawLaneSeparators(){
  const wrapper = document.getElementById('lane-separators');
  wrapper.innerHTML = '';
  const sep1Top = LANE_CENTERS[0] + Math.round(LANE_HEIGHT/2);
  const sep2Top = LANE_CENTERS[1] + Math.round(LANE_HEIGHT/2);
  [sep1Top, sep2Top].forEach((top)=>{
    const sep = document.createElement('div');
    sep.className = 'lane-sep';
    sep.style.top = top + 'px';
    const dash = document.createElement('div');
    dash.className = 'dashed';
    sep.appendChild(dash);
    wrapper.appendChild(sep);
  });
}

function selectCar(carImage){
  document.getElementById('menu-container').classList.add('d-none');
  document.getElementById('game-ui').classList.remove('d-none');
  PLAYER_CAR.style.backgroundImage = `url('${carImage}')`;
  try{ bgMusic.volume = 0.35; bgMusic.play(); }catch(e){}
  startGame();
}

function updateCarPosition(){
  car.y = LANE_CENTERS[car.currentLane] - Math.round(CAR_HEIGHT/2);
  PLAYER_CAR.style.top = car.y + 'px';
}

function createObstacle(){
  const idx = Math.floor(Math.random()*BETWEEN_POSITIONS.length);
  const y = BETWEEN_POSITIONS[idx];
  const obstacle = document.createElement('div');
  obstacle.className = 'obstacle';
  obstacle.style.width = OBSTACLE_SIZE + 'px';
  obstacle.style.height = OBSTACLE_SIZE + 'px';
  obstacle.style.top = y + 'px';
  obstacle.style.left = GAME_CONTAINER.offsetWidth + 'px';
  obstacle.dataset.posIndex = idx;
  GAME_CONTAINER.appendChild(obstacle);
  return obstacle;
}

function createWarningForIndex(idx){
  const warning = document.createElement('div');
  warning.className = 'warning';
  const y = BETWEEN_POSITIONS[idx];
  warning.style.top = (y + (OBSTACLE_SIZE/2) - 12) + 'px';
  GAME_CONTAINER.appendChild(warning);
  setTimeout(()=> { if(GAME_CONTAINER.contains(warning)) warning.remove(); }, 900);
}

function gameLoop(){
  if(gameOver) return;
  document.querySelectorAll('.obstacle').forEach(ob => {
    let x = parseFloat(ob.style.left) - gameSpeed;
    ob.style.left = x + 'px';
    const obsRect = ob.getBoundingClientRect();
    const carRect = PLAYER_CAR.getBoundingClientRect();
    if(x + OBSTACLE_SIZE < 0){
      ob.remove();
      score++;
      SCORE_DISPLAY.textContent = 'PONTOS: ' + score;
    
      if (score % 5 === 0 && gameSpeed < 15) {
        gameSpeed += 0.5; 
    }
    } else if(carRect.left < obsRect.right && carRect.right > obsRect.left && carRect.top < obsRect.bottom && carRect.bottom > obsRect.top){
      ob.remove();
      handleCollision();
    }
  });
  requestAnimationFrame(gameLoop);
}

function handleCollision(){
  try{ hitSound.currentTime = 0; hitSound.play(); }catch(e){}
  lives--;
  LIVES_DISPLAY.innerHTML = 'VIDAS: ' + '❤️'.repeat(lives);
  if(lives <= 0) endGame();
}

function endGame(){
  gameOver = true;
  try{ bgMusic.pause(); }catch(e){}
  FINAL_SCORE_DISPLAY.textContent = score;
  GAME_OVER_MESSAGE.classList.remove('d-none');
}

function createMovingLines(){
    const laneCount = 2;      // quantidade de fileiras (2 fileiras)
    const linesPerLane = 18;  // quantidade de linhas por fileira
    const spacing = 100;      // distância horizontal entre as linhas
    const laneOffsetY = 62;   // separação vertical entre as duas fileiras
  
    for(let lane = 0; lane < laneCount; lane++){
      for(let i = 0; i < linesPerLane; i++){
  
        const line = document.createElement('div');
        line.className = 'lane-line';
  
        // posição Y da fileira
        const top = ROAD_TOP + 55 + (lane * laneOffsetY);
        line.style.top = top + 'px';
  
        // posição X crescente
        line.style.left = (i * spacing) + 'px';
  
        line.style.animationDelay = (i * 0.12) + 's'; // efeito contínuo
  
        GAME_CONTAINER.appendChild(line);
      }
    }
  }
  
function startObstacleSpawn(){
  setInterval(()=>{
    if(!gameOver){
      const obs = createObstacle();
      const idx = parseInt(obs.dataset.posIndex);
      createWarningForIndex(idx);
    }
  }, 800);
}

function startGame(){
  drawLaneSeparators();
  updateCarPosition();
  LIVES_DISPLAY.innerHTML = 'VIDAS: ' + '❤️'.repeat(lives);
  SCORE_DISPLAY.textContent = 'PONTOS: 0';
  createMovingLines();
  startObstacleSpawn();
  gameLoop();
}

document.addEventListener('keydown', e=>{
  const key = e.key.toLowerCase();
  if(key === 'w' || e.key === 'ArrowUp'){ if(car.currentLane > 0){ car.currentLane--; updateCarPosition(); } }
  if(key === 's' || e.key === 'ArrowDown'){ if(car.currentLane < 2){ car.currentLane++; updateCarPosition(); } }
});

window.selectCar = selectCar;
window.addEventListener('resize', ()=>{ drawLaneSeparators(); updateCarPosition(); });
