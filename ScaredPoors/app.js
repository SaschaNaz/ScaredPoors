var analyzer = new ScaredPoors();
var lastSeconds = [];
var lastImageData;
var freezes = [];
var canvasContext;

var imageDiffWorker = new Worker("imagediffworker.js");
imageDiffWorker.addEventListener("message", function (e) {
    if (e.data.type == "equality")
        info.innerHTML = e.data.equality + " " + e.data.currentTime;
});
window.addEventListener("DOMContentLoaded", function () {
    analyzer.startAnalysis(target, postOperation);
});

var getImageDataFromArray = function (subarray) {
    var dataURI = "data:image/jpeg;base64," + btoa(String.fromCharCode.apply(null, subarray));
    var image = document.createElement("img");
    image.src = dataURI;
    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    canvasContext.drawImage(image, 0, 0);
    return canvasContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
};

var loadVideo = function (file) {
    target.src = URL.createObjectURL(event.target.files[0]);
};

var mjpegWorker = new Worker("mjpegworker.js");
mjpegWorker.addEventListener("message", function (e) {
    var data = e.data;
    var arraybuffer = data.arraybuffer;
    var array = new Uint8Array(arraybuffer);
    var frameDataList = data.frameDataList;
    var sendFrame = function () {
        sendingIndex += data.frameRate;
        if (frameDataList.length <= sendingIndex)
            return;
        var sendingFrame = frameDataList[sendingIndex];
        postOperation(sendingFrame.currentTime, getImageDataFromArray(array.subarray(sendingFrame.jpegStartIndex, sendingFrame.jpegFinishIndex)));
    };

    var sendingIndex = -data.frameRate;
    imageDiffWorker.addEventListener("message", function (eq) {
        if (eq.data.type == "equality") {
            sendFrame();
        }
    });
    sendFrame();
    sendFrame(); //send two frames
});

var loadMJPEG = function (file) {
    canvasContext = tempCanvas.getContext("2d");

    //(new MJPEGReader()).read(file, 24, (frames) => {
    //    frames.forEach((frame) => {
    //        postOperation(frame.currentTime, getImageDataFromArray(frame.jpegBase64));
    //    });
    //});
    mjpegWorker.postMessage({ type: "mjpeg", file: file, frameRate: 100 });
};

var postOperation = function (currentTime, imageData) {
    if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
        return;

    if (lastSeconds.length)
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 200 });

    lastSeconds.unshift(currentTime);
    lastImageData = imageData;
};
//# sourceMappingURL=app.js.map
