"use strict";
var MJPEGReader = (function () {
    function MJPEGReader() {
    }
    MJPEGReader.prototype.read = function (file, frameRate, onframeread) {
        var _this = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var arraybuffer = e.target.result;
            var array = new Uint8Array(arraybuffer);
            var nextIndex = 0;
            var currentFrame = -1;
            var frames = [];
            while (true) {
                var startIndex = _this.findStartIndex(array, nextIndex);
                if (startIndex == -1)
                    break;
                var finishIndex = _this.findFinishIndex(array, startIndex);
                if (finishIndex == -1)
                    throw new Error("Parser could not finish its operation: frame bound not found");

                currentFrame++;
                nextIndex = finishIndex;

                frames.push({ currentTime: currentFrame / frameRate, jpegArrayData: array.subarray(startIndex, finishIndex) });
            }
            onframeread({ frameRate: frameRate, frameDataList: frames });
            delete arraybuffer;
        };
        reader.readAsArrayBuffer(file);
    };

    MJPEGReader.prototype.findStartIndex = function (array, index) {
        var nextIndex = index;
        while (true) {
            var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
            if (startIndex == -1)
                return -1;
            else if (array[startIndex + 1] == 0xD8)
                return startIndex;
            nextIndex = startIndex + 1;
        }
    };

    MJPEGReader.prototype.findFinishIndex = function (array, index) {
        var nextIndex = index;
        while (true) {
            var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
            if (startIndex == -1)
                return -1;
            else if (array[startIndex + 1] == 0xD9)
                return startIndex + 2;
            nextIndex = startIndex + 1;
        }
    };

    MJPEGReader.prototype.findMarker = function (array, index) {
        var nextIndex = index;
        while (true) {
            var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
            if (startIndex == -1)
                return null;
            else {
                var following = array[startIndex + 1];
                if (following >= 0xC0 && following <= 0xFE)
                    return { index: startIndex, type: following };
            }
            nextIndex = startIndex + 1;
        }
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
