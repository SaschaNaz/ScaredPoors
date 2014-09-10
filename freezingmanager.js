var FreezingManager = (function () {
    function FreezingManager() {
        this.freezingTimeline = [];
        this._wasDefreezedLastTime = true;
        this._lastStopping = null;
        this._isFrozen = true;
        this._latestMovements = [];
        this._totalFrozenTime = 0;
        this._elapsedTime = 0;
        this.observingDuration = 1.5;
    }
    Object.defineProperty(FreezingManager.prototype, "_lastStoppingDuration", {
        get: function () {
            return this._lastStopping.end - this._lastStopping.start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "_latestMovingDuration", {
        get: function () {
            var duration = 0;
            this._latestMovements.forEach(function (movement) {
                duration += movement.judged - movement.watched;
            });
            return duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "_firstStoppingWithinDuration", {
        get: function () {
            var stopping = this._elapsedTime - this.observingDuration;
            for (var i = 0; i < this._latestMovements.length; i++) {
                var item = this._latestMovements[i];
                if (stopping >= item.watched)
                    stopping = item.judged; // Movement occured at that time, delaying
                else
                    break;
            }
            return stopping;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "_lastStoppingWithinDuration", {
        get: function () {
            var stopping = this._elapsedTime;
            for (var i = this._latestMovements.length - 1; i >= 0; i--) {
                var item = this._latestMovements[i];
                if (stopping <= item.judged)
                    stopping = item.watched; // Movement occured at that time, delaying
                else
                    break;
            }
            return stopping;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "frozenRatio", {
        get: function () {
            // Assume that stoppings are already flushed
            if (!this.freezingTimeline.length)
                return 0;
            return this._totalFrozenTime / this._elapsedTime;
        },
        enumerable: true,
        configurable: true
    });

    FreezingManager.prototype.loadStopping = function (stopping) {
        this._elapsedTime = stopping.judged;
        this._presentElapsedTime(this._elapsedTime);

        this._clearOldMovements();

        if (!stopping.isOccured)
            this._latestMovements.push(stopping);

        if (this._elapsedTime >= this.observingDuration && this._latestMovingDuration <= this.observingDuration * 0.4) {
            if (this._wasDefreezedLastTime)
                this._lastStopping = { start: this._firstStoppingWithinDuration, end: stopping.judged };
            else
                this._lastStopping.end = stopping.judged;

            if (this._lastStoppingDuration >= this.observingDuration) {
                var nonoverlap = this._getNonoverlapStopping(this._lastStopping);
                this._presentFrozenTime(this._totalFrozenTime + nonoverlap.end - nonoverlap.start);
                this._wasDefreezedLastTime = false;
                this._presentStatus("frozen");
                this._log();
                return;
            }
        }

        this.flushInput();
        this._wasDefreezedLastTime = true;
        if (stopping.isOccured)
            this._presentStatus("stopped");
        else
            this._presentStatus("active");

        this._log();
    };

    FreezingManager.prototype.flushInput = function () {
        if (this._wasDefreezedLastTime)
            return;
        this._lastStopping.end = this._lastStoppingWithinDuration;
        var nonoverlap = this._getNonoverlapStopping(this._lastStopping);

        if (nonoverlap.start !== this._lastStopping.start || this._lastStoppingDuration >= this.observingDuration)
            this.freezingTimeline.push(nonoverlap);

        this._totalFrozenTime += nonoverlap.end - nonoverlap.start;
    };

    FreezingManager.prototype._getNonoverlapStopping = function (stopping) {
        var result = { start: stopping.start, end: stopping.end };

        var lastFreezing = this.freezingTimeline[this.freezingTimeline.length - 1];

        if (lastFreezing && lastFreezing.end >= stopping.start)
            result.start = lastFreezing.end;

        return result;
    };

    FreezingManager.prototype._clearOldMovements = function () {
        while (this._latestMovements[0] && this._latestMovements[0].judged <= this._elapsedTime - 1.5)
            this._latestMovements.shift();
    };

    FreezingManager.prototype._presentElapsedTime = function (time) {
        elapsedTimeText.textContent = time.toFixed(2);
    };

    FreezingManager.prototype._presentFrozenTime = function (time) {
        frozenTimeText.textContent = time.toFixed(2);
    };

    /**
    Expects `active`, `stopped`, or `frozen`.
    */
    FreezingManager.prototype._presentStatus = function (status) {
        switch (status) {
            case "active":
            case "stopped":
            case "frozen":
                statusPresenter.className = status;
                break;
            default:
                throw new Error("Unexpected keyword");
        }
    };

    FreezingManager.prototype._log = function () {
        var _this = this;
        var log = this._latestMovements.length + ' ' + this._elapsedTime.toFixed(2) + ' ' + this._totalFrozenTime.toFixed(2);
        var array = new Array(15);
        array.fill(false);
        this._latestMovements.forEach(function (movement) {
            array[Math.round((movement.watched - Math.max(_this._elapsedTime - _this.observingDuration, 0)) * 10)] = true;
        });
        log += ' ' + array.reduce(function (previous, current) {
            return previous + (current ? '|' : '-');
        }, '');
        console.log(log);
    };
    return FreezingManager;
})();
//# sourceMappingURL=freezingmanager.js.map
