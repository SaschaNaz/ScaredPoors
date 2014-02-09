var analyzer = new ScaredPoors();
var lastSeconds = [];
var lastImageData;
var freezes = [];
window.addEventListener("DOMContentLoaded", function () {
    var canvasContext;
    target.addEventListener("play", function () {
        canvasContext = clone.getContext("2d");
        clone.width = target.videoWidth;
        clone.height = target.videoHeight;
    });
    var worker = new Worker("worker.js");
    worker.addEventListener("message", function (e) {
        info.innerHTML = e.data;
    });
    analyzer.startAnalysis(target, function (currentTime, imageData) {
        //if (canvasContext)
        //    canvasContext.putImageData(imageData, 0, 0);
        if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
            return;

        if (lastSeconds.length)
            worker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 200 });

        lastSeconds.unshift(currentTime);
        lastImageData = imageData;
    });
});
//# sourceMappingURL=app.js.map
