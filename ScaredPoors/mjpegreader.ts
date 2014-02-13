interface MJPEGFrameData {
    currentTime: number;
    jpegStartIndex: number;
    jpegFinishIndex: number;
}
interface MJPEGData {
    frameRate: number;
    frameDataList: MJPEGFrameData[];
}
class MJPEGReader {
    read(arraybuffer: ArrayBuffer, frameRate: number, onframeread: (loadedData: MJPEGData) => any) {
        //var reader = new FileReader();
        //reader.onload = (e) => {
            //var arraybuffer: ArrayBuffer = e.target.result;
            var array = new Uint8Array(arraybuffer);
            var nextIndex = 0;
            var currentFrame = -1;
            var frames: MJPEGFrameData[] = [];
            while (true) {
                var startIndex = this.findStartIndex(array, nextIndex);
                if (startIndex == -1)
                    break;
                var finishIndex = this.findFinishIndex(array, startIndex);
                if (finishIndex == -1)
                    throw new Error("Parser could not finish its operation: frame bound not found");

                currentFrame++;
                nextIndex = finishIndex;

                frames.push({ currentTime: currentFrame / frameRate, jpegStartIndex: startIndex, jpegFinishIndex: finishIndex });
            }
            onframeread({ frameRate: frameRate, frameDataList: frames }); 
        //}
        //reader.readAsArrayBuffer(file);
    }

    private findStartIndex(array: Uint8Array, index: number) {
        var nextIndex = index;
        while (true) {
            var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
            if (startIndex == -1)
                return -1;
            else if (array[startIndex + 1] == 0xD8)
                return startIndex;
            nextIndex = startIndex + 1;
        }
    }

    private findFinishIndex(array: Uint8Array, index: number) {
        var nextIndex = index;
        while (true) {
            var startIndex = Array.prototype.indexOf.apply(array, [0xFF, nextIndex]);
            if (startIndex == -1)
                return -1;
            else if (array[startIndex + 1] == 0xD9)
                return startIndex + 2;
            nextIndex = startIndex + 1;
        }
    }
} 