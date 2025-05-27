// 游戏配置
const gameConfig = {
    levels: [
        // 3×3网格
        { size: 3, digit: 2, numbers: 9, timeLimit: 15 },  // 第1关: 3×3网格，9个连续两位数，15秒时限(原10+5)
        { size: 3, digit: 3, numbers: 9, timeLimit: 17 },  // 第2关: 3×3网格，9个连续三位数，17秒时限(原12+5)
        { size: 3, digit: 4, numbers: 9, timeLimit: 20 },  // 第3关: 3×3网格，9个连续四位数，20秒时限(原15+5)
        
        // 4×4网格
        { size: 4, digit: 2, numbers: 16, timeLimit: 17 }, // 第4关: 4×4网格，16个连续两位数，17秒时限(原12+5)
        { size: 4, digit: 3, numbers: 16, timeLimit: 20 }, // 第5关: 4×4网格，16个连续三位数，20秒时限(原15+5)
        { size: 4, digit: 4, numbers: 16, timeLimit: 25 }, // 第6关: 4×4网格，16个连续四位数，25秒时限(原20+5)
        
        // 5×5网格
        { size: 5, digit: 2, numbers: 25, timeLimit: 25 }, // 第7关: 5×5网格，25个连续两位数，25秒时限(原15+10)
        { size: 5, digit: 3, numbers: 25, timeLimit: 35 }, // 第8关: 5×5网格，25个连续三位数，35秒时限(原20+15)
        { size: 5, digit: 4, numbers: 25, timeLimit: 40 }  // 第9关: 5×5网格，25个连续四位数，40秒时限(原25+15)
    ]
};


// 游戏状态
let gameState = {
    currentLevel: 0,
    targetNumbers: [],
    clickedNumbers: [],
    currentNumber: 1,
    timer: null,
    timeLeft: 0,
    gameStarted: false,
    gameOver: false
};

// DOM元素
const elements = {
    grid: document.getElementById('grid'),
    message: document.getElementById('message'),
    timeDisplay: document.getElementById('time'),
    currentLevelDisplay: document.getElementById('current-level'),
    nextLevelBtn: document.getElementById('next-level-btn')
};

// 初始化游戏
function initGame() {
    gameState.currentLevel = 0;
    loadLevel(gameState.currentLevel);
}

// 加载关卡
function loadLevel(levelIndex) {
    // 重置游戏状态
    gameState.targetNumbers = [];
    gameState.clickedNumbers = [];
    gameState.currentNumber = 1;
    gameState.gameStarted = false;
    gameState.gameOver = false;
    
    // 更新UI
    elements.currentLevelDisplay.textContent = levelIndex + 1;
    elements.message.textContent = '';
    elements.message.className = 'message';
    elements.nextLevelBtn.style.display = 'none';
    
    // 获取当前关卡配置
    const levelConfig = gameConfig.levels[levelIndex];
    gameState.timeLeft = levelConfig.timeLimit;
    elements.timeDisplay.textContent = gameState.timeLeft;
    
    // 创建网格
    createGrid(levelConfig.size);
    
    // 生成连续数字序列
    generateSequentialNumbers(levelConfig.numbers, levelConfig.digit);
    
    // 显示开始信息
    elements.message.textContent = `点击数字${gameState.targetNumbers[0]}开始游戏！`;
    
    // 设置点击事件
    setupCellClickHandlers();
}

// 创建网格
function createGrid(size) {
    elements.grid.innerHTML = '';
    elements.grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        elements.grid.appendChild(cell);
    }
}

// 生成连续数字序列
function generateSequentialNumbers(count, digit) {
    // 计算最小和最大值
    const min = Math.pow(10, digit - 1);
    const max = Math.pow(10, digit) - 1 - count + 1;
    
    // 确保有足够的连续数字空间
    if (min > max) {
        console.error(`无法生成${count}个${digit}位连续数字`);
        return;
    }
    
    // 随机选择起始数字
    const start = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // 生成连续数字序列
    gameState.targetNumbers = [];
    for (let i = 0; i < count; i++) {
        gameState.targetNumbers.push(start + i);
    }
    
    // 随机打乱数字在网格中的位置
    const shuffledNumbers = [...gameState.targetNumbers];
    shuffleArray(shuffledNumbers);
    
    // 在网格中显示数字
    const cells = document.querySelectorAll('.cell');
    shuffledNumbers.forEach((num, index) => {
        cells[index].textContent = num;
    });
}

// 打乱数组顺序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 设置单元格点击事件
function setupCellClickHandlers() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.onclick = function() {
            // 如果游戏已结束，不允许点击
            if (gameState.gameOver) {
                return;
            }
            
            const clickedNumber = parseInt(cell.textContent);
            
            if (!gameState.gameStarted && clickedNumber === gameState.targetNumbers[0]) {
                startGame();
                handleCellClick(this);
                return;
            }
            
            if (gameState.gameStarted) {
                handleCellClick(this);
            }
        };
    });
}

// 开始游戏
function startGame() {
    gameState.gameStarted = true;
    startTimer();
}

// 处理单元格点击
function handleCellClick(cell) {
    const clickedNumber = parseInt(cell.textContent);
    const targetNumber = gameState.targetNumbers[gameState.currentNumber - 1];
    
    // 检查是否点击了正确的数字
    if (clickedNumber === targetNumber) {
        cell.classList.add('clicked');
        gameState.clickedNumbers.push(clickedNumber);
        gameState.currentNumber++;
        
        // 检查是否完成当前关卡
        if (gameState.currentNumber > gameState.targetNumbers.length) {
            levelComplete();
        }
    } else {
        // 点击了错误的数字
        cell.style.backgroundColor = '#f44336';
        setTimeout(() => {
            cell.style.backgroundColor = '';
        }, 300);
    }
}

// 关卡完成
function levelComplete() {
    clearInterval(gameState.timer);
    elements.message.textContent = '恭喜！关卡完成！';
    elements.message.className = 'message success';
    
    // 如果是最后一关，显示游戏通关
    if (gameState.currentLevel === gameConfig.levels.length - 1) {
        elements.message.textContent = '恭喜！你已通关所有关卡！';
        elements.nextLevelBtn.style.display = 'none';
    } else {
        // 显示下一关按钮
        elements.nextLevelBtn.style.display = 'block';
        elements.nextLevelBtn.textContent = '进入下一关';
        elements.nextLevelBtn.onclick = function() {
            gameState.currentLevel++;
            loadLevel(gameState.currentLevel);
        };
    }
}

// 开始计时器
function startTimer() {
    clearInterval(gameState.timer);
    gameState.timeLeft = gameConfig.levels[gameState.currentLevel].timeLimit;
    elements.timeDisplay.textContent = gameState.timeLeft;
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        elements.timeDisplay.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeUp();
        }
    }, 1000);
}

// 时间到
function timeUp() {
    // 设置游戏结束状态
    gameState.gameOver = true;
    
    elements.message.textContent = '时间到！游戏结束！';
    elements.message.className = 'message fail';
    
    // 禁用所有单元格点击
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none';
        cell.style.opacity = '0.5';
    });
    
    // 显示重新开始按钮
    elements.nextLevelBtn.style.display = 'block';
    elements.nextLevelBtn.textContent = '重新开始';
    elements.nextLevelBtn.onclick = function() {
        // 恢复单元格点击
        cells.forEach(cell => {
            cell.style.pointerEvents = '';
            cell.style.opacity = '';
        });
        loadLevel(gameState.currentLevel);
    };
}

// 初始化游戏
initGame();