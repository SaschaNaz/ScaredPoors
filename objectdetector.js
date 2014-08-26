var ObjectDetector = (function () {
    function ObjectDetector() {
    }
    ObjectDetector.prototype.detect = function (imageData, brightness, brightnessLimit) {
        //var binary = new BinaryMap();
    };
    ObjectDetector.prototype._getActivationValue = function (imageData, offset) {
    };
    ObjectDetector.prototype._getBinaryMap = function (imageData, brightness, brightnessLimit) {
    };
    return ObjectDetector;
})();
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
//# sourceMappingURL=objectdetector.js.map
