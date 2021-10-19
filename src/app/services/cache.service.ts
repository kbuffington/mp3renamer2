import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

const LOCAL_CACHE_KEY = 'localCache';
const STALE_TIME = 1000 * 60 * 60 * 12; // 12 hours

@Injectable()
export class CacheService {
    cacheMap: Map<string, any>;

    constructor() {
        const start = Date.now();
        const map = localStorage.getItem(LOCAL_CACHE_KEY);
        if (map) {
            this.cacheMap = new Map(JSON.parse(map));
        } else {
            this.cacheMap = new Map(null);
        }
        this.cacheMap.forEach((value, key) => {
            if (Date.now() - value.addedTime > STALE_TIME) {
                this.cacheMap.delete(key);
            }
        });
        this.saveCacheMap();
        console.log('CacheService initialized in ' + (Date.now() - start) + 'ms');
    }

    get(req: HttpRequest<any>): HttpResponse<any> | undefined {
        const url = req.urlWithParams;
        const cached = this.cacheMap.get(url);

        if (!cached || Date.now() - cached.addedTime > 1000 * 60) {
            return undefined;
        }

        return cached.data;
    }

    set(req: HttpRequest<any>, response: HttpResponse<any>): void {
        if (response.status === 200) {
            const url = req.urlWithParams;
            const entry = { data: response.body, addedTime: Date.now() };
            this.cacheMap.set(url, entry);
            this.saveCacheMap();
        }
    }

    private saveCacheMap(): void {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify([...this.cacheMap]));
    }
}