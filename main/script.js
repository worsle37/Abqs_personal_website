 document.addEventListener('DOMContentLoaded', function() {
    // ==================== 拖拽HOME按钮功能 ====================
    const dragElement = document.getElementById('dragElement');
    const referenceElement = document.querySelector('.search-container');
    let isDragging = false;
    let velocityX = 0, velocityY = 0; 
    let lastX = 0, lastY = 0; 
    const friction = 0.92; 
    const springStiffness = 0.15;
    let dragStartTime = 0; // 记录拖动开始时间
    
    // 设置按钮位置
    function setButtonPosition() {
        if (!referenceElement || !dragElement) return;
        
        const refRect = referenceElement.getBoundingClientRect();
        const buttonRect = dragElement.getBoundingClientRect();
        
        const targetLeft = refRect.right + 30;
        const targetTop = (refRect.top + (refRect.height - buttonRect.height) / 2) + 18;
        
        dragElement.style.left = `${targetLeft}px`;
        dragElement.style.top = `${targetTop}px`;
        
        const maxLeft = window.innerWidth - buttonRect.width;
        const maxTop = window.innerHeight - buttonRect.height;
        dragElement.style.left = `${Math.min(Math.max(targetLeft, 0), maxLeft)}px`;
        dragElement.style.top = `${Math.min(Math.max(targetTop, 0), maxTop)}px`;
    }
    
    // 初始化位置
    setButtonPosition();
    window.addEventListener('resize', setButtonPosition);
    if (referenceElement) {
        new ResizeObserver(setButtonPosition).observe(referenceElement);
    }
    
    // 拖动事件处理
    dragElement.addEventListener('mousedown', startDrag);
    dragElement.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        dragStartTime = Date.now(); // 记录拖动开始时间
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
    
    // 物理模拟（惯性滑动 + 边界回弹）
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
            return;
        }
        
        requestAnimationFrame(physicsUpdate);
    }
    

    // 在script.js中添加
    // 确保拖拽功能正确初始化
    function initDragFunctionality() {
        const dragElement = document.getElementById('dragElement');
        if (!dragElement) return;
        
        // 确保元素存在且未初始化
        if (!dragElement._dragInitialized) {
            dragElement._dragInitialized = true;
            
            // 重置位置
            setButtonPosition();
            
            // 添加事件监听器
            dragElement.addEventListener('mousedown', startDrag);
            dragElement.addEventListener('touchstart', startDrag);
        }
    }



    // ==================== History API功能 ====================
    const contentArea = document.getElementById('mainContent');
    const loader = document.getElementById('loader');
    const currentPageElement = document.getElementById('currentPage');
    const headerElement = document.querySelector('header');
    
    // 事件委托处理卡片和HOME按钮点击
    document.body.addEventListener('click', function(e) {
        // 检查点击的是否是卡片
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
        // 添加历史记录
        history.pushState({ page }, '', page);
        // 加载页面内容
        loadPageContent(page);
    }
    
 // script.js
// ...原有代码保持不变...

    // 修改后的 loadPageContent 函数
    function loadPageContent(page) {
        loader.style.display = 'block';
        document.getElementById('pageContainer').classList.add('fade-out');

        fetch(page)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // 只提取页面内容区域，不加载整个结构
                const contentContainer = doc.getElementById('pageContainer');
                let pageContent = contentContainer ? contentContainer.innerHTML : "";

                setTimeout(() => {
                    // 更新内容区域
                    document.getElementById('pageContainer').innerHTML = pageContent;

                    // 更新页面指示器
                    currentPageElement.textContent = page === 'index.html' 
                        ? "首页" 
                        : `作品 ${page.replace('.html', '')}`;

                    // 关键：重新绑定拖拽功能
                    initDragFunctionality();

                    // 隐藏加载动画
                    loader.style.display = 'none';
                    document.getElementById('pageContainer').classList.remove('fade-out');
                }, 600);
            })
            .catch(error => {
                console.error('加载失败:', error);
                loader.style.display = 'none';
                document.getElementById('pageContainer').classList.remove('fade-out');
                alert('加载失败，请重试');
            });
    }

    // ...其余代码保持不变...

    // 防止搜索表单提交
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;
        if (searchTerm) {
            // 模拟搜索结果
            const randomPage = Math.floor(Math.random() * 6) + 1;
            navigateToPage(`0${randomPage}.html`);
        } else {
            alert('请输入搜索内容');
        }
    });
    
    // 初始状态处理
    if (location.pathname !== '/') {
        const page = location.pathname.split('/').pop();
        if (page && page.match(/0[1-6]\.html/)) {
            loadPageContent(page);
        }
    }
    
    // 初始化脚本
    initScripts();
    });