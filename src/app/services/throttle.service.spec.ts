import { TestBed } from '@angular/core/testing';
import { ThrottleService } from './throttle.service';

describe('ThrottleService', () => {
    let service: ThrottleService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [ThrottleService] });
        service = TestBed.inject(ThrottleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ── getQueueId ───────────────────────────────────────────────────────────

    describe('getQueueId()', () => {
        it('returns 0 initially', () => {
            expect(service.getQueueId()).toBe(0);
        });

        it('reflects each call to clearQueuedRequests()', () => {
            service.clearQueuedRequests();
            service.clearQueuedRequests();
            expect(service.getQueueId()).toBe(2);
        });
    });

    // ── clearQueuedRequests ──────────────────────────────────────────────────

    describe('clearQueuedRequests()', () => {
        it('increments the queue ID', () => {
            service.clearQueuedRequests();
            expect(service.getQueueId()).toBe(1);
        });

        it('resets requestsInQueue to 0', () => {
            service.requestsInQueue = 5;
            service.clearQueuedRequests();
            expect(service.requestsInQueue).toBe(0);
        });
    });

    // ── getDelay ─────────────────────────────────────────────────────────────

    describe('getDelay()', () => {
        it('returns 0 for an empty queue', () => {
            service.requestsInQueue = 0;
            expect(service.getDelay()).toBe(0);
        });

        it('uses n² × 50 formula for queue size 1', () => {
            service.requestsInQueue = 1;
            expect(service.getDelay()).toBe(50);
        });

        it('uses n² × 50 formula for queue size 5', () => {
            service.requestsInQueue = 5;
            expect(service.getDelay()).toBe(1250);
        });

        it('uses n² × 50 formula for queue size 10', () => {
            service.requestsInQueue = 10;
            expect(service.getDelay()).toBe(5000);
        });

        it('switches to linear formula for queue size 11', () => {
            service.requestsInQueue = 11;
            expect(service.getDelay()).toBe(6000);
        });

        it('uses linear formula for queue size 15', () => {
            service.requestsInQueue = 15;
            expect(service.getDelay()).toBe(10000);
        });

        describe('fallback to 1000ms after queue is cleared mid-flight', () => {
            beforeEach(() => {
                jasmine.clock().install();
                jasmine.clock().mockDate(new Date(0));
            });
            afterEach(() => jasmine.clock().uninstall());

            it('returns 1000 when cleared and called again within 1 second', () => {
                service.requestsInQueue = 5;
                service.getDelay(); // lastDelay = 1250, lastRequestTime = now
                service.clearQueuedRequests(); // requestsInQueue = 0
                // new delay (0) < lastDelay (1250) and elapsed < 1000ms → fallback
                expect(service.getDelay()).toBe(1000);
            });

            it('does not apply fallback when more than 1 second has elapsed', () => {
                service.requestsInQueue = 5;
                service.getDelay(); // lastDelay = 1250
                service.clearQueuedRequests();
                jasmine.clock().tick(1001);
                service.requestsInQueue = 1;
                expect(service.getDelay()).toBe(50);
            });

            it('does not apply fallback when new delay exceeds the previous delay', () => {
                service.requestsInQueue = 2;
                service.getDelay(); // lastDelay = 200
                service.requestsInQueue = 5; // new delay = 1250 > 200
                expect(service.getDelay()).toBe(1250);
            });
        });
    });
});
