interface Point {
    x: number;
    y: number;
}

class PointPresenter {
    private _svgns = "http://www.w3.org/2000/svg";
    areaPresenter: SVGSVGElement;
    private _svgPoints = ArrayExtensions.from<SVGCircleElement>({ length: 2 }, () => this._createShape());
    private _eventSubscriptions: { [name: string]: EventPromise.EventSubscription } = {};

    private _pointRelativities = ArrayExtensions.from<Point>({ length: 2 }, () => ({ x: 0, y: 0 }));
    private _sizeRelativity: SizeRelativity;

    constructor(public panel: HTMLElement, public targetElement: HTMLElement) {
        var areaPresenter = this.areaPresenter = <SVGSVGElement>document.createElementNS(this._svgns, "svg");
        targetElement.parentElement.appendChild(areaPresenter);
        this._eventSubscriptions["pointerup"] = EventPromise.subscribeEvent(panel, "pointerup", this._pointerup);
    }

    private _pointerup(e: PointerEvent) {
        var svgPoint = this._svgPoints.shift();
        var pointRelativity = this._pointRelativities.shift();
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        

        svgPoint.style.display = '';
        this._svgPoints.push(svgPoint);
        this._pointRelativities.push(pointRelativity);
    }

    private _forceInRange(value: number, min: number, rangeLength: number) {
        return Math.min(Math.max(value, min), min + rangeLength);
    }

    private _createShape() {
        var shape = <SVGCircleElement>document.createElementNS(this._svgns, "circle");
        shape.r.baseVal.value = 10;
        shape.style.fill = "green";
        shape.style.opacity = "0.8";
        shape.style.display = "hidden";
        return shape;
    }
    getPoints() {
        var points: Point[];
        for (var i in this._pointRelativities) {
            var point = this._svgPoints[i];
            points[i] = {
                x: this._sizeRelativity.getAbsoluteX(this._pointRelativities[i].x),
                y: this._sizeRelativity.getAbsoluteY(this._pointRelativities[i].y)
            }
        }
        return points;
    }

    close() {
        for (var subscriptionName in this._eventSubscriptions)
            this._eventSubscriptions[subscriptionName].cease({ silently: true });
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    }
}