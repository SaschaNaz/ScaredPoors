"use strict";

interface MJPEGFrameData {
    currentTime: number;
    jpegArrayData: Uint8Array;
    //jpegStartIndex: number;
    //jpegFinishIndex: number;
}
interface MJPEGData {//to be obsolete
    frameRate: number;
    frameDataList: MJPEGFrameData[];
}
interface TypedData {
    type: string;
    data: Uint8Array;
}
interface AVIMainHeader {
    frameIntervalMicroseconds: number;
    totalFrames: number;
    width: number;
    height: number;
}
class MJPEGReader {
    //read(file: File, frameRate: number, onframeread: (loadedData: MJPEGData) => any) {
    //    var reader = new FileReader();
    //    reader.onload = (e) => {
    //        var arraybuffer: ArrayBuffer = e.target.result;
    //        var array = new Uint8Array(arraybuffer);
    //        var nextIndex = 0;
    //        var currentFrame = -1;
    //        var frames: MJPEGFrameData[] = [];
    //        while (true) {
    //            var startIndex = this.findStartIndex(array, nextIndex);
    //            if (startIndex == -1)
    //                break;
    //            var finishIndex = this.findFinishIndex(array, startIndex);
    //            if (finishIndex == -1)
    //                throw new Error("Parser could not finish its operation: frame bound not found");

    //            currentFrame++;
    //            nextIndex = finishIndex;

    //            frames.push({ currentTime: currentFrame / frameRate, jpegArrayData: array.subarray(startIndex, finishIndex) });
    //        }
    //        onframeread({ frameRate: frameRate, frameDataList: frames }); 
    //        delete arraybuffer;
    //    }
    //    reader.readAsArrayBuffer(file);
    //}

    //private findStartIndex(array: Uint8Array, index: number) {
    //    var nextIndex = index;
    //    while (true) {
    //        var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
    //        if (startIndex == -1)
    //            return -1;
    //        else if (array[startIndex + 1] == 0xD8)
    //            return startIndex;
    //        nextIndex = startIndex + 1;
    //    }
    //}

    //private findFinishIndex(array: Uint8Array, index: number) {
    //    var nextIndex = index;
    //    while (true) {
    //        var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
    //        if (startIndex == -1)
    //            return -1;
    //        else if (array[startIndex + 1] == 0xD9)
    //            return startIndex + 2;
    //        nextIndex = startIndex + 1;
    //    }
    //}

    static read(file: Blob, onread: (mjpeg: MJPEG) => any) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var arraybuffer: ArrayBuffer = e.target.result;
            var array = new Uint8Array(arraybuffer);

            this._readRiff(array);
        }
        reader.readAsArrayBuffer(file);
    }

    private static _readRiff(array: Uint8Array) {
        var riff = this._getTypedData(array, "RIFF");
        if (riff.type !== "AVI ")
            throw new Error("Incorrect Format");
        var hdrlList = this._readHdrl(riff.data);
        var moviList = this._readMovi(riff.data.subarray(12 + hdrlList.dataLength));
    }

    private static _readHdrl(array: Uint8Array) {
        var hdrlList = this._getTypedData(array, "LIST");
        if (hdrlList.type !== "hdrl")
            throw new Error("Incorrect Format");

        var mainHeader = this._readAVIMainHeader(hdrlList.data);
        return { dataLength: hdrlList.data.byteLength, mainHeader: mainHeader }
    }

    private static _readAVIMainHeader(array: Uint8Array) {
        if (this._getFourCC(array, 0) !== "avih")
            throw new Error("Incorrect Format");
        var headerArray = array.subarray(8, 8 + this._getLittleEndianedDword(array, 4))

        return <AVIMainHeader>{
            frameIntervalMicroseconds: this._getLittleEndianedDword(headerArray, 0),
            totalFrames: this._getLittleEndianedDword(headerArray, 16),
            width: this._getLittleEndianedDword(headerArray, 32),
            height: this._getLittleEndianedDword(headerArray, 36)
        };
    }

    private static _readMovi(array: Uint8Array) {
        var moviList = this._getTypedData(array, "LIST");
        if (moviList.type !== "movi")
            throw new Error("Incorrect Format");

    }

    private static _getTypedData(array: Uint8Array, structureName: string) {
        var name = this._getFourCC(array, 0);
        if (name === structureName)
            return <TypedData>{
                type: this._getFourCC(array, 8),
                data: array.subarray(12, 8 + this._getLittleEndianedDword(array, 4))
            };
        else if (name === "JUNK") {
            var junkLength = 8 + this._getLittleEndianedDword(array, 4);
            return this._getTypedData(array.subarray(junkLength), structureName);
        }
        else
            throw new Error("Incorrect Format");
    }

    private static _findMarker(array: Uint8Array, type: number, index: number) {
        var nextIndex = index;
        while (true) {
            var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
            if (startIndex == -1)
                return -1;
            else {
				var following = array[startIndex + 1];
                if (following == type)
                    return startIndex;
            }
            nextIndex = startIndex + 1;
        }
    }

    private static _getFourCC(array: Uint8Array, index: number) {
        return String.fromCharCode.apply(null, array.subarray(index, index + 4))
    }

    private static _getLittleEndianedDword(array: Uint8Array, index: number) {
        var dword = 0;
        for (var i = 0; i < 4; i++)
            dword += array[index + i] * Math.pow(256, i);
        return dword;
    }
}

class MJPEG {
    frameInterval: number;//seconds. Please convert it from microseconds
    get framePerSecond() {
        return 1 / this.frameInterval;
    }
    totalFrames: number;
    get duration() {
        return this.totalFrames * this.frameInterval;
    }
    width: number;
    height: number;
    private frames: MJPEGFrameData[];

    getFrame(index: number) {

    }
}