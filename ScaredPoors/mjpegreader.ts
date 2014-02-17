//AVI File Format http://msdn.microsoft.com/en-us/library/windows/desktop/dd318187(v=vs.85).aspx
//AVI RIFF File Reference http://msdn.microsoft.com/en-us/library/windows/desktop/dd318189(v=vs.85).aspx
//AVIMAINHEADER structure http://msdn.microsoft.com/en-us/library/windows/desktop/dd318180(v=vs.85).aspx
//AVIOLDINDEX structure http://msdn.microsoft.com/en-us/library/windows/desktop/dd318181(v=vs.85).aspx
//BITMAPINFOHEADER structure http://msdn.microsoft.com/en-us/library/windows/desktop/dd318229(v=vs.85).aspx
"use strict";

interface TypedData {
    name: string;
    data: Uint8Array;
}
interface AVIMainHeader {
    frameIntervalMicroseconds: number;
    totalFrames: number;
    width: number;
    height: number;
}
interface AVIOldIndex {
    byteOffset: number;
    byteLength: number;
}
interface EqualityData {
    currentTime: number;
    isEqual: boolean;
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

            var aviMJPEG = this._readRiff(array);
            var mjpeg = new MJPEG();
            mjpeg.frameInterval = aviMJPEG.mainHeader.frameIntervalMicroseconds / 1e6;
            mjpeg.totalFrames = aviMJPEG.mainHeader.totalFrames;
            mjpeg.width = aviMJPEG.mainHeader.width;
            mjpeg.height = aviMJPEG.mainHeader.height;
            mjpeg.frames = aviMJPEG.JPEGs;
            onread(mjpeg);
        }
        reader.readAsArrayBuffer(file);
    }

    private static _readRiff(array: Uint8Array) {
        var riff = this._getTypedData(array, "RIFF", "AVI ");
        var targetDataArray = riff;
        var hdrlList = this._readHdrl(targetDataArray);
        targetDataArray = array.subarray(hdrlList.dataArray.byteOffset + hdrlList.dataArray.byteLength);
        var moviList = this._readMovi(targetDataArray);
        targetDataArray = array.subarray(moviList.dataArray.byteOffset + moviList.dataArray.byteLength);//JUNK safe subarray
        var indexes = this._readAVIIndex(targetDataArray);
        var exportedJPEG = this._exportJPEG(moviList.dataArray, indexes);

        return { mainHeader: hdrlList.mainHeader, JPEGs: exportedJPEG };
    }

    private static _readHdrl(array: Uint8Array) {
        var hdrlList = this._getTypedData(array, "LIST", "hdrl");

        var mainHeader = this._readAVIMainHeader(hdrlList);
        return { dataArray: hdrlList, mainHeader: mainHeader }
    }

    private static _readAVIMainHeader(array: Uint8Array) {
        //if (this._getFourCC(array, 0) !== "avih")
        //    throw new Error("Incorrect Format");
        var headerArray = this._getNonTypedData(array, "avih");//array.subarray(8, 8 + this._getLittleEndianedDword(array, 4))

        return <AVIMainHeader>{
            frameIntervalMicroseconds: this._getLittleEndianedDword(headerArray, 0),
            totalFrames: this._getLittleEndianedDword(headerArray, 16),
            width: this._getLittleEndianedDword(headerArray, 32),
            height: this._getLittleEndianedDword(headerArray, 36)
        };
    }

    private static _readMovi(array: Uint8Array) {
        var moviList = this._getTypedData(array, "LIST", "movi");
        return { dataArray: moviList };
    }

    private static _readAVIIndex(array: Uint8Array) {
        var indexData = this._getNonTypedData(array, "idx1");
        var indexes: AVIOldIndex[] = [];
        for (var i = 0; i < indexData.byteLength / 16; i += 1) {
            var offset = this._getLittleEndianedDword(indexData, i * 16 + 8);
            var length = this._getLittleEndianedDword(indexData, i * 16 + 12);
            if (length > 0)
                indexes[i] = { byteOffset: offset - 4, byteLength: length };//ignoring 'movi' string
        }
        return indexes;
    }

    private static _exportJPEG(moviList: Uint8Array, indexes: AVIOldIndex[]) {
        var JPEGs: Uint8Array[] = [];
        for (var i = 0; i < indexes.length; i++) {
            if (indexes[i])
                JPEGs[i] = moviList.subarray(indexes[i].byteOffset + 8, indexes[i].byteOffset + 8 + indexes[i].byteLength);
        }
        return JPEGs;
    }

    private static _getTypedData(array: Uint8Array, structureType: string, dataName: string): Uint8Array {
        var type = this._getFourCC(array, 0);
        if (type === structureType) {
            var name = this._getFourCC(array, 8);
            if (name === dataName)
                return array.subarray(12, 8 + this._getLittleEndianedDword(array, 4));
            else 
                throw new Error("Different data name is detected.");
        }
        else if (type === "JUNK") {
            var junkLength = 8 + this._getLittleEndianedDword(array, 4);
            return this._getTypedData(array.subarray(junkLength), structureType, dataName);
        }
        else
            throw new Error("Incorrect Format");
    }
    private static _getNonTypedData(array: Uint8Array, dataName: string): Uint8Array {
        var name = this._getFourCC(array, 0);
        if (name == dataName)
            return array.subarray(8, 4 + this._getLittleEndianedDword(array, 4));
        else if (name === "JUNK") {
            var junkLength = 8 + this._getLittleEndianedDword(array, 4);
            return this._getNonTypedData(array.subarray(junkLength), dataName);
        }
        else
            throw new Error("Different data name is detected.");
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
    frames: Uint8Array[];

    getFrame(index: number) {
        var i = index;
        while (i >= 0) {
            if (this.frames[i])
                return this.frames[i];
            else
                i--;
        }
        return;
    }
    getFrameByTime(time: number) {
        return this.getFrame(this.totalFrames * time / this.duration);
    }
}