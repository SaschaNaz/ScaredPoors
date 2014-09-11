var SizeRelativity = (function () {
    function SizeRelativity(target) {
        this.target = target;
    }
    SizeRelativity.prototype.getRelativeX = function (ax) {
        return ax / this.target.clientWidth;
    };
    SizeRelativity.prototype.getRelativeY = function (ay) {
        return ay / this.target.clientHeight;
    };
    SizeRelativity.prototype.getAbsoluteX = function (rx) {
        return rx * this.target.clientWidth;
    };
    SizeRelativity.prototype.getAbsoluteY = function (ry) {
        return ry * this.target.clientHeight;
    };
    return SizeRelativity;
})();
//# sourceMappingURL=sizerelativity.js.map
