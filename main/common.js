const dragElement = document.getElementById('dragElement');
let isDragging = false;
let velocityX = 0, velocityY = 0; 
let lastX = 0, lastY = 0; 
const friction = 0.92; 
const springStiffness = 0.15; 
const springDamping = 0.8; 

// 初始位置居中（页面加载后执行）
// 自定义百分比位置（0-1之间）
// 自定义百分比位置（0-1之间）
const POSITION_PERCENTAGE = {
  left: 0.8,  // 视口宽度的80%
  top: 0.1    // 视口高度的80%
};

// 页面加载后设置百分比位置
window.addEventListener('load', () => {
  setPercentagePosition();
});

// 窗口缩放时更新百分比位置
window.addEventListener('resize', () => {
  setPercentagePosition();
});

function setPercentagePosition() {
  const rect = dragElement.getBoundingClientRect();
  const maxLeft = window.innerWidth - rect.width;
  const maxTop = window.innerHeight - rect.height;
  
  // 计算百分比位置（带边界保护）
  const calculatedLeft = window.innerWidth * POSITION_PERCENTAGE.left;
  const calculatedTop = window.innerHeight * POSITION_PERCENTAGE.top;
  
  const safeLeft = Math.max(0, Math.min(calculatedLeft, maxLeft));
  const safeTop = Math.max(0, Math.min(calculatedTop, maxTop));
  
  dragElement.style.left = `${safeLeft}px`;
  dragElement.style.top = `${safeTop}px`;
}
// 拖动逻辑（原有代码保留，以下是核心交互）
dragElement.addEventListener('mousedown', startDrag);
dragElement.addEventListener('touchstart', startDrag);

function startDrag(e) {
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

// 物理模拟（原有代码保留）
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