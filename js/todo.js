// 待办清单功能
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const emptyTodo = document.getElementById('empty-todo');
const activeCount = document.getElementById('active-count');
const completedTasks = document.getElementById('completed-tasks');
const totalTasks = document.getElementById('total-tasks');
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

// 任务数据（含优先级和日期）
let todos = [
    { id: 1, text: '完成前端综合项目设计', completed: false, priority: 'high', date: 'today' },
    { id: 2, text: '学习CSS Grid布局', completed: true, priority: 'medium', date: 'yesterday' },
    { id: 3, text: '准备项目演示文稿', completed: false, priority: 'medium', date: 'tomorrow' }
];

// 渲染待办事项
function renderTodos(filter = 'all') {
    todoList.innerHTML = '';
    emptyTodo.classList.add('hidden');

    // 根据筛选条件过滤任务
    let filteredTodos = todos;
    if (filter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // 无任务时显示空状态
    if (filteredTodos.length === 0 && filter === 'all') {
        emptyTodo.classList.remove('hidden');
        return;
    }

    // 渲染任务项
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item flex items-center p-3 bg-[var(--color-lighter)/30] rounded-lg shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5`;
        todoItem.dataset.id = todo.id;
        todoItem.dataset.completed = todo.completed;

        // 任务优先级样式
        const priorityClass = {
            'high': 'bg-red-100 text-red-600',
            'medium': 'bg-yellow-100 text-yellow-600',
            'low': 'bg-green-100 text-green-600'
        };

        // 任务日期文本
        const dateText = {
            'today': '今天',
            'tomorrow': '明天',
            'yesterday': '昨天',
            'this_week': '本周',
            'next_week': '下周'
        };

        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox h-5 w-5 accent-[var(--color-primary)] mr-3 rounded focus:ring-[var(--color-primary)] transition-colors" ${todo.completed ? 'checked' : ''}>
            <div class="flex-1 min-w-0">
                <span class="todo-text ${todo.completed ? 'line-through text-[var(--color-medium)]' : 'font-medium text-[var(--color-dark)]'} line-clamp-1">${todo.text}</span>
                <div class="todo-meta mt-1 flex items-center text-xs text-[var(--color-medium)]">
                    <span class="${priorityClass[todo.priority]} px-2 py-0.5 rounded mr-2">${getPriorityText(todo.priority)}</span>
                    <span><i class="fa fa-calendar-o mr-1"></i> ${dateText[todo.date] || todo.date}</span>
                </div>
            </div>
            <div class="flex space-x-2 ml-3">
                <button class="edit-todo text-[var(--color-medium)] hover:text-[var(--color-primary)] transition-colors p-1.5" aria-label="编辑">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="delete-todo text-[var(--color-medium)] hover:text-red-500 transition-colors p-1.5" aria-label="删除">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;

        todoList.appendChild(todoItem);
    });

    updateCount();
    setupEventListeners();
}

// 获取优先级文本
function getPriorityText(priority) {
    const priorityMap = {
        'high': '重要',
        'medium': '中等',
        'low': '次要'
    };
    return priorityMap[priority] || priority;
}

// 更新计数
function updateCount() {
    const incomplete = todos.filter(todo => !todo.completed).length;
    const complete = todos.filter(todo => todo.completed).length;
    const total = todos.length;

    activeCount.textContent = incomplete;
    completedTasks.textContent = complete;
    totalTasks.textContent = total;
    filterAll.textContent = total;
    filterActive.textContent = incomplete;
    filterCompleted.textContent = complete;
}

// 设置事件监听器
function setupEventListeners() {
    // 复选框切换完成状态（带动画）
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const todoId = parseInt(this.closest('.todo-item').dataset.id);
            const todo = todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = this.checked;

                // 添加完成/未完成动画
                const todoItem = this.closest('.todo-item');
                if (this.checked) {
                    todoItem.classList.add('opacity-50', 'scale-95');
                    todoItem.style.transition = 'all 0.3s ease';
                } else {
                    todoItem.classList.remove('opacity-50', 'scale-95');
                }

                renderTodos();
                saveToLocalStorage();
            }
        });
    });

    // 编辑待办事项
    document.querySelectorAll('.edit-todo').forEach(button => {
        button.addEventListener('click', function() {
            const todoId = parseInt(this.closest('.todo-item').dataset.id);
            const todo = todos.find(t => t.id === todoId);
            if (todo) {
                // 弹出编辑框（可扩展为模态框）
                const newText = prompt('编辑待办事项:', todo.text);
                if (newText !== null && newText.trim() !== '') {
                    todo.text = newText;
                    renderTodos();
                    saveToLocalStorage();
                }
            }
        });
    });

    // 删除待办事项（带删除动画）
    document.querySelectorAll('.delete-todo').forEach(button => {
        button.addEventListener('click', function() {
            const todoId = parseInt(this.closest('.todo-item').dataset.id);
            const todoItem = this.closest('.todo-item');

            // 添加删除动画
            todoItem.style.opacity = '0';
            todoItem.style.transform = 'translateX(20px)';
            todoItem.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== todoId);
                renderTodos();
                saveToLocalStorage();
            }, 300);
        });
    });

    // 筛选按钮
    filterButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-[var(--color-primary)]', 'text-[var(--color-white)]');
                btn.classList.add('bg-[var(--color-lighter)]', 'text-[var(--color-medium)]');
            });

            this.classList.remove('bg-[var(--color-lighter)]', 'text-[var(--color-medium)]');
            this.classList.add('bg-[var(--color-primary)]', 'text-[var(--color-white)]');

            renderTodos(filter);
        });
    });

    // 清除已完成任务
    clearCompletedBtn.addEventListener('click', function() {
        const completedIds = todos.filter(todo => todo.completed).map(todo => todo.id);

        // 批量删除动画
        completedIds.forEach(id => {
            const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
            if (todoItem) {
                todoItem.style.opacity = '0';
                todoItem.style.transform = 'translateY(10px)';
                todoItem.style.transition = 'all 0.3s ease';
            }
        });

        setTimeout(() => {
            todos = todos.filter(todo => !todo.completed);
            renderTodos();
            saveToLocalStorage();
        }, 300);
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

    // 生成随机优先级和日期（实际应用中可通过表单选择）
    const priorities = ['high', 'medium', 'low'];
    const dates = ['today', 'tomorrow', 'yesterday', 'this_week', 'next_week'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: randomPriority,
        date: randomDate
    };

    todos.unshift(newTodo);
    renderTodos();
    todoInput.value = '';
    saveToLocalStorage();

    // 添加新任务动画
    const newTaskItem = document.querySelector('.todo-item[data-id="' + newTodo.id + '"]');
    if (newTaskItem) {
        newTaskItem.style.opacity = '0';
        newTaskItem.style.transform = 'translateY(-20px)';
        newTaskItem.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            newTaskItem.style.opacity = '1';
            newTaskItem.style.transform = 'translateY(0)';
        }, 10);
    }
}

// 本地存储
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 从本地存储加载
function loadFromLocalStorage() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        try {
            todos = JSON.parse(savedTodos);
        } catch (error) {
            console.error('加载待办事项失败:', error);
            todos = [];
        }
    }
}

// 初始化待办清单
loadFromLocalStorage();
renderTodos();