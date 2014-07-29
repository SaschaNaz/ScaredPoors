//https://developer.mozilla.org/en-US/docs/HTML/Manipulating_video_using_canvas?redirectlocale=en-US&redirectslug=Manipulating_video_using_canvas
var ScaredPoors = (function () {
    function ScaredPoors() {
        this.internalCanvas = document.createElement("canvas");
        this.internalCanvasContext = this.internalCanvas.getContext("2d");
    }
    ScaredPoors.prototype.startAnalysis = function (video, onanalyze) {
        var _this = this;
        this.loadedVideo = video;
        this.onanalyze = onanalyze;
        this.loadedVideo.addEventListener("play", function () {
            _this.internalCanvas.width = video.videoWidth;
            _this.internalCanvas.height = video.videoHeight;
            _this.callback();
        });
    };
    ScaredPoors.prototype.stopAnalysis = function () {
        this.loadedVideo.removeEventListener("play", this.callback.bind(this));
        this.loadedVideo = null;
    };

    ScaredPoors.prototype.callback = function () {
        if (this.loadedVideo.paused || this.loadedVideo.ended)
            return;

        this.internalCanvasContext.drawImage(this.loadedVideo, 0, 0, this.loadedVideo.videoWidth, this.loadedVideo.videoHeight);
        this.onanalyze(this.loadedVideo.currentTime, this.internalCanvasContext.getImageData(0, 0, this.loadedVideo.videoWidth, this.loadedVideo.videoHeight));

        if (this.loadedVideo)
            window.setImmediate(this.callback.bind(this));
    };
    return ScaredPoors;
})();
//# sourceMappingURL=scaredpoors.js.map
