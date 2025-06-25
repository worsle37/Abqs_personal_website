// 初始化变量
const dragElement = document.getElementById('dragElement');
const referenceElement = document.querySelector('.search-container'); // 参考元素（搜索框容器）
let isDragging = false;
let velocityX = 0, velocityY = 0; 
let lastX = 0, lastY = 0; 
const friction = 0.92; 
const springStiffness = 0.15; 

// 修正：修复HTML中form标签闭合错误（原代码中<form>重复闭合）
// 实际使用时请检查HTML：<form class="search-form" id="searchForm">...</form> 确保正确闭合


// ==================== 核心：初始位置 & 动态更新 ====================
function setButtonPosition() {
    if (!referenceElement || !dragElement) return; // 确保元素存在

    // 获取参考元素和按钮的尺寸/位置
    const refRect = referenceElement.getBoundingClientRect();
    const buttonRect = dragElement.getBoundingClientRect();

    // 计算按钮目标位置（参考元素右侧1px，垂直居中对齐）
    const targetLeft = refRect.right + 30; // 参考元素右侧 + 1px
    const targetTop = (refRect.top + (refRect.height - buttonRect.height) / 2)+18; // 垂直居中

    // 转换为相对于视口的坐标（按钮是绝对定位，直接用视口坐标）
    dragElement.style.left = `${targetLeft}px`;
    dragElement.style.top = `${targetTop}px`;

    // 边界保护：避免按钮超出视口右侧或底部
    const maxLeft = window.innerWidth - buttonRect.width;
    const maxTop = window.innerHeight - buttonRect.height;
    dragElement.style.left = `${Math.min(Math.max(targetLeft, 0), maxLeft)}px`;
    dragElement.style.top = `${Math.min(Math.max(targetTop, 0), maxTop)}px`;
}

// 页面加载后初始化位置
window.addEventListener('DOMContentLoaded', setButtonPosition);

// 窗口缩放/参考元素尺寸变化时更新位置
window.addEventListener('resize', setButtonPosition);
new ResizeObserver(setButtonPosition).observe(referenceElement); // 监听搜索框尺寸变化


// ==================== 拖动交互逻辑（保留原有功能） ====================
dragElement.addEventListener('mousedown', startDrag);
dragElement.addEventListener('touchstart', startDrag);

function startDrag(e) {
    isDragging = true;
    velocityX = 0;
    velocityY = 0;
    const event = e.touches ? e.touches[0] : e; 
    const rect = dragElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left; // 鼠标到按钮左边缘的偏移
    const offsetY = event.clientY - rect.top;  // 鼠标到按钮上边缘的偏移
    lastX = event.clientX;
    lastY = event.clientY;

    // 拖动时更新位置
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    // 拖动结束时停止
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    function drag(e) {
        const event = e.touches ? e.touches[0] : e;
        const currentX = event.clientX;
        const currentY = event.clientY;

        // 计算速度（当前帧位移）
        velocityX = currentX - lastX;
        velocityY = currentY - lastY;

        // 更新按钮位置（减去初始偏移，保持鼠标在按钮内的相对位置）
        dragElement.style.left = `${currentX - offsetX}px`;
        dragElement.style.top = `${currentY - offsetY}px`;

        // 更新上一帧坐标
        lastX = currentX;
        lastY = currentY;

        e.preventDefault(); // 阻止触摸滚动
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        requestAnimationFrame(physicsUpdate); // 启动物理模拟（惯性滑动）
    }
}

// 物理模拟（惯性滑动 + 边界回弹）
function physicsUpdate() {
    if (isDragging) return; 

    // 速度衰减
    velocityX *= friction;
    velocityY *= friction;

    // 计算新位置
    let newLeft = parseFloat(dragElement.style.left) + velocityX;
    let newTop = parseFloat(dragElement.style.top) + velocityY;

    // 边界检测（视口边界）
    const maxLeft = window.innerWidth - dragElement.offsetWidth;
    const maxTop = window.innerHeight - dragElement.offsetHeight;

    // 左/右边界回弹
    if (newLeft < 0 || newLeft > maxLeft) {
        velocityX *= -springStiffness; // 速度反向并衰减
        newLeft = Math.max(0, Math.min(newLeft, maxLeft)); // 限制在边界内
    }

    // 上/下边界回弹
    if (newTop < 0 || newTop > maxTop) {
        velocityY *= -springStiffness; 
        newTop = Math.max(0, Math.min(newTop, maxTop)); 
    }

    // 更新位置
    dragElement.style.left = `${newLeft}px`;
    dragElement.style.top = `${newTop}px`;

    // 速度足够小时停止模拟
    if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
        velocityX = 0;
        velocityY = 0;
        return;
    }

    requestAnimationFrame(physicsUpdate);
}
//////////////////上面是可拖拽//////////////////////////////////

const cardstyleone=document.querySelector(".cardstyleone")

function cardone(url) {
    //我不行了，这里还要写个放大代码css好累
    setTimeout(()=>{
        window.location.href = url; 
    },300);
    // 这行代码会让浏览器跳转到指定URL
}









