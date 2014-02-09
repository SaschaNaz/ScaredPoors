declare var target: HTMLVideoElement;
var analyzer = new ScaredPoors();
window.addEventListener("DOMContentLoaded", () => {
    analyzer.startAnalysis(target, (imageData) => {
        return;
    });
});