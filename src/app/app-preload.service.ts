import { Injectable } from '@angular/core';
import { CacheService } from '@services/cache.service';

@Injectable({ providedIn: 'root' })
export class PreloadService {
    constructor(private cacheService: CacheService) {}

    public initializeApp() {
        // console.log('initialized');
    }
}

export function PreloadFactory(preloadService: PreloadService) {
    return () => preloadService.initializeApp();
}
