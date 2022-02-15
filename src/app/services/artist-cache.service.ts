import { Injectable } from '@angular/core';
import { ArtistData } from '../classes/musicbrainz.classes';

const ARTIST_CACHE_KEY = 'artistCache';
const STALE_TIME = 1000 * 60 * 60 * 24 * 90; // three months

class CacheEntry {
    artist: ArtistData;
    addedTime: number;
}

@Injectable({ providedIn: 'root' })
export class ArtistCacheService {
    cacheMap: Map<string, CacheEntry>;

    constructor() {
        const start = Date.now();
        const map = localStorage.getItem(ARTIST_CACHE_KEY);
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
        if (map) {
            console.log('Artist Cache size:', Math.round(map.length*10 / 1024)/10 + 'KB');
        }
    }

    public get(artistId: string): ArtistData {
        const cached = this.cacheMap.get(artistId);

        if (!cached || Date.now() - cached.addedTime > STALE_TIME) {
            this.deleteArtist(artistId);
        }
        return cached?.artist;
    }

    public set(artist: ArtistData): void {
        this.cacheMap.set(artist.id, {
            artist: artist,
            addedTime: Date.now(),
        });
        this.saveCacheMap();
    }

    public has(artistId: string): boolean {
        return this.cacheMap.has(artistId);
    }

    private deleteArtist(artistId): void {
        // setTimeout(() => {
        this.cacheMap.delete(artistId);
        this.saveCacheMap();
        // }, 1000); // Why am I waiting a second?
    }

    private saveCacheMap(): void {
        localStorage.setItem(ARTIST_CACHE_KEY, JSON.stringify([...this.cacheMap]));
    }
}
