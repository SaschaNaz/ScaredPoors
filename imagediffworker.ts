"use strict";
// ImageData Equality Operators
class ImageEquality {
    static isEqual(data1: ImageData, data2: ImageData, colorTolerance: number, pixelTolerance: number) {
        if (data1.width != data2.width || data1.height != data2.height)
            return false;

        var tolerancedPixels = 0;
        for (var i = 0; i < data1.data.length; i += 4) {
            if (this.getColorDistance(data1.data.subarray(i, i + 4), data2.data.subarray(i, i + 4)) >= colorTolerance) {
                tolerancedPixels++;
                if (tolerancedPixels >= pixelTolerance)
                    return false;
            }
        }
        return true;
    }
    static getColorDistance(rgba1: Uint8Array, rgba2: Uint8Array) {
        return Math.sqrt(
            Math.pow(rgba1[0] - rgba2[0], 2)
            + Math.pow(rgba1[1] - rgba2[1], 2)
            + Math.pow(rgba1[2] - rgba2[2], 2)
        );
    }
}

//function equalWidth(a: ImageData, b: ImageData) {
//    return a.width === b.width;
//}
//function equalHeight(a: ImageData, b: ImageData) {
//    return a.height === b.height;
//}
//function equalDimensions(a: ImageData, b: ImageData) {
//    return equalHeight(a, b) && equalWidth(a, b);
//}
//function equal(a: ImageData, b: ImageData, tolerance: number) {

//    var
//        aData = a.data,
//        bData = b.data,
//        length = aData.length,
//        i;

//    tolerance = tolerance || 0;

//    if (!equalDimensions(a, b)) return false;
//    for (i = length; i--;) if (aData[i] !== bData[i] && Math.abs(aData[i] - bData[i]) > tolerance) return false;

//    return true;
//}
addEventListener('message', (e: MessageEvent) => {
    if (e.data.type === "equal") {
        postMessage({
            type: "equality",
            isEqual: ImageEquality.isEqual(e.data.data1, e.data.data2, e.data.colorTolerance, e.data.pixelTolerance),
            time: e.data.time
        }, null);
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