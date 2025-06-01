
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

// 初始化暗黑模式
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// 检查用户偏好
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    enableDarkMode();
}

themeToggle.addEventListener('click', () => {
    if (DarkReader.isEnabled()) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

function enableDarkMode() {
    DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 0,
        theme: {
            colors: {
                primary: '#4f46e5', // 自定义主色调
            },
        },
    });
    themeIcon.classList.remove('fa-moon-o');
    themeIcon.classList.add('fa-sun-o');
    localStorage.setItem('darkMode', 'true');
}

function disableDarkMode() {
    DarkReader.disable();
    themeIcon.classList.remove('fa-sun-o');
    themeIcon.classList.add('fa-moon-o');
    localStorage.setItem('darkMode', 'false');
}

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