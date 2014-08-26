class ObjectDetector {
    detect(imageData: ImageData, brightness: number, brightnessLimit: number) {
        //var binary = new BinaryMap();
    }
    private _getActivationValue(imageData: ImageData, offset: number[]) {

        
    }
    private _getBinaryMap(imageData: ImageData, brightness: number, brightnessLimit: number) {
        
    }
}

//class BinaryMap {
//    database: number[] = [];
//    last = 0;
//    length = 0;
//    push(isOne: boolean) {
//        if (this.length > 0 && this.length % 32 == 0) {
//            this.database.push(this.last);
//            this.last = 0;
//        }
//        this.length++;
//        this.last << 1;
//        this.last += isOne ? 1 : 0;
//    }
//    pop() {
//        if (this.length < 0)
//            throw new Error("No data to be popped.");

//        if (this.length % 32 == 0)
//            this.last = this.database.pop();

//        this.length--;
//        var popped = this.last & 1;
//        this.last >> 1;
//        return popped;

//    }
//}