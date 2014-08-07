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
}