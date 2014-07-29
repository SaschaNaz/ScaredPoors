//https://developer.mozilla.org/en-US/docs/HTML/Manipulating_video_using_canvas?redirectlocale=en-US&redirectslug=Manipulating_video_using_canvas

class ScaredPoors {
    private loadedVideo: HTMLVideoElement;
    private onanalyze: (currentTime: number, imageData: ImageData) => any;
    private internalCanvas: HTMLCanvasElement;
    private internalCanvasContext: CanvasRenderingContext2D;

    constructor() {
        this.internalCanvas = document.createElement("canvas");
        this.internalCanvasContext = this.internalCanvas.getContext("2d");
    }

    startAnalysis(video: HTMLVideoElement, onanalyze: (currentTime: number, imageData: ImageData) => any) {
        this.loadedVideo = video;
        this.onanalyze = onanalyze;
        this.loadedVideo.addEventListener("play", () => {
            this.internalCanvas.width = video.videoWidth;
            this.internalCanvas.height = video.videoHeight;
            this.callback();
        });
    }
    stopAnalysis() {
        this.loadedVideo.removeEventListener("play", this.callback.bind(this));
        this.loadedVideo = null;
    }

    private callback() {
        if (this.loadedVideo.paused || this.loadedVideo.ended)
            return;

        this.internalCanvasContext.drawImage(this.loadedVideo, 0, 0, this.loadedVideo.videoWidth, this.loadedVideo.videoHeight);
        this.onanalyze(this.loadedVideo.currentTime, this.internalCanvasContext.getImageData(0, 0, this.loadedVideo.videoWidth, this.loadedVideo.videoHeight));

        if (this.loadedVideo)
            window.setImmediate(this.callback.bind(this));
    }
} 