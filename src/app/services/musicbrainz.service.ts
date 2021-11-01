import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Area } from './musicbrainz.classes';

const MB_BASE = 'https://musicbrainz.org/ws/2/';

@Injectable()
export class MusicbrainzService {
    constructor(private http: HttpClient) { }

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

    public searchReleases(queryParams: Object, fuzzy = true) {
        // `${MB_BASE}release/?limit=100&query=artist:"${artist.trim()}" AND release:"${album.trim()}"`;
        let uri = `${MB_BASE}release/?limit=100&query=`;
        Object.keys(queryParams).forEach((key, idx) => {
            if (queryParams[key].length) {
                const and = idx > 0 ? ' AND ' : '';
                uri += `${and}${key}:"${fuzzy ? '(' : ''}${queryParams[key].trim()}${fuzzy ? '*)' : ''}"`;
            }
        });
        return this.get(uri);
    }

    public getReleaseInfo(releaseMbid: string) {
        const uri = `${MB_BASE}release/${releaseMbid}?inc=artist-credits+labels+discids+recordings+release-groups`;
        return this.get(uri);
    }

    public getArtists(artistMBIDs: string[]): Promise<any> {
        let uri = `${MB_BASE}artist/?query=`;
        artistMBIDs.forEach((mbid, idx) => {
            const and = idx > 0 ? ' OR ' : '';
            uri += `${and}arid:${mbid.trim()}`;
        });
        return this.get(uri).toPromise();
    }

    public getArea(areaMBID: string): Promise<any> {
        const uri = `${MB_BASE}area/?query=aid:${areaMBID}`;
        return this.get(uri).toPromise();
    }

    // traverse through artist area, going up the relations until we find a country
    public async getCountry(areaMBID: string): Promise<string> {
        const resp = await this.getArea(areaMBID);
        const areaObj = new Area(resp.areas[0]);
        if (areaObj.type === 'Country') {
            return areaObj.name;
        } else {
            const parentIds = areaObj.relations?.filter(rel => rel.direction === 'backward').map(a => a.area?.id);
            if (parentIds) {
                let country;
                while (parentIds.length && !country) {
                    const parentId = parentIds.pop();
                    country = await this.getCountry(parentId);
                }
                return country;
            } else {
                return '';
            }
        }
    }
}
