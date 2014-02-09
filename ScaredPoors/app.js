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
    analyzer.startAnalysis(target, function (currentTime, imageData) {
        //if (canvasContext)
        //    canvasContext.putImageData(imageData, 0, 0);
        if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
            return;

        if (lastSeconds.length) {
            var equality = imagediff.equal(lastImageData, imageData, 200);
            info.innerHTML = equality + " " + currentTime;
        }

        lastSeconds.unshift(currentTime);
        lastImageData = imageData;
    });
});
//# sourceMappingURL=app.js.map
