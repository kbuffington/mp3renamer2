import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { from, Observable, of, Subscription, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { ConfigService, ConfigSettingsObject } from './config.service';
import { ThrottleService } from './throttle.service';

@Injectable({ providedIn: 'root' })
export class CacheInterceptor implements HttpInterceptor, OnDestroy {
    private configSubscription: Subscription;
    private config: ConfigSettingsObject;
    private lastRequestTime = 0;
    private needsCharReplacing = false;

    constructor(private readonly cacheService: CacheService,
                private readonly configService: ConfigService,
                private throttleService: ThrottleService) {
        this.configSubscription = configService.getConfig().subscribe(config => {
            this.config = config;
            this.needsCharReplacing = config.replaceUnicodeApostrophe ||
                    config.replaceUnicodeEllipsis ||
                    config.replaceUnicodeQuotes;
        });
    }

    ngOnDestroy(): void {
        this.configSubscription.unsubscribe();
    }

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
                    console.log('throttling', delay);
                    await this.sleep(delay);
                }
                if (this.throttleService.getQueueId() === queueId) {
                    this.lastRequestTime = Date.now();
                    return next.handle(req)
                        .pipe(
                            map(stateEvent => {
                                if (stateEvent instanceof HttpResponse && this.needsCharReplacing) {
                                    try {
                                        let body = JSON.stringify(stateEvent.body);
                                        if (this.config.replaceUnicodeApostrophe) {
                                            body = body.replace(/\u2018|\u2019/g, '\'');
                                        }
                                        if (this.config.replaceUnicodeQuotes) {
                                            body = body.replace(/\u201C|\u201D|\u201F/g, '\\"');
                                        }
                                        if (this.config.replaceUnicodeEllipsis) {
                                            body = body.replace(/\u2026/g, '...');
                                        }
                                        body = JSON.parse(body);
                                        stateEvent = new HttpResponse({ body });
                                    } catch (e) {
                                        // ignore error
                                        console.warn('Error parsing response:', e);
                                    }
                                }
                                return stateEvent;
                            }),
                            tap((stateEvent) => {
                                if (stateEvent instanceof HttpResponse) {
                                    this.cacheService.set(req, stateEvent.clone());
                                    this.throttleService.requestsInQueue--;
                                }
                            }),
                        )
                        .toPromise();
                } else {
                    return throwError('Canceled').toPromise();
                }
            };
            return from(doRequest(req, queueId));
        }
    }
}
