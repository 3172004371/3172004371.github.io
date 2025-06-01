// 汉诺塔算法可视化
const diskCount = document.getElementById('disk-count');
const decreaseDisks = document.getElementById('decrease-disks');
const increaseDisks = document.getElementById('increase-disks');
const animationSpeed = document.getElementById('animation-speed');
const startAnimation = document.getElementById('start-animation');
const resetAnimation = document.getElementById('reset-animation');
const hanoiTower = document.getElementById('hanoi-tower');
const currentSteps = document.getElementById('current-steps');
const optimalSteps = document.getElementById('optimal-steps');
const stepsProgress = document.getElementById('steps-progress');
const hanoiLog = document.getElementById('hanoi-log');

let towerDisks = [];
let currentStep = 0;
let isAnimating = false;
let animationQueue = [];

// 初始化汉诺塔
function initHanoiTower() {
    const count = parseInt(diskCount.value);
    optimalSteps.textContent = Math.pow(2, count) - 1;

    hanoiTower.innerHTML = '';
    // 添加底座
    const base = document.createElement('div');
    base.className = 'absolute bottom-0 left-0 w-full h-4 bg-gray-300';
    hanoiTower.appendChild(base);

    // 添加三根柱子
    for (let i = 0; i < 3; i++) {
        const pole = document.createElement('div');
        pole.className = `absolute bottom-4 left-${(i + 1) * 100 / 4}% w-4 h-60 bg-gray-400 rounded-t-md -translate-x-1/2`;
        pole.dataset.pole = i;
        hanoiTower.appendChild(pole);
    }

    // 添加盘子
    towerDisks = [];
    for (let i = 0; i < count; i++) {
        const disk = document.createElement('div');
        const width = 120 - i * 20;
        const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500'];
        const color = colors[i % colors.length];

        disk.className = `hanoi-disk absolute bottom-${8 + i * 8} left-1/4 h-6 ${color} rounded-full -translate-x-1/2`;
        disk.style.width = `${width}px`;
        disk.style.zIndex = count - i;
        disk.dataset.size = i;
        disk.dataset.pole = 0;
        disk.dataset.position = i;

        hanoiTower.appendChild(disk);
        towerDisks.push(disk);
    }

    resetAnimationState();
}

// 重置动画状态
function resetAnimationState() {
    currentStep = 0;
    currentSteps.textContent = currentStep;
    stepsProgress.style.width = '0%';
    hanoiLog.innerHTML = '<p class="text-gray-500">等待演示开始...</p>';
    animationQueue = [];
    isAnimating = false;
}

// 生成汉诺塔移动步骤
function generateHanoiSteps(n, source, auxiliary, target) {
    if (n === 1) {
        animationQueue.push({from: source, to: target, disk: n - 1});
        return;
    }

    generateHanoiSteps(n - 1, source, target, auxiliary);
    animationQueue.push({from: source, to: target, disk: n - 1});
    generateHanoiSteps(n - 1, auxiliary, source, target);
}

// 执行动画步骤
async function executeAnimationSteps() {
    if (isAnimating || animationQueue.length === 0) return;

    isAnimating = true;
    startAnimation.disabled = true;
    resetAnimation.disabled = true;

    const speed = 1100 - animationSpeed.value; // 反转速度值，使滑块右侧表示更快

    for (const step of animationQueue) {
        if (!isAnimating) break;

        await moveDisk(step.disk, step.from, step.to, speed);

        currentStep++;
        currentSteps.textContent = currentStep;
        const progress = (currentStep / animationQueue.length) * 100;
        stepsProgress.style.width = `${progress}%`;

        const logEntry = document.createElement('p');
        logEntry.className = 'mb-1';
        logEntry.textContent = `步骤 ${currentStep}: 移动盘子 ${step.disk + 1} 从柱子 ${step.from + 1} 到柱子 ${step.to + 1}`;
        hanoiLog.appendChild(logEntry);
        hanoiLog.scrollTop = hanoiLog.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 100)); // 步骤间的小延迟
    }

    isAnimating = false;
    startAnimation.disabled = false;
    resetAnimation.disabled = false;
}

// 移动盘子动画
function moveDisk(diskIndex, fromPole, toPole, speed) {
    return new Promise(resolve => {
        const disk = towerDisks[diskIndex];
        const fromPoleEl = hanoiTower.querySelector(`[data-pole="${fromPole}"]`);
        const toPoleEl = hanoiTower.querySelector(`[data-pole="${toPole}"]`);

        // 获取目标柱子上的盘子数量
        const toPoleDisks = Array.from(hanoiTower.querySelectorAll(`[data-pole="${toPole}"]`)).length;

        // 计算目标位置
        const targetTop = 8 + toPoleDisks * 8;
        const targetLeft = (toPole + 1) * 100 / 4;

        // 动画过程：上升 -> 水平移动 -> 下降
        const animationDuration = speed / 3;

        // 上升
        disk.animate(
            [
                {bottom: `${parseInt(disk.style.bottom || 8)}px`, left: '25%'},
                {bottom: '70%', left: '25%'}
            ],
            {
                duration: animationDuration,
                easing: 'ease-out'
            }
        );

        setTimeout(() => {
            // 水平移动
            disk.animate(
                [
                    {bottom: '70%', left: '25%'},
                    {bottom: '70%', left: `${targetLeft}%`}
                ],
                {
                    duration: animationDuration,
                    easing: 'ease-in-out'
                }
            );

            setTimeout(() => {
                // 下降
                disk.animate(
                    [
                        {bottom: '70%', left: `${targetLeft}%`},
                        {bottom: `${targetTop}px`, left: `${targetLeft}%`}
                    ],
                    {
                        duration: animationDuration,
                        easing: 'ease-in'
                    }
                );

                // 更新盘子数据
                setTimeout(() => {
                    disk.dataset.pole = toPole;
                    disk.dataset.position = toPoleDisks;
                    resolve();
                }, animationDuration);
            }, animationDuration);
        }, animationDuration);
    });
}

// 事件监听器
decreaseDisks.addEventListener('click', () => {
    if (parseInt(diskCount.value) > 3) {
        diskCount.value = parseInt(diskCount.value) - 1;
        initHanoiTower();
    }
});

increaseDisks.addEventListener('click', () => {
    if (parseInt(diskCount.value) < 8) {
        diskCount.value = parseInt(diskCount.value) + 1;
        initHanoiTower();
    }
});

diskCount.addEventListener('change', () => {
    const value = parseInt(diskCount.value);
    if (value < 3) diskCount.value = 3;
    if (value > 8) diskCount.value = 8;
    initHanoiTower();
});

startAnimation.addEventListener('click', () => {
    if (isAnimating) return;

    animationQueue = [];
    generateHanoiSteps(parseInt(diskCount.value), 0, 1, 2);
    executeAnimationSteps();
});

resetAnimation.addEventListener('click', () => {
    if (isAnimating) {
        isAnimating = false;
        animationQueue = [];
    }
    initHanoiTower();
});

// 初始化汉诺塔
initHanoiTower();