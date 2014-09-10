class FreezingManager {
    freezingTimeline: Continuity[] = [];
    private _wasDefreezedLastTime = true;
    private _lastStopping: Continuity = null;
    private _isFrozen = true;
    private _latestMovements: Occurrence[] = [];
    private _totalFrozenTime = 0;
    private _elapsedTime = 0;

    private get _lastStoppingDuration() {
        return this._lastStopping.end - this._lastStopping.start;
    }
    private get _latestMovingDuration() {
        var duration = 0;
        this._latestMovements.forEach((movement) => {
            duration += movement.judged - movement.watched;
        });
        return duration;
    }
    private get _firstStoppingWithinDuration() {
        var stopping = this._elapsedTime - this.observingDuration; // Assuming there is no movement
        for (var i = 0; i < this._latestMovements.length; i++) {
            var item = this._latestMovements[i];
            if (stopping >= item.watched)
                stopping = item.judged; // Movement occured at that time, delaying
            else
                break;
        }
        return stopping;
    }
    private get _lastStoppingWithinDuration() {
        var stopping = this._elapsedTime; // Assuming there is no movement
        for (var i = this._latestMovements.length - 1; i >= 0; i--) {
            var item = this._latestMovements[i];
            if (stopping <= item.judged)
                stopping = item.watched; // Movement occured at that time, delaying
            else
                break;
        }
        return stopping;
    }
    get frozenRatio() {
        // Assume that stoppings are already flushed
        if (!this.freezingTimeline.length)
            return 0;
        return this._totalFrozenTime / this._elapsedTime;
    }

    observingDuration = 1.5;

    loadStopping(stopping: Occurrence) {
        this._elapsedTime = stopping.judged;
        this._presentElapsedTime(this._elapsedTime);

        this._clearOldMovements();

        if (!stopping.isOccured)
            this._latestMovements.push(stopping);

        if (this._elapsedTime >= this.observingDuration &&
            this._latestMovingDuration <= this.observingDuration * 0.4) {

            if (this._wasDefreezedLastTime)
                this._lastStopping = { start: this._firstStoppingWithinDuration, end: stopping.judged };
            else
                this._lastStopping.end = stopping.judged;

            if (this._lastStoppingDuration >= this.observingDuration) {
                var nonoverlap = this._getNonoverlapStopping(this._lastStopping)
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
    }

    flushInput() {
        if (this._wasDefreezedLastTime)
            return;
        this._lastStopping.end = this._lastStoppingWithinDuration;
        var nonoverlap = this._getNonoverlapStopping(this._lastStopping);

        if (nonoverlap.start !== this._lastStopping.start || this._lastStoppingDuration >= this.observingDuration)
            this.freezingTimeline.push(nonoverlap);

        this._totalFrozenTime += nonoverlap.end - nonoverlap.start;
    }

    private _getNonoverlapStopping(stopping: Continuity) {
        var result: Continuity = { start: stopping.start, end: stopping.end };

        var lastFreezing = this.freezingTimeline[this.freezingTimeline.length - 1];

        if (lastFreezing && lastFreezing.end >= stopping.start)
            result.start = lastFreezing.end;

        return result;
    }

    private _clearOldMovements() {
        while (this._latestMovements[0] && this._latestMovements[0].judged <= this._elapsedTime - 1.5)
            this._latestMovements.shift();
    }

    private _presentElapsedTime(time: number) {
        elapsedTimeText.textContent = time.toFixed(2);
    }

    private _presentFrozenTime(time: number) {
        frozenTimeText.textContent = time.toFixed(2);
    }

    /** 
    Expects `active`, `stopped`, or `frozen`.
    */
    private _presentStatus(status: string) {
        switch (status) {
            case "active":
            case "stopped":
            case "frozen":
                statusPresenter.className = status;
                break;
            default:
                throw new Error("Unexpected keyword");
        }
    }

    private _log() {
        var log = this._latestMovements.length + ' ' + this._elapsedTime.toFixed(2) + ' ' + this._totalFrozenTime.toFixed(2);
        var array = new Array<boolean>(15);
        array.fill(false);
        this._latestMovements.forEach((movement) => {
            array[Math.round((movement.watched - Math.max(this._elapsedTime - this.observingDuration, 0)) * 10)] = true;
        });
        log += ' ' + array.reduce<string>((previous, current) => previous + (current ? '|' : '-'), '');
        console.log(log);
    }
}
interface Array<T> {
    reduce<U>(callbackfn: (previous: U, current: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
}