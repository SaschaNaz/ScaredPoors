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
    analyzer.startAnalysis(target, (currentTime, imageData) => {
        //if (canvasContext)
        //    canvasContext.putImageData(imageData, 0, 0);
        if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
            return;

        if (lastSeconds.length) {// not 0
            var equality = imagediff.equal(lastImageData, imageData, 200);
            info.innerHTML = equality + " " + currentTime;
        }

        lastSeconds.unshift(currentTime);
        lastImageData = imageData;

    });
});