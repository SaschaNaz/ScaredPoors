interface Point {
    x: number;
    y: number;
}

class PointPresenter {
    private _svgns = "http://www.w3.org/2000/svg";
    areaPresenter = <SVGSVGElement>document.createElementNS(this._svgns, "svg");
    private _svgPoints = ArrayExtensions.from({ length: 2 }, () => this._createShape());
    private _eventSubscriptions: { [name: string]: EventPromise.EventSubscription } = {};

    private _pointRelativities = ArrayExtensions.from({ length: 2 }, () => <Point>({ x: 0, y: 0 }));
    private _sizeRelativity: SizeRelativity;

    constructor(public panel: HTMLElement, public targetElement: HTMLElement) {
        this._sizeRelativity = new SizeRelativity(targetElement);
        targetElement.parentElement.appendChild(this.areaPresenter);
        this._eventSubscriptions["pointerup"] = EventPromise.subscribeEvent(panel, "pointerup", this._pointerup);
        this._eventSubscriptions["resize"] = EventPromise.subscribeEvent(window, "resize", this._onresize);
    }

    private _pointerup = (e: PointerEvent) => {
        var svgPoint = this._svgPoints.shift();
        var pointRelativity = this._pointRelativities.shift();
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        pointRelativity.x = this._sizeRelativity.getRelativeX(eX - this.targetElement.offsetLeft);
        pointRelativity.y = this._sizeRelativity.getRelativeY(eY - this.targetElement.offsetTop);
        svgPoint.cx.baseVal.value = eX;
        svgPoint.cy.baseVal.value = eY;
        // TODO: update pointrelativity and present circles

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
    getTargetPoints() {
        var points: Point[];
        for (var i in this._pointRelativities)
            points[i] = {
                x: this._sizeRelativity.getAbsoluteX(this._pointRelativities[i].x),
                y: this._sizeRelativity.getAbsoluteY(this._pointRelativities[i].y)
            }
        return points;
    }
    private _getPanelPoints() {
        var points = this.getTargetPoints();
        points.forEach((point) => {
            point.x += this.targetElement.offsetLeft;
            point.y += this.targetElement.offsetTop;
        });
        return points;
    }

    private _onresize = (e: UIEvent) => {
        this._draw();
    }

    private _draw() {
        var points = this._getPanelPoints();
        this._svgPoints.forEach((svgPoint, i) => {
            svgPoint.cx.baseVal.value = points[i].x;
            svgPoint.cy.baseVal.value = points[i].y;
        });
    }

    close() {
        for (var subscriptionName in this._eventSubscriptions)
            this._eventSubscriptions[subscriptionName].cease({ silently: true });
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    }
}