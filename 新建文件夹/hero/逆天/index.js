// 导航栏滚动效果
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-md');
        navbar.classList.remove('shadow-sm');
    } else {
        navbar.classList.remove('shadow-md');
        navbar.classList.add('shadow-sm');
    }
});

// 移动端菜单
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
// 切换菜单状态
function toggleMobileMenu() {
    if (mobileMenu.classList.contains('active')) {
        // 关闭菜单
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
        // 切换按钮图标为菜单图标
        mobileMenuButton.innerHTML = '<i class="fa fa-bars"></i>';
    } else {
        // 打开菜单
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        // 切换按钮图标为关闭图标
        mobileMenuButton.innerHTML = '<i class="fa fa-times"></i>';
    }
}
// 点击菜单按钮切换菜单状态
mobileMenuButton.addEventListener('click', toggleMobileMenu);
// 点击菜单项后关闭菜单
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });

            // 关闭移动端菜单
            mobileMenu.classList.add('hidden');
        }
    });
});

// 回到顶部按钮
const backToTopButton = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.remove('opacity-0', 'invisible');
        backToTopButton.classList.add('opacity-100', 'visible');
    } else {
        backToTopButton.classList.add('opacity-0', 'invisible');
        backToTopButton.classList.remove('opacity-100', 'visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 计算器功能
const calculatorDisplay = document.getElementById('calculator-display');
const calcButtons = document.querySelectorAll('.calc-btn');
let currentNumber = '0';
let firstNumber = null;
let operation = null;
let isNewNumber = false;

calcButtons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent;

        if (/[0-9.]/.test(buttonText)) {
            handleNumber(buttonText);
        } else if (buttonText === 'C') {
            resetCalculator();
        } else if (buttonText === '±') {
            toggleSign();
        } else if (buttonText === '%') {
            calculatePercentage();
        } else if (['+', '-', '×', '÷'].includes(buttonText)) {
            handleOperation(buttonText);
        } else if (buttonText === '=') {
            calculateResult();
        }
    });
});

function handleNumber(text) {
    if (isNewNumber) {
        currentNumber = text === '.' ? '0.' : text;
        isNewNumber = false;
    } else {
        if ((text === '.' && currentNumber.includes('.')) || (text === '0' && currentNumber === '0')) {
            return;
        }
        currentNumber += text;
    }
    updateDisplay();
}

function handleOperation(op) {
    if (firstNumber !== null) {
        calculateResult();
    }
    firstNumber = parseFloat(currentNumber);
    operation = op === '×' ? '*' : op;
    isNewNumber = true;
}

function calculateResult() {
    if (firstNumber === null || operation === null) return;

    const secondNumber = parseFloat(currentNumber);
    currentNumber = eval(`${firstNumber}${operation}${secondNumber}`).toString();
    operation = null;
    firstNumber = null;
    isNewNumber = true;
    updateDisplay();
}

function resetCalculator() {
    currentNumber = '0';
    firstNumber = null;
    operation = null;
    isNewNumber = false;
    updateDisplay();
}

function toggleSign() {
    currentNumber = (parseFloat(currentNumber) * -1).toString();
    updateDisplay();
}

function calculatePercentage() {
    currentNumber = (parseFloat(currentNumber) / 100).toString();
    updateDisplay();
}

function updateDisplay() {
    calculatorDisplay.textContent = currentNumber;
}

// 待办清单功能
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const completedCount = document.getElementById('completed-count');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = [
    {id: 1, text: '完成前端综合项目设计', completed: false},
    {id: 2, text: '学习CSS Grid布局', completed: true},
    {id: 3, text: '准备项目演示文稿', completed: false}
];

// 渲染待办事项
function renderTodos() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item flex items-center p-3 bg-gray-50 rounded-lg ${todo.completed ? 'opacity-50' : ''}`;
        todoItem.dataset.id = todo.id;

        todoItem.innerHTML = `
        <input type="checkbox" class="mr-3 h-5 w-5 accent-primary" ${todo.completed ? 'checked' : ''}>
        <span class="flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}">${todo.text}</span>
        <button class="text-gray-400 hover:text-red-500 transition-colors mr-2 edit-todo">
          <i class="fa fa-pencil"></i>
        </button>
        <button class="text-gray-400 hover:text-red-500 transition-colors delete-todo">
          <i class="fa fa-trash"></i>
        </button>
      `;

        todoList.appendChild(todoItem);
    });

    updateCount();
    setupEventListeners();
}

// 更新计数
function updateCount() {
    const incomplete = todos.filter(todo => !todo.completed).length;
    const complete = todos.filter(todo => todo.completed).length;

    todoCount.textContent = incomplete;
    completedCount.textContent = complete;
}

// 设置事件监听器
function setupEventListeners() {
    // 复选框切换完成状态
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const todoId = parseInt(this.closest('.todo-item').dataset.id);
            const todo = todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = this.checked;
                renderTodos();
                saveToLocalStorage();
            }
        });
    });

    // 编辑待办事项
    document.querySelectorAll('.edit-todo').forEach(button => {
        button.addEventListener('click', function () {
            const todoId = parseInt(this.closest('.todo-item').dataset.id);
            const todo = todos.find(t => t.id === todoId);
            if (todo) {
                const newText = prompt('编辑待办事项:', todo.text);
                if (newText !== null && newText.trim() !== '') {
                    todo.text = newText;
                    renderTodos();
                    saveToLocalStorage();
                }
            }
        });
    });

    // 删除待办事项
    document.querySelectorAll('.delete-todo').forEach(button => {
        button.addEventListener('click', function () {
            const todoId = parseInt(this.closest('.todo-item').dataset.id);
            todos = todos.filter(todo => todo.id !== todoId);
            renderTodos();
            saveToLocalStorage();
        });
    });

    // 筛选按钮
    filterButtons.forEach((button, index) => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('bg-gray-100', 'hover:bg-gray-200');
            });

            this.classList.remove('bg-gray-100', 'hover:bg-gray-200');
            this.classList.add('bg-primary', 'text-white');

            // 这里可以添加筛选逻辑
        });
    });
}

// 添加待办事项
addTodoButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.unshift(newTodo);
    renderTodos();
    todoInput.value = '';
    saveToLocalStorage();
}

// 本地存储
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 从本地存储加载
function loadFromLocalStorage() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// 初始化待办清单
loadFromLocalStorage();
renderTodos();

// 图床功能
const galleryThumbs = document.querySelectorAll('.gallery-thumb');
const imageViewer = document.getElementById('image-viewer');
const closeViewer = document.getElementById('close-viewer');
const fullsizeImage = document.getElementById('fullsize-image');
const imageTitle = document.getElementById('image-title');
const imageDesc = document.getElementById('image-desc');
const prevImage = document.getElementById('prev-image');
const nextImage = document.getElementById('next-image');
let currentImageIndex = 0;
const images = [
    {
        src: 'https://picsum.photos/1200/800?random=10',
        title: '自然风光',
        desc: '拍摄于山间的自然风光照片，展示了大自然的美丽与宁静。'
    },
    {
        src: 'https://picsum.photos/1200/800?random=11',
        title: '城市夜景',
        desc: '繁华都市的夜景照片，灯光璀璨，展现现代城市的活力。'
    },
    {
        src: 'https://picsum.photos/1200/800?random=12',
        title: '海边日落',
        desc: '海边的日落景象，夕阳染红天空，海面波光粼粼。'
    },
    {
        src: 'https://picsum.photos/1200/800?random=13',
        title: '森林小径',
        desc: '森林中的小径，绿树成荫，展现大自然的宁静与神秘。'
    },
    {
        src: 'https://picsum.photos/1200/800?random=14',
        title: '乡村风光',
        desc: '宁静的乡村风光，农田与房屋交织，展现田园生活的美好。'
    }
];

galleryThumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
        currentImageIndex = index;
        openImageViewer(index);
    });
});

function openImageViewer(index) {
    currentImageIndex = index;
    fullsizeImage.src = images[index].src;
    imageTitle.textContent = images[index].title;
    imageDesc.textContent = images[index].desc;
    imageViewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

closeViewer.addEventListener('click', () => {
    imageViewer.classList.add('hidden');
    document.body.style.overflow = 'auto';
});

// 点击背景关闭
imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer) {
        imageViewer.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});

// 键盘导航
document.addEventListener('keydown', (e) => {
    if (imageViewer.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
        imageViewer.classList.add('hidden');
        document.body.style.overflow = 'auto';
    } else if (e.key === 'ArrowLeft') {
        showPrevImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
});

// 上一张/下一张图片
prevImage.addEventListener('click', showPrevImage);
nextImage.addEventListener('click', showNextImage);

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateImageViewer();
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateImageViewer();
}

function updateImageViewer() {
    fullsizeImage.src = images[currentImageIndex].src;
    imageTitle.textContent = images[currentImageIndex].title;
    imageDesc.textContent = images[currentImageIndex].desc;

    // 添加淡入动画效果
    fullsizeImage.style.opacity = '0';
    setTimeout(() => {
        fullsizeImage.style.opacity = '1';
    }, 100);
}

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

// 深色模式切换（可选功能）
const themeToggle = document.getElementById('theme-toggle');
let darkMode = false;

themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    updateTheme();
});

function updateTheme() {
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    if (darkMode) {
        body.classList.add('dark');
        icon.classList.remove('fa-moon-o');
        icon.classList.add('fa-sun-o');
    } else {
        body.classList.remove('dark');
        icon.classList.remove('fa-sun-o');
        icon.classList.add('fa-moon-o');
    }
}