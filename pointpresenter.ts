class PointPresenter {
    private _svgns = "http://www.w3.org/2000/svg";
    areaPresenter: SVGSVGElement;
    constructor(public panel: HTMLElement, public targetElement: HTMLElement, areaClassName?: string) {
        var areaPresenter = this.areaPresenter = <SVGSVGElement>document.createElementNS(this._svgns, "svg");
    }

    createShape() {
        var shape = <SVGCircleElement>document.createElementNS(this._svgns, "circle");
        shape.cx.baseVal.value = 20;
        shape.cy.baseVal.value = 20;
        shape.r.baseVal.value = 20;
        shape.style.fill = "green";
        return shape;
    }
}