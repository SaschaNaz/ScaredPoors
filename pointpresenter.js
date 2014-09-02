var PointPresenter = (function () {
    function PointPresenter(panel, targetElement, areaClassName) {
        this.panel = panel;
        this.targetElement = targetElement;
        this._svgns = "http://www.w3.org/2000/svg";
        var areaPresenter = this.areaPresenter = document.createElementNS(this._svgns, "svg");
    }
    PointPresenter.prototype.createShape = function () {
        var shape = document.createElementNS(this._svgns, "circle");
        shape.cx.baseVal.value = 20;
        shape.cy.baseVal.value = 20;
        shape.r.baseVal.value = 20;
        shape.style.fill = "green";
        return shape;
    };
    return PointPresenter;
})();
//# sourceMappingURL=pointpresenter.js.map
