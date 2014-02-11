// ImageData Equality Operators
function equalWidth(a, b) {
    return a.width === b.width;
}
function equalHeight(a, b) {
    return a.height === b.height;
}
function equalDimensions(a, b) {
    return equalHeight(a, b) && equalWidth(a, b);
}
function equal(a, b, tolerance) {

    var
        aData = a.data,
        bData = b.data,
        length = aData.length,
        i;

    tolerance = tolerance || 0;

    if (!equalDimensions(a, b)) return false;
    for (i = length; i--;) if (aData[i] !== bData[i] && Math.abs(aData[i] - bData[i]) > tolerance) return false;

    return true;
}
addEventListener('message', (e: MessageEvent) => {
    if (e.data.type === "equal") {
        var equality = equal(e.data.data1, e.data.data2, e.data.tolerance);
        postMessage({ type: "equality", equality: equality, currentTime: e.data.currentTime }, null);
    }
});


//var lastSeconds = [];
//var lastImageData: ImageData;

//addEventListener('message', (e) => {
//    if (e.data.type === "MJPEGData") {
//        var tolerance: number = e.data.tolerance;
//        var mjpegData: MJPEGData = e.data.MJPEGData;

//        var arraybuffer = mjpegData.arraybuffer;
//        var array = new Uint8Array(arraybuffer);
//        mjpegData.frameDataList.forEach((frame) => {
//            calculateEquality(frame.currentTime, getImageDataFromArray(array.subarray(frame.jpegStartIndex, frame.jpegFinishIndex)));
//        });
        
//    }
//});
//var calculateEquality = (currentTime: number, imageData: ImageData) => {
//    if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
//        return;

//    if (lastSeconds.length) {// not 0 
//        var equality = equal(imageData, lastImageData, 200);
//        postMessage((equality + " " + currentTime), null);
//    }

//    lastSeconds.unshift(currentTime);
//    lastImageData = imageData;
//};