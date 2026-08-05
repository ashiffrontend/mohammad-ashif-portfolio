/**
 * ANIMATED COUNTER UTILITY
 */

function animateCounter(element, target, duration = 1500) {
  if (!element) return;
  let start = 0;
  const increment = target / (duration / 16);
  
  function update() {
    start += increment;
    if (start < target) {
      element.innerText = Math.floor(start).toLocaleString();
      requestAnimationFrame(update);
    } else {
      element.innerText = Number(target).toLocaleString();
    }
  }
  update();
}

window.animateCounter = animateCounter;

