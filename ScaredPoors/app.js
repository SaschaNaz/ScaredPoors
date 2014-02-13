var MemoryBox = (function () {
    function MemoryBox() {
        this.canvas = document.createElement("canvas");
        this.image = document.createElement("img");
        this.canvasContext = this.canvas.getContext("2d");
    }
    return MemoryBox;
})();

var analyzer = new ScaredPoors();
var lastSeconds = [];
var lastImageData;
var freezes = [];
var loadedArrayBuffer;
var memoryBox = new MemoryBox();

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
    memoryBox.image.src = dataURI;
    memoryBox.canvas.width = memoryBox.image.naturalWidth;
    memoryBox.canvas.height = memoryBox.image.naturalHeight;
    memoryBox.canvasContext.drawImage(memoryBox.image, 0, 0);
    return memoryBox.canvasContext.getImageData(0, 0, memoryBox.image.naturalWidth, memoryBox.image.naturalHeight);
};

var loadVideo = function (file) {
    target.src = URL.createObjectURL(file);
};

var mjpegWorker = new Worker("mjpegworker.js");
mjpegWorker.addEventListener("message", function (e) {
    var data = e.data.mjpegData;

    //var array = new Uint8Array(loadedArrayBuffer);
    var frameDataList = data.frameDataList;
    var sendFrame = function () {
        sendingIndex += data.frameRate;
        if (frameDataList.length <= sendingIndex)
            return;
        var sendingFrame = frameDataList[sendingIndex];
        postOperation(sendingFrame.currentTime, getImageDataFromArray(sendingFrame.jpegArrayData));
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
    //var reader = new FileReader();
    //reader.onload = (e) => {
    //    loadedArrayBuffer = <ArrayBuffer>e.target.result;
    //(new MJPEGReader()).read(file, 24, (frames) => {
    //    frames.forEach((frame) => {
    //        postOperation(frame.currentTime, getImageDataFromArray(frame.jpegBase64));
    //    });
    //});
    mjpegWorker.postMessage({ type: "mjpeg", file: file /*arraybuffer: loadedArrayBuffer*/ , frameRate: 100 });
    //};
    //reader.readAsArrayBuffer(file);
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
