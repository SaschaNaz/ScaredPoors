"use strict";
var MJPEGReader = (function () {
    function MJPEGReader() {
    }
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
    MJPEGReader.read = function (file, onread) {
        var _this = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var arraybuffer = e.target.result;
            var array = new Uint8Array(arraybuffer);

            _this._readRiff(array);
        };
        reader.readAsArrayBuffer(file);
    };

    MJPEGReader._readRiff = function (array) {
        var riff = this._getTypedData(array, "RIFF");
        if (riff.type !== "AVI ")
            throw new Error("Incorrect Format");
        var hdrlList = this._readHdrl(riff.data);
        var moviList = this._readMovi(riff.data.subarray(12 + hdrlList.dataLength));
    };

    MJPEGReader._readHdrl = function (array) {
        var hdrlList = this._getTypedData(array, "LIST");
        if (hdrlList.type !== "hdrl")
            throw new Error("Incorrect Format");

        var mainHeader = this._readAVIMainHeader(hdrlList.data);
        return { dataLength: hdrlList.data.byteLength, mainHeader: mainHeader };
    };

    MJPEGReader._readAVIMainHeader = function (array) {
        if (this._getFourCC(array, 0) !== "avih")
            throw new Error("Incorrect Format");
        var headerArray = array.subarray(8, 8 + this._getLittleEndianedDword(array, 4));

        return {
            frameIntervalMicroseconds: this._getLittleEndianedDword(headerArray, 0),
            totalFrames: this._getLittleEndianedDword(headerArray, 16),
            width: this._getLittleEndianedDword(headerArray, 32),
            height: this._getLittleEndianedDword(headerArray, 36)
        };
    };

    MJPEGReader._readMovi = function (array) {
        var moviList = this._getTypedData(array, "LIST");
        if (moviList.type !== "movi")
            throw new Error("Incorrect Format");
    };

    MJPEGReader._getTypedData = function (array, structureName) {
        var name = this._getFourCC(array, 0);
        if (name === structureName)
            return {
                type: this._getFourCC(array, 8),
                data: array.subarray(12, 8 + this._getLittleEndianedDword(array, 4))
            };
        else if (name === "JUNK") {
            var junkLength = 8 + this._getLittleEndianedDword(array, 4);
            return this._getTypedData(array.subarray(junkLength), structureName);
        } else
            throw new Error("Incorrect Format");
    };

    MJPEGReader._findMarker = function (array, type, index) {
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
    };

    MJPEGReader._getFourCC = function (array, index) {
        return String.fromCharCode.apply(null, array.subarray(index, index + 4));
    };

    MJPEGReader._getLittleEndianedDword = function (array, index) {
        var dword = 0;
        for (var i = 0; i < 4; i++)
            dword += array[index + i] * Math.pow(256, i);
        return dword;
    };
    return MJPEGReader;
})();

var MJPEG = (function () {
    function MJPEG() {
    }
    Object.defineProperty(MJPEG.prototype, "framePerSecond", {
        get: function () {
            return 1 / this.frameInterval;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(MJPEG.prototype, "duration", {
        get: function () {
            return this.totalFrames * this.frameInterval;
        },
        enumerable: true,
        configurable: true
    });

    MJPEG.prototype.getFrame = function (index) {
    };
    return MJPEG;
})();
//# sourceMappingURL=mjpegreader.js.map
