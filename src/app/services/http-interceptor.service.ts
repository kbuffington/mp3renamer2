import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class CacheInterceptor implements HttpInterceptor {
    constructor(private readonly cacheService: CacheService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        if(req.method !== 'GET') {
            return next.handle(req)
        }
        const cachedResponse: HttpResponse<any> = this.cacheService.get(req)
        if (cachedResponse) {
            const response = new HttpResponse({ body: cachedResponse });
            return of(response)
        } else {
            return next.handle(req)
                .pipe(tap(stateEvent => {
                    if (stateEvent instanceof HttpResponse) {
                        this.cacheService.set(req, stateEvent.clone())
                    }
                })
            );
        }
    }
}