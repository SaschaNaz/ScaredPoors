var MJPEGPlayer = (function () {
    function MJPEGPlayer() {
        this._src = null;
        /** Stops playing when set to true, automatically returning to false */
        this._playSessionToken = null;
        this._currentVideoTime = -1;
    }
    Object.defineProperty(MJPEGPlayer.prototype, "element", {
        get: function () {
            if (!this._element) {
                this._element = document.createElement("img");
                this._element.player = this;
            }
            return this._element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MJPEGPlayer.prototype, "src", {
        get: function () {
            return this._srcUrl;
        },
        set: function (url) {
            var _this = this;
            this.pause();
            this._src = null;
            this._srcUrl = url;

            if (url.length > 0)
                this._getBlobFromUrl(url).then(function (blob) {
                    return MJPEGReader.read(blob);
                }).then(function (video) {
                    _this._src = video;
                    //if (this.onloadstart)
                    //    this.onloadstart(this._createEvent());
                });
            else {
                this._currentVideoTime = -1; // blocks further rendering
                this.element.src = ""; // clear image element
            }
        },
        enumerable: true,
        configurable: true
    });
    MJPEGPlayer.prototype._getBlobFromUrl = function (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function (e) {
                resolve(xhr.response);
            };
            xhr.open("GET", url);
            xhr.responseType = "blob";
            xhr.send();
        });
    };

    Object.defineProperty(MJPEGPlayer.prototype, "currentTime", {
        get: function () {
            return Math.max(this._currentVideoTime, 0);
        },
        set: function (time) {
            var _this = this;
            this._waitToPlay().then(function () {
                return _this._show(time);
            }).then(function () {
                if (_this.onseeked)
                    _this.onseeked(_this._createEvent());
            });
        },
        enumerable: true,
        configurable: true
    });

    MJPEGPlayer.prototype._show = function (time) {
        var _this = this;
        this._currentVideoTime = time;
        return this._src.getFrameByTime(time).then(function (frame) {
            if (_this._currentVideoTime == time)
                _this.element.src = URL.createObjectURL(frame, { oneTimeOnly: true });
        }, function () {
        });
    };
    MJPEGPlayer.prototype._waitToPlay = function () {
        var _this = this;
        var source = this._srcUrl;
        return new Promise(function (resolve, reject) {
            var next = function () {
                if (_this._src)
                    return resolve(undefined);
                if (source !== _this._srcUrl)
                    return reject(new Error("Play cancelled"));

                promiseImmediate().then(next);
            };
            next();
        });
    };
    MJPEGPlayer.prototype.play = function () {
        var _this = this;
        var token = this._playSessionToken = { stop: false };

        this._waitToPlay().then(function () {
            var referenceTime = Date.now() / 1000;
            var referenceVideoTime = _this._currentVideoTime;

            var next = function () {
                if (token.stop)
                    return;

                var targetTime = referenceVideoTime + Date.now() / 1000 - referenceTime;
                if (targetTime - _this._currentVideoTime > 0.1) {
                    referenceTime = Date.now() / 1000; // reset the reference to the current time
                    referenceVideoTime = _this._currentVideoTime;
                    targetTime = referenceVideoTime + 0.1; // limit the delay to 0.1 s (100 ms)
                }
                if (targetTime < _this._src.duration)
                    _this._show(targetTime).then(promiseImmediate).then(next);
                else
                    _this._show(_this._src.duration);
            };
            promiseImmediate().then(next);
        });
    };
    MJPEGPlayer.prototype.pause = function () {
        if (this._playSessionToken) {
            this._playSessionToken.stop = true;
            this._playSessionToken = null;
        }
    };

    Object.defineProperty(MJPEGPlayer.prototype, "videoWidth", {
        get: function () {
            if (this._src)
                return this._src.width;
            else
                return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MJPEGPlayer.prototype, "videoHeight", {
        get: function () {
            if (this._src)
                return this._src.height;
            else
                return 0;
        },
        enumerable: true,
        configurable: true
    });

    MJPEGPlayer.prototype._createEvent = function () {
        return {
            bubbles: false,
            cancelable: false,
            cancelBubble: false,
            currentTarget: this,
            defaultPrevented: false,
            eventPhase: 2,
            isTrusted: true,
            target: this,
            timeStamp: Date.now(),
            type: "load"
        };
    };
    return MJPEGPlayer;
})();
//# sourceMappingURL=mjpegplayer.js.map
