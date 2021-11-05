import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { ThrottleService } from './throttle.service';

@Injectable({ providedIn: 'root' })
export class CacheInterceptor implements HttpInterceptor {
    private lastRequestTime = 0;

    constructor(private readonly cacheService: CacheService,
                private throttleService: ThrottleService) {}

    private sleep(t) {
        return new Promise(rs => setTimeout(rs, t));
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.method !== 'GET') {
            return next.handle(req);
        }
        const cachedResponse: HttpResponse<any> = this.cacheService.get(req);
        if (cachedResponse) {
            const response = new HttpResponse({ body: cachedResponse });
            return of(response);
        } else {
            this.throttleService.requestsInQueue++;
            const queueId = this.throttleService.getQueueId();
            const doRequest = async (req, queueId) => {
                if (this.lastRequestTime + 1000 > Date.now()) {
                    const delay = this.throttleService.getDelay();
                    console.log('waiting', delay);
                    await this.sleep(delay);
                }
                if (this.throttleService.getQueueId() === queueId) {
                    this.lastRequestTime = Date.now();
                    return next.handle(req)
                        .pipe(tap((stateEvent) => {
                            if (stateEvent instanceof HttpResponse) {
                                this.cacheService.set(req, stateEvent.clone());
                                this.throttleService.requestsInQueue--;
                            }
                        }))
                        .toPromise();
                } else {
                    return throwError('Canceled').toPromise();
                }
            };
            return from(doRequest(req, queueId));
        }
    }
}
