import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

const LOCAL_CACHE_KEY = 'localCache';
const STALE_TIME = 1000 * 60 * 60 * 12; // 12 hours

class CacheEntry {
    body: any;
    addedTime: number;
}

@Injectable()
export class CacheService {
    cacheMap: Map<string, CacheEntry>;

    constructor() {
        const start = Date.now();
        const map = localStorage.getItem(LOCAL_CACHE_KEY);
        if (map) {
            this.cacheMap = new Map(JSON.parse(map));
        } else {
            this.cacheMap = new Map(null);
        }
        this.cacheMap.forEach((value, key) => {
            if (start - value.addedTime > STALE_TIME) {
                this.cacheMap.delete(key);
            }
        });
        this.saveCacheMap();
        console.log('CacheService initialized in:', (Date.now() - start) + 'ms');
        if (map) {
            console.log('localStorage Cache size:', Math.round(map.length*10 / 1024)/10 + 'KB');
        }
    }

    get(req: HttpRequest<any>): HttpResponse<any> | undefined {
        const cached = this.cacheMap.get(req.urlWithParams);

        if (!cached || Date.now() - cached.addedTime > STALE_TIME) {
            return undefined;
        }
        return cached.body;
    }

    set(req: HttpRequest<any>, response: HttpResponse<any>): void {
        if (response.status === 200) {
            const entry: CacheEntry = { body: response.body, addedTime: Date.now() };
            this.cacheMap.set(req.urlWithParams, entry);
            this.saveCacheMap();
        }
    }

    private saveCacheMap(): void {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify([...this.cacheMap]));
    }
}
