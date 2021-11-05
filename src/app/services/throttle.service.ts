import { Injectable } from '@angular/core';

@Injectable()
export class ThrottleService {
    public requestsInQueue = 0;

    private requestQueueID = 0;
    private lastDelay: number;
    private lastRequestTime = 0;

    constructor() {}

    public getQueueId(): number {
        return this.requestQueueID;
    }

    public clearQueuedRequests() {
        this.requestQueueID++;
        this.requestsInQueue = 0;
    }

    public getDelay(): number {
        let delay = this.requestsInQueue * this.requestsInQueue * 50; // exp. delay
        if (this.requestsInQueue > 10) {
            delay = 5000 + (this.requestsInQueue - 10) * 1000;
        }
        // TODO: Come up with better solution for this
        if (delay < this.lastDelay && Date.now() - this.lastRequestTime < 1000) {
            // must have cleared queue and delay is too short, so wait 1s
            delay = 1000;
        }
        this.lastRequestTime = Date.now();
        this.lastDelay = delay;
        return delay;
    }
}
