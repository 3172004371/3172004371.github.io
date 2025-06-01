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