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