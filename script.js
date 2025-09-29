let count = 0;
let clickPower = 1;
let cps = 0;
let upgradeUsage = {};
let spacePressed = false;
let nickname = localStorage.getItem('nickname') || "";

const counter = document.getElementById('counter');
const spacebarBtn = document.getElementById('spacebarBtn');
const clickSound = new Audio('click.mp3');
const cpsDisplay = document.getElementById('cpsDisplay');
const rightColumn = document.querySelector('.column.right');
const nicknameSetup = document.getElementById('nicknameSetup');
const nicknameInput = document.getElementById('nicknameInput');
const mainMenu = document.getElementById('mainMenu');
const ownerMenu = document.getElementById('ownerMenu');
const leaderboard = document.getElementById('leaderboard');

// Nickname setup
function saveNickname() {
  nickname = nicknameInput.value.trim();
  if (nickname.length > 0) {
    localStorage.setItem('nickname', nickname);
    nicknameSetup.style.display = 'none';
    document.querySelector('.container').style.display = 'flex';
  }
}

if (!nickname) {
  nicknameSetup.style.display = 'block';
  document.querySelector('.container').style.display = 'none';
} else {
  nicknameSetup.style.display = 'none';
  document.querySelector('.container').style.display = 'flex';
}

// Owner menu unlock
if (localStorage.getItem('isOwner') === 'true') {
  ownerMenu.style.display = 'block';
}
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.code === 'KeyO') {
    localStorage.setItem('isOwner', 'true');
    ownerMenu.style.display = 'block';
    alert("Owner mode activated!");
  }
});

// Owner menu actions
function resetProgress() {
  localStorage.clear();
  location.reload();
}
function addSpaces() {
  count += 1000000;
  counter.textContent = count;
}

// Save/load system
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem('clickerSave'));
  if (saved) {
    count = saved.count || 0;
    clickPower = saved.clickPower || 1;
    cps = saved.cps || 0;
    upgradeUsage = saved.upgradeUsage || {};
    counter.textContent = count;
    updateCPSDisplay();
    updateUpgradeUsage();
  }
};

setInterval(() => {
  localStorage.setItem('clickerSave', JSON.stringify({
    count,
    clickPower,
    cps,
    upgradeUsage
  }));
}, 1000);

// Manual click
function handleClick() {
  count += clickPower;
  counter.textContent = count;
  triggerClickEffect();
}

// Click effect + sound
function triggerClickEffect() {
  spacebarBtn.classList.add('clicked');
  clickSound.currentTime = 0;
  clickSound.play();
  setTimeout(() => {
    spacebarBtn.classList.remove('clicked');
  }, 100);
}

// Spacebar press (anti-hold)
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !spacePressed) {
    spacePressed = true;
    handleClick();
  }
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') spacePressed = false;
});

// Button click
spacebarBtn.addEventListener('click', handleClick);

// Auto clicker loop
setInterval(() => {
  count += cps;
  counter.textContent = count;
}, 1000);

// CPS display
function updateCPSDisplay() {
  cpsDisplay.textContent = `Clicks per second: ${cps}`;
}

// Massive upgrade list
const upgradeData = [];
for (let i = 1; i <= 100; i++) {
  const type = i % 3 === 0 ? 'CPS' : 'Click';
  const power = i % 10 === 0 ? 2 : 1;
  const cost = Math.floor(100 * Math.pow(1.25, i));
  const name = type === 'Click'
    ? `+${power * i} per click`
    : `+${power * i} CPS`;

  upgradeData.push({
    name,
    cost,
    effect: () => {
      if (type === 'Click') clickPower += power * i;
      else cps += power * i;
    }
  });
}

// Render upgrades
upgradeData.forEach((upgrade, index) => {
  const btn = document.createElement('button');
  btn.className = 'upgrade-btn';
  btn.innerHTML = `
    ${upgrade.name}
    <span class="price">${upgrade.cost}</span>
    <span class="desc">Used: <span id="upgrade-count-${index}">0</span>x</span>
  `;
  rightColumn.appendChild(btn);

  upgradeUsage[index] = upgradeUsage[index] || 0;

  btn.addEventListener('click', () => {
    if (count >= upgrade.cost) {
      count -= upgrade.cost;
      counter.textContent = count;
      upgrade.effect();
      upgradeUsage[index]++;
      document.getElementById(`upgrade-count-${index}`).textContent = upgradeUsage[index];
      updateCPSDisplay();
    }
  });
});

function updateUpgradeUsage() {
  Object.keys(upgradeUsage).forEach(index => {
    const countSpan = document.getElementById(`upgrade-count-${index}`);
    if (countSpan) countSpan.textContent = upgradeUsage[index];
  });
}

// Leaderboard placeholder
function loadLeaderboard() {
  leaderboard.innerHTML = `<h3>🌍 Global Leaderboard</h3><p>${nickname}: ${count} spaces</p>`;
}
setInterval(loadLeaderboard, 5000);
