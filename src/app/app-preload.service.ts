import { Injectable } from '@angular/core';
import { CacheService } from '@services/cache.service';
import { fetchCacheInterceptor, FetchInterceptorRegistry, fetchResponseInterceptor } from '@services/fetch-interceptor.service';

@Injectable({ providedIn: 'root' })
export class PreloadService {
	constructor(/*private fetchInterceptorRegistry: FetchInterceptorRegistry,*/
				private cacheService: CacheService) {}

	public initializeApp() {
		// this.fetchInterceptorRegistry.addInterceptor(fetchCacheInterceptor);
		// this.fetchInterceptorRegistry.addInterceptor(fetchResponseInterceptor);
		// this.fetchInterceptorRegistry.registerInterceptors();
		// console.log('initialized');
	}
}

export function PreloadFactory(preloadService: PreloadService) {
	return () => preloadService.initializeApp();
}