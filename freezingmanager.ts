class FreezingManager {
    private _continuousFreezing: Continuity[] = [];
    private _movedLastTime = false;
    private _lastFreezing: Continuity = null;

    minimalDuration = 1.5;

    loadOccurrence(occurrence: Occurrence) {
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
        }
        else {
            this._lastFreezing.end = occurrence.judged;
            if (this._lastFreezing.end - this._lastFreezing.start >= this.minimalDuration)
                this._presentFreezing(true);
        }

        this._movedLastTime = false;
    }

    private _presentStopping(stopping: boolean) {

    }

    private _presentFreezing(freezing: boolean) {
    }
}