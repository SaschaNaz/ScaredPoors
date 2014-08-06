declare var stoppingText: HTMLSpanElement;
declare var freezingText: HTMLSpanElement;
declare var frozenTimeText: HTMLSpanElement;
declare var elapsedTimeText: HTMLSpanElement;

class FreezingManager {
    private _continuousFreezing: Continuity[] = [];
    private _movedLastTime = true;
    private _lastStopping: Continuity = null;
    private _totalFrozenTime = 0;

    private get _lastStoppingDuration() {
        return this._lastStopping.end - this._lastStopping.start;
    }

    minimalDuration = 1.5;

    loadOccurrence(occurrence: Occurrence) {
        this._presentElapsedTime(occurrence.judged);
        if (!occurrence.isOccured) {
            this._presentStopping(false);
            this._presentFreezing(false);
            this._movedLastTime = true;
            return;
        }
        
        //occured
        this._presentStopping(true);
        if (this._movedLastTime) {
            if (this._lastStopping) {
                if (this._lastStoppingDuration < this.minimalDuration) // too short stopping time, ignore it
                    this._continuousFreezing.pop();
                else
                    this._totalFrozenTime += this._lastStoppingDuration;
            }
            this._lastStopping = {
                start: occurrence.watched,
                end: occurrence.judged
            };
            this._continuousFreezing.push(this._lastStopping);
        }
        else {
            this._lastStopping.end = occurrence.judged;
            if (this._lastStoppingDuration >= this.minimalDuration) { // enough stopping time, continuing
                this._presentFreezing(true);
                this._presentFrozenTime(this._totalFrozenTime + this._lastStoppingDuration);
            }
        }

        this._movedLastTime = false;
    }

    private _presentElapsedTime(time: number) {
        elapsedTimeText.textContent = time.toString();
    }

    private _presentFrozenTime(time: number) {
        frozenTimeText.textContent = time.toString();
    }

    private _presentStopping(stopping: boolean) {
        stoppingText.textContent = stopping ? "true" : "false";
    }

    private _presentFreezing(freezing: boolean) {
        freezingText.textContent = freezing ? "true" : "false";
    }
}