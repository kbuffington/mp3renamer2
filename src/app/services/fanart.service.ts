import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

const FANART_BASE = 'http://webservice.fanart.tv/v3/music/';

// const API_KEY = 'e98c81989fa12e8171f86068c8b9989a';
// const CLIENT_KEY = '62c1ba6dcd7701667d97cd7ea384206f';
// http://webservice.fanart.tv/v3/music/f4a31f0a-51dd-4fa7-986d-3095c40c5ed9?api_key=e98c81989fa12e8171f86068c8b9989a

@Injectable({ providedIn: 'root' })
export class FanartService {
    apiKey: string;

    constructor(private http: HttpClient,
                private cs: ConfigService) {
        this.apiKey = cs.getCurrentConfig().fanartApiKey;
    }

    /**
     * Queries MB with URI provided
     *
     * @param {string} url
     * @return {Observable<any>}
     */
    private get(url: string) {
        const uri = encodeURI(url);
        console.log(uri);
        return this.http.get(uri);
    }

    public getArtist(artistMBID: string): Promise<any> {
        const uri = `${FANART_BASE}${artistMBID.trim()}?api_key=${this.apiKey}`;
        return this.get(uri).toPromise();
    }

    public getAlbum(albumMBID: string): Promise<any> {
        const uri = `${FANART_BASE}albums/${albumMBID.trim()}?api_key=${this.apiKey}`;
        return this.get(uri).toPromise();
    }

    public getLogo(logoMBID: string): Promise<any> {
        const uri = `${FANART_BASE}labels/${logoMBID.trim()}?api_key=${this.apiKey}`;
        return this.get(uri).toPromise();
    }
}
