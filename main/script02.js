const dragElement = document.getElementById('dragElement');
let isDragging = false;
let velocityX = 0, velocityY = 0; // 速度
let lastX = 0, lastY = 0; // 上一帧鼠标位置
const friction = 0.92; // 阻力系数（0.92表示每帧速度衰减8%）
const springStiffness = 0.15; // 弹性刚度（越大回弹越快）
const springDamping = 0.8; // 弹性阻尼（越大振动越小）

// 鼠标/触摸开始拖动
dragElement.addEventListener('mousedown', startDrag);
dragElement.addEventListener('touchstart', startDrag);

function startDrag(e) {
    isDragging = true;
    velocityX = 0;
    velocityY = 0;
    const event = e.touches ? e.touches[0] : e; // 兼容触摸事件
    const rect = dragElement.getBoundingClientRect();
            
    // 记录初始偏移（鼠标到元素中心的距离）
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    // 记录上一帧鼠标位置
    lastX = event.clientX;
    lastY = event.clientY;

    // 鼠标/触摸移动时更新位置和速度
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    // 鼠标/触摸结束时停止拖动
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    function drag(e) {
        const event = e.touches ? e.touches[0] : e;
        const currentX = event.clientX;
        const currentY = event.clientY;

        // 计算速度（当前帧位移 = 当前坐标 - 上一帧坐标）
        velocityX = currentX - lastX;
        velocityY = currentY - lastY;

        // 更新元素位置（减去初始偏移保持鼠标在元素内的相对位置）
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
        requestAnimationFrame(physicsUpdate); // 启动物理模拟
        }
}

// 物理模拟主循环（处理惯性滑动和弹性回弹）
function physicsUpdate() {
    if (isDragging) return; // 拖动时不执行物理模拟

    // 惯性滑动：速度衰减
    velocityX *= friction;
    velocityY *= friction;

    // 更新位置（根据速度）
    let newLeft = parseFloat(dragElement.style.left) + velocityX;
    let newTop = parseFloat(dragElement.style.top) + velocityY;

    // 边界弹性回弹（以窗口为边界）
    const maxLeft = window.innerWidth - dragElement.offsetWidth;
    const maxTop = window.innerHeight - dragElement.offsetHeight;

    // 左/右边界检测
    if (newLeft < 0 || newLeft > maxLeft) {
        velocityX *= -springStiffness; // 回弹速度反向并衰减
        newLeft = Math.max(0, Math.min(newLeft, maxLeft)); // 限制在边界内
    }

    // 上/下边界检测
    if (newTop < 0 || newTop > maxTop) {
        velocityY *= -springStiffness; // 回弹速度反向并衰减
        newTop = Math.max(0, Math.min(newTop, maxTop)); // 限制在边界内
    }

    // 更新元素位置
    dragElement.style.left = `${newLeft}px`;
    dragElement.style.top = `${newTop}px`;

    // 当速度足够小时停止模拟
    if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
        velocityX = 0;
        velocityY = 0;
        return;
    }

    // 下一帧继续模拟
    requestAnimationFrame(physicsUpdate);
}