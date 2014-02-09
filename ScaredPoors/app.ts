declare var target: HTMLVideoElement;
declare var info: HTMLSpanElement;
declare var clone: HTMLCanvasElement;
declare var imagediff: any;
var analyzer = new ScaredPoors();
var lastSeconds = [];
var lastImageData: ImageData;
var freezes = [];
window.addEventListener("DOMContentLoaded", () => {
    var canvasContext: CanvasRenderingContext2D;
    target.addEventListener("play", () => {
        canvasContext = clone.getContext("2d");
        clone.width = target.videoWidth;
        clone.height = target.videoHeight;
    });
    var worker = new Worker("worker.js");
    worker.addEventListener("message", (e) => {
        info.innerHTML = e.data;
    });
    analyzer.startAnalysis(target, (currentTime, imageData) => {
        //if (canvasContext)
        //    canvasContext.putImageData(imageData, 0, 0);
        if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
            return;

        if (lastSeconds.length)// not 0
            worker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 200 });

        lastSeconds.unshift(currentTime);
        lastImageData = imageData;

    });
});