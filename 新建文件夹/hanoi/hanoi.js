class HanoiGame {
    constructor() {
        this.currentSteps = 0;
        this.optimalSteps = 0;
        this.diskCount = 4;
        this.animationSpeed = 400;
        this.isManualMode = false;
        this.selectedTower = null;
        this.isAnimating = false;
        this.isSolving = false;

        this.initElements();
        this.initEventListeners();
        this.initHanoi();
    }

    initElements() {
        this.tower1 = document.getElementById('tower1');
        this.tower2 = document.getElementById('tower2');
        this.tower3 = document.getElementById('tower3');
        this.towers = [this.tower1, this.tower2, this.tower3];
        
        this.diskCountInput = document.getElementById('diskCount');
        this.speedSelect = document.getElementById('speed');
        this.startAnimationBtn = document.getElementById('startAnimation');
        this.startManualBtn = document.getElementById('startManual');
        this.resetBtn = document.getElementById('reset');
        this.currentStepsSpan = document.getElementById('currentSteps');
        this.optimalStepsSpan = document.getElementById('optimalSteps');
        this.statusSpan = document.getElementById('status');
    }

    initEventListeners() {
        this.startAnimationBtn.addEventListener('click', () => this.startAutoSolve());
        this.startManualBtn.addEventListener('click', () => this.startManualMode());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        this.towers.forEach(tower => {
            tower.addEventListener('click', () => this.handleTowerClick(tower));
        });
    }

    initHanoi() {
        this.clearTowers();
        this.createDisks();
        this.placeDisksOnFirstTower();
        
        this.currentSteps = 0;
        this.optimalSteps = Math.pow(2, this.diskCount) - 1;
        this.updateStats();
        this.updateStatus("准备就绪");
    }

    clearTowers() {
        this.towers.forEach(tower => {
            while (tower.firstChild) {
                tower.removeChild(tower.firstChild);
            }
        });
    }

    createDisks() {
        this.disks = [];
        for (let i = this.diskCount; i > 0; i--) {
            const disk = document.createElement('div');
            disk.className = `disk disk-size-${i}`;
            disk.dataset.size = i;
            disk.textContent = i;
            this.disks.push(disk);
        }
    }

    placeDisksOnFirstTower() {
        this.disks.forEach(disk => this.tower1.appendChild(disk));
    }

    async startAutoSolve() {
        if (this.isAnimating || this.isSolving) return;
        
        this.isSolving = true;
        this.isManualMode = false;
        this.disableControls();
        this.updateStatus("自动求解中...");
        
        this.diskCount = parseInt(this.diskCountInput.value);
        this.animationSpeed = parseInt(this.speedSelect.value);
        
        this.initHanoi();
        
        await this.hanoi(this.diskCount, this.tower1, this.tower3, this.tower2);
        
        this.isSolving = false;
        this.enableControls();
        this.updateStatus("自动求解完成");
    }

    async hanoi(n, fromTower, toTower, auxTower) {
        if (n === 1) {
            await this.moveDisk(fromTower, toTower);
            return;
        }
        
        await this.hanoi(n - 1, fromTower, auxTower, toTower);
        await this.moveDisk(fromTower, toTower);
        await this.hanoi(n - 1, auxTower, toTower, fromTower);
    }

    startManualMode() {
        if (this.isAnimating || this.isSolving) return;
        
        this.diskCount = parseInt(this.diskCountInput.value);
        this.animationSpeed = parseInt(this.speedSelect.value);
        this.isManualMode = true;
        
        this.deselectTower();
        this.initHanoi();
        this.updateStatus("手动模式 - 请选择盘片");
    }

    resetGame() {
        if (this.isAnimating || this.isSolving) return;
        
        this.deselectTower();
        this.initHanoi();
    }

    handleTowerClick(tower) {
        if (!this.isManualMode || this.isAnimating || this.isSolving) return;
        
        const disks = tower.querySelectorAll('.disk');
        
        if (this.selectedTower === null) {
            // 选择第一个柱子（必须有盘片）
            if (disks.length === 0) return;
            
            this.selectedTower = tower;
            tower.classList.add('selected');
            disks[disks.length - 1].classList.add('selected');
            this.updateStatus("已选择盘片 - 请选择目标柱子");
        } else if (this.selectedTower === tower) {
            // 取消选择
            this.deselectTower();
            this.updateStatus("手动模式 - 请选择盘片");
        } else {
            // 尝试移动盘片
            const selectedDisk = this.selectedTower.querySelector('.disk.selected');
            const targetDisks = tower.querySelectorAll('.disk');
            
            // 检查移动是否合法（目标柱子为空或顶部盘片更大）
            const isValidMove = targetDisks.length === 0 || 
                              parseInt(selectedDisk.dataset.size) < parseInt(targetDisks[targetDisks.length - 1].dataset.size);
            
            if (isValidMove) {
                this.moveDisk(this.selectedTower, tower);
                this.updateStatus("手动模式 - 请选择盘片");
            } else {
                alert("非法移动！不能将大盘放在小盘上");
                this.updateStatus("非法移动 - 请重新选择");
            }
            
            this.deselectTower();
        }
    }

    deselectTower() {
        if (this.selectedTower) {
            this.selectedTower.classList.remove('selected');
            const disk = this.selectedTower.querySelector('.disk.selected');
            if (disk) disk.classList.remove('selected');
            this.selectedTower = null;
        }
    }

    async moveDisk(fromTower, toTower) {
        return new Promise((resolve) => {
            if (this.isAnimating) return resolve();
            
            const disks = fromTower.querySelectorAll('.disk');
            if (disks.length === 0) return resolve();
            
            const disk = disks[disks.length - 1];
            
            this.isAnimating = true;
            this.updateStatus("移动盘片中...");
            
            // 动画效果
            disk.style.transition = `transform ${this.animationSpeed}ms ease-in-out`;
            disk.style.transform = `translateY(-${fromTower.offsetHeight}px)`;
            
            setTimeout(() => {
                const fromRect = fromTower.getBoundingClientRect();
                const toRect = toTower.getBoundingClientRect();
                const deltaX = toRect.left - fromRect.left;
                
                disk.style.transform = `translate(${deltaX}px, -${fromTower.offsetHeight}px)`;
                
                setTimeout(() => {
                    disk.style.transform = '';
                    disk.style.transition = '';
                    fromTower.removeChild(disk);
                    toTower.appendChild(disk);
                    this.currentSteps++;
                    this.updateStats();
                    this.isAnimating = false;
                    
                    // 检查是否完成（所有盘片都在第三个柱子上）
                    if (this.isManualMode && toTower === this.tower3) {
                        const tower3Disks = this.tower3.querySelectorAll('.disk');
                        if (tower3Disks.length === this.diskCount) {
                            this.updateStatus("恭喜完成！");
                            setTimeout(() => {
                                alert(`🎉 恭喜完成！\n当前步数: ${this.currentSteps}\n最优步数: ${this.optimalSteps}`);
                            }, 300);
                        } else {
                            this.updateStatus("手动模式 - 请选择盘片");
                        }
                    } else {
                        this.updateStatus("手动模式 - 请选择盘片");
                    }
                    
                    resolve();
                }, this.animationSpeed);
            }, this.animationSpeed);
        });
    }

    updateStats() {
        this.currentStepsSpan.textContent = this.currentSteps;
        this.optimalStepsSpan.textContent = this.optimalSteps;
    }

    updateStatus(message) {
        this.statusSpan.textContent = `状态: ${message}`;
    }

    disableControls() {
        this.startAnimationBtn.disabled = true;
        this.startManualBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.diskCountInput.disabled = true;
        this.speedSelect.disabled = true;
    }

    enableControls() {
        this.startAnimationBtn.disabled = false;
        this.startManualBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.diskCountInput.disabled = false;
        this.speedSelect.disabled = false;
    }
}

// 初始化游戏
const hanoiGame = new HanoiGame();