document.addEventListener('DOMContentLoaded', function() {
    // ==================== 全局变量 ====================
    let dragElement = null;
    let isDragging = false;
    let velocityX = 0, velocityY = 0;
    let lastX = 0, lastY = 0;
    const friction = 0.92;
    const springStiffness = 0.15;
    let dragStartTime = 0;
    let savedButtonPosition = null; // 存储按钮位置
    let clockInterval = null; // 时钟定时器
    let hideTimers = new WeakMap(); // 存储每个卡片的计时器

    // ==================== 拖拽HOME按钮功能 ====================
    // 设置自定义位置
    function setButtonPosition() {
        if (!dragElement) return;
        
        // 如果有保存的位置，使用保存的位置
        if (savedButtonPosition) {
            dragElement.style.left = savedButtonPosition.left;
            dragElement.style.top = savedButtonPosition.top;
            return;
        }
        
        // 否则设置默认位置
        const buttonRect = dragElement.getBoundingClientRect();
        const targetLeft = window.innerWidth * 0.89 - buttonRect.width / 2;
        const targetTop = window.innerHeight * 0.1345;
        
        dragElement.style.left = `${targetLeft}px`;
        dragElement.style.top = `${targetTop}px`;
    }

    // 保存按钮位置
    function saveButtonPosition() {
        if (dragElement && dragElement.style.left && dragElement.style.top) {
            savedButtonPosition = {
                left: dragElement.style.left,
                top: dragElement.style.top
            };
        }
    }

    // 初始化拖拽功能
    function initDragFunctionality() {
        dragElement = document.getElementById('dragElement');
        if (!dragElement) return;
        
        // 确保元素存在且未初始化
        if (!dragElement._dragInitialized) {
            dragElement._dragInitialized = true;
            
            // 设置位置（优先使用保存的位置）
            setButtonPosition();
            
            // 添加事件监听器
            dragElement.addEventListener('mousedown', startDrag);
            dragElement.addEventListener('touchstart', startDrag);
        }
    }

    // 开始拖拽
    function startDrag(e) {
        dragStartTime = Date.now();
        isDragging = true;
        velocityX = 0;
        velocityY = 0;
        const event = e.touches ? e.touches[0] : e;
        const rect = dragElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        lastX = event.clientX;
        lastY = event.clientY;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        
        function drag(e) {
            const event = e.touches ? e.touches[0] : e;
            const currentX = event.clientX;
            const currentY = event.clientY;
            
            velocityX = currentX - lastX;
            velocityY = currentY - lastY;
            
            dragElement.style.left = `${currentX - offsetX}px`;
            dragElement.style.top = `${currentY - offsetY}px`;
            
            lastX = currentX;
            lastY = currentY;
            e.preventDefault();
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
            requestAnimationFrame(physicsUpdate);
        }
    }
    
    // 物理模拟
    function physicsUpdate() {
        if (isDragging) return;
        
        velocityX *= friction;
        velocityY *= friction;
        
        let newLeft = parseFloat(dragElement.style.left) + velocityX;
        let newTop = parseFloat(dragElement.style.top) + velocityY;
        
        const maxLeft = window.innerWidth - dragElement.offsetWidth;
        const maxTop = window.innerHeight - dragElement.offsetHeight;
        
        if (newLeft < 0 || newLeft > maxLeft) {
            velocityX *= -springStiffness;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        }
        
        if (newTop < 0 || newTop > maxTop) {
            velocityY *= -springStiffness;
            newTop = Math.max(0, Math.min(newTop, maxTop));
        }
        
        dragElement.style.left = `${newLeft}px`;
        dragElement.style.top = `${newTop}px`;
        
        if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
            velocityX = 0;
            velocityY = 0;
            saveButtonPosition(); // 保存位置！
            return;
        }
        
        requestAnimationFrame(physicsUpdate);
    }

    // ==================== 时间更新函数 ====================
    function resetClock() {
        // 清除现有定时器
        if (clockInterval) {
            clearInterval(clockInterval);
        }
        
        function updateTime() {
            const date = new Date();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
        
            const dateString = `${month}-${day}`;
            const timeString = `${hours}:${minutes}`;
        
            // 获取所有 cardstyle6 元素
            const cardstyle6Elements = document.querySelectorAll('.cardstyle6');
            cardstyle6Elements.forEach(card => {
                const dateElement = card.querySelector('#date');
                const timeElement = card.querySelector('#time');
                if (dateElement && timeElement) {
                    dateElement.innerText = `-${dateString}-`;
                    timeElement.innerText = timeString;
                }
            });
        }
        
        // 初始
        updateTime();
        clockInterval = setInterval(updateTime, 1000);
    }


    //石山代码发力了（clock在首次加载不显示）但是这样能解决 装傻.jpg
    // 处理时钟点击事件
    function handleClockClick(e) {
        const card = e.target.closest('.cardstyle6');
        if (!card) return;
        
        const dateElement = card.querySelector('#date');
        const timeElement = card.querySelector('#time');
        
        if (!dateElement || !timeElement) return;
        //石山代码发力了（）但是这样能解决 装傻.jpg
        resetClock();
        // 显示元素
        dateElement.style.display = 'block';
        timeElement.style.display = 'block';
        
        // 清除之前的计时器（如果有）
        const existingTimer = hideTimers.get(card);
        if (existingTimer) clearTimeout(existingTimer);
        
        // 设置新的计时器，5 秒后隐藏
        const newTimer = setTimeout(() => {
            dateElement.style.display = 'none';
            timeElement.style.display = 'none';
        }, 5000);
        
        hideTimers.set(card, newTimer);
    }

    // ==================== History API功能 ====================
    const loader = document.getElementById('loader');
    const currentPageElement = document.getElementById('currentPage');
    
    // 事件委托处理卡片和HOME按钮点击
    document.body.addEventListener('click', function(e) {
        // 点击跳转逻辑
        const card = e.target.closest('[class^="cardstyle"]');
        if (card && card.dataset.page) {
            e.preventDefault();
            navigateToPage(card.dataset.page);
        }
        
        // 检查点击的是否是HOME按钮
        const homeButton = e.target.closest('#dragElement');
        if (homeButton && homeButton.dataset.page) {
            // 计算点击持续时间
            const clickDuration = Date.now() - dragStartTime;
            
            // 只有快速点击(短于200ms)才执行跳转
            if (clickDuration < 100 && !isDragging) {
                e.preventDefault();
                navigateToPage(homeButton.dataset.page);
            }
        }
    });
    
    // 处理浏览器前进/后退
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            loadPageContent(event.state.page);
        } else {
            loadPageContent('index.html');
        }
    });
    
    // 导航到指定页面
    function navigateToPage(page) {
        // 保存当前位置
        saveButtonPosition();
        
        // 添加历史记录
        history.pushState({ page }, '', page);
        loadPageContent(page);
    }
    
    // 加载页面内容
    function loadPageContent(page) {
        if (!loader) return;
        
        loader.style.display = 'block';
        const pageContainer = document.getElementById('pageContainer');
        if (pageContainer) {
            pageContainer.classList.add('fade-out');
        }
        
        fetch(page)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // 只提取页面内容区域
                const contentContainer = doc.getElementById('pageContainer');
                let pageContent = contentContainer ? contentContainer.innerHTML : "";
                
                setTimeout(() => {
                    if (pageContainer) {
                        pageContainer.innerHTML = pageContent;
                        pageContainer.classList.remove('fade-out');
                    }
                    
                    // 更新页面指示器
                    if (currentPageElement) {
                        currentPageElement.textContent = page === 'index.html' 
                            ? "首页" 
                            : `作品 ${page.replace('.html', '')}`;
                    }
                    
                    // 关键：重新绑定拖拽功能
                    initDragFunctionality();
                    
                    // 如果是首页，重置时钟
                    if (page === 'index.html') {
                        resetClock();
                    }
                    
                    // 隐藏加载动画
                    loader.style.display = 'none';
                }, 600);
            })
            .catch(error => {
                console.error('加载失败:', error);
                if (loader) loader.style.display = 'none';
                if (pageContainer) {
                    pageContainer.classList.remove('fade-out');
                }
                alert('加载失败，请重试');
            });
    }
    
    // 防止搜索表单提交
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            const searchTerm = searchInput ? searchInput.value : '';
            if (searchTerm) {
                // 模拟搜索结果
                const randomPage = Math.floor(Math.random() * 6) + 1;
                navigateToPage(`0${randomPage}.html`);
            } else {
                alert('请输入搜索内容');
            }
        });
    }
    
    // 初始状态处理
    if (location.pathname !== '/' && location.pathname !== '/index.html') {
        const page = location.pathname.split('/').pop();
        if (page && page.match(/0[1-6]\.html/)) {
            loadPageContent(page);
        } else {
            initDragFunctionality();
        }
    } else {
        // 初始化首页功能
        initDragFunctionality();
        resetClock();
    }
    
    // 添加时钟点击事件委托（只需一次）
    document.body.addEventListener('click', handleClockClick);
    
    // 窗口大小改变时更新位置
    window.addEventListener('resize', function() {
        // 如果有保存的位置，尝试保持相对位置
        if (savedButtonPosition && dragElement) {
            const rect = dragElement.getBoundingClientRect();
            const newLeft = window.innerWidth * (parseFloat(savedButtonPosition.left) / window.innerWidth);
            const newTop = window.innerHeight * (parseFloat(savedButtonPosition.top) / window.innerHeight);
            
            dragElement.style.left = `${newLeft}px`;
            dragElement.style.top = `${newTop}px`;
            
            // 更新保存的位置
            saveButtonPosition();
        } else {
            // 否则设置默认位置
            setButtonPosition();
        }
    });
});