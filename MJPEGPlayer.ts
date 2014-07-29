class MJPEGPlayer implements VideoPlayable {
    private _src: MJPEGVideo = null;
    private _srcUrl: string;
    private _element: HTMLImageElement;
    get element() {
        if (!this._element) {
            this._element = document.createElement("img");
            (<any>this._element).player = this;
        }
        return this._element;
    }
    get src() {
        return this._srcUrl; // _src.blob is not immediately available after setting src property
    }
    set src(url: string) {
        this.pause();
        this._src = null;
        this._srcUrl = url;
            
        if (url.length > 0)
            this._getBlobFromUrl(url)
                .then((blob) => MJPEGReader.read(blob))
                .then((video) => {
                    this._src = video;
                });
        else {
            this._currentVideoTime = -1; // blocks further rendering
            this.element.src = ""; // clear image element
        }
    }
    private _getBlobFromUrl(url: string) {
        return new Promise<Blob>((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onload = (e) => {
                resolve(xhr.response);
            };
            xhr.open("GET", url);
            xhr.responseType = "blob"; 
            xhr.send();
        });
    }

    /** Stops playing when set to true, automatically returning to false */
    private _playSessionToken: { stop: boolean; } = null;
    private _currentVideoTime = -1;
    get currentTime() {
        return Math.max(this._currentVideoTime, 0);
    }
    set currentTime(time: number) {
        this._show(time);
    }

    private _show(time: number) {
        this._currentVideoTime = time;
        return this._src.getFrameByTime(time).then((frame) => {
            if (this._currentVideoTime == time) // show it only when no other frames are requested after this one
                this.element.src = URL.createObjectURL(frame, { oneTimeOnly: true });
        }, function () { });
    }
    private _waitToPlay() {
        return new Promise<void>((resolve, reject) => {
            var next = () => {
                if (this._src)
                    return resolve(undefined);
                if (this._playSessionToken.stop)
                    return reject(new Error("Play cancelled"));

                promiseImmediate().then(next);
            };
            next();
        });
    }
    play() {
        var token = this._playSessionToken = { stop: false };

        this._waitToPlay().then(() => {
            var referenceTime = Date.now() / 1000;
            var referenceVideoTime = this._currentVideoTime;

            var next = () => {
                if (token.stop)
                    return;

                var targetTime = referenceVideoTime + Date.now() / 1000 - referenceTime;
                if (targetTime - this._currentVideoTime > 0.1) { // is there too much delay?
                    referenceTime = Date.now() / 1000; // reset the reference to the current time
                    referenceVideoTime = this._currentVideoTime;
                    targetTime = referenceVideoTime + 0.1; // limit the delay to 0.1 s (100 ms)
                }
                if (targetTime < this._src.duration)
                    this._show(targetTime).then(promiseImmediate).then(next);
                else
                    this._show(this._src.duration);
            };
            promiseImmediate().then(next);
        });
    }
    pause() {
        if (this._playSessionToken) {
            this._playSessionToken.stop = true;
            this._playSessionToken = null;
        }
    }

    get videoWidth() {
        if (this._src)
            return this._src.width;
        else
            return 0;
    }
    get videoHeight() {
        if (this._src)
            return this._src.height;
        else
            return 0;
    }
}

interface VideoPlayable {
    src: string;
    play(): void;
    pause(): void;
    currentTime: number;

    videoWidth: number;
    videoHeight: number;
}