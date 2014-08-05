var FreezingManager = (function () {
    function FreezingManager() {
        this._continuousFreezing = [];
        this._movedLastTime = false;
        this._lastFreezing = null;
        this.minimalDuration = 1.5;
    }
    FreezingManager.prototype.loadOccurrence = function (occurrence) {
        if (!occurrence.isOccured) {
            this._presentStopping(false);
            this._presentFreezing(false);
            this._movedLastTime = true;
            return;
        }

        if (this._movedLastTime) {
            this._presentStopping(true);
            if (this._lastFreezing) {
                this._lastFreezing.duration = this._lastFreezing.end - this._lastFreezing.start;
                if (this._lastFreezing.duration < this.minimalDuration)
                    this._continuousFreezing.pop();
            }
            this._lastFreezing = { start: occurrence.watched, end: occurrence.judged };
            this._continuousFreezing.push(this._lastFreezing);
        } else {
            this._lastFreezing.end = occurrence.judged;
            if (this._lastFreezing.end - this._lastFreezing.start >= this.minimalDuration)
                this._presentFreezing(true);
        }

        this._movedLastTime = false;
    };

    FreezingManager.prototype._presentStopping = function (stopping) {
    };

    FreezingManager.prototype._presentFreezing = function (freezing) {
    };
    return FreezingManager;
})();
//# sourceMappingURL=freezingmanager.js.map
