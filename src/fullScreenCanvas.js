/**
 * Created by Florin on 4/7/2017.
 */

const canvasContainer = document.getElementById('canvas-container');
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    canvasContainer.style.width = window.innerWidth + 'px';
    canvasContainer.style.height = window.innerHeight + 'px';
}
onWindowResize();