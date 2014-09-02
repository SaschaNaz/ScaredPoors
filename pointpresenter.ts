class PointPresenter {
    private _svgns = "http://www.w3.org/2000/svg";
    areaPresenter: SVGSVGElement;
    private _points = [this._createShape(), this._createShape() ];
    private _eventSubscriptions: { [name: string]: EventPromise.EventSubscription } = {};

    constructor(public panel: HTMLElement, public targetElement: HTMLElement) {
        var areaPresenter = this.areaPresenter = <SVGSVGElement>document.createElementNS(this._svgns, "svg");
        targetElement.parentElement.appendChild(areaPresenter);
        this._eventSubscriptions["pointerup"] = EventPromise.subscribeEvent(panel, "pointerup", this._pointerup);
    }

    private _pointerup(e: PointerEvent) {
        var point = this._points.shift();
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        point.style.display = '';
        this._points.push(point);
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

    close() {
        for (var subscriptionName in this._eventSubscriptions)
            this._eventSubscriptions[subscriptionName].cease({ silently: true });
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    }
}