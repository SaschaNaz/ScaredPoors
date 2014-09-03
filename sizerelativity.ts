class SizeRelativity {
    constructor(public target?: Element) {
    }
    
    getRelativeX(ax: number) {
        return ax / this.target.clientWidth;
    }
    getRelativeY(ay: number) {
        return ay / this.target.clientHeight;
    }
    getAbsoluteX(rx: number) {
        return rx * this.target.clientWidth;
    }
    getAbsoluteY(ry: number) {
        return ry * this.target.clientWidth;
    }
}