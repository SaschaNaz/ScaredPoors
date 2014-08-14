module VideoElementExtension {
    export function waitMetadata(video: VideoPlayable) {
        if (video.duration)
            return Promise.resolve<void>();

        return new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.onloadedmetadata = null;
                resolve(undefined);
            };
        });
    }
    export function seekFor(video: VideoPlayable, time: number) {
        return new Promise<void>((resolve, reject) => {
            videoControl.onseeked = () => {
                videoControl.onseeked = null;
                resolve(undefined);
            };
            videoControl.currentTime = time;
        });
    }
}