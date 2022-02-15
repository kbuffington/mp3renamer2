import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Area } from '../classes/musicbrainz.classes';

const MB_BASE = 'https://musicbrainz.org/ws/2/';
const RELEASE_INCLUDES = [
    'artist-credits',
    'labels',
    'discids',
    'recordings',
    'release-groups',
    'recording-level-rels',
    'work-rels',
    'work-level-rels',
];
const NON_FUZZY_FIELDS = [
    'date',
];

@Injectable({ providedIn: 'root' })
export class MusicbrainzService {
    private releaseIncludes: string;
    constructor(private http: HttpClient) {
        this.releaseIncludes = RELEASE_INCLUDES.join('+');
    }

    /**
     * Queries MB with URI provided
     *
     * @param {string} url
     * @return {Observable<any>}
     */
    private get(url: string) {
        console.log(url);
        return this.http.get(url);
    }

    public searchReleases(queryParams: any, fuzzy = true): Promise<any> {
        let uri = `${MB_BASE}release/?limit=100&query=`;
        if (queryParams.releaseGroup) {
            /* eslint-disable max-len */
            // ${MB_BASE}release?release-group=ffb094d1-1a16-4348-a8dd-beb69cbd9a66&inc=release-groups+artist-credits+media+labels&limit=100
            uri = `${MB_BASE}release?release-group=${queryParams.releaseGroup}&inc=release-groups+artist-credits+media+labels&limit=100`;
        } else {
            // `${MB_BASE}release/?limit=100&query=artist:(${artist.trim()}*) AND release:(${album.trim()}*)`;
            let foundVals = 0;
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key].length) {
                    const and = foundVals > 0 ? ' AND ' : '';
                    const val = encodeURIComponent(queryParams[key].trim());
                    if (NON_FUZZY_FIELDS.includes(key)) {
                        fuzzy = false;
                    }
                    if (val.length) {
                        uri += `${and}${key}:${fuzzy ? '(' : ''}${val}${fuzzy ? '*)' : ''}`;
                        foundVals++;
                    }
                }
            });
        }
        return this.get(uri).toPromise();
    }

    public getReleaseInfo(releaseMbid: string) {
        const uri = `${MB_BASE}release/${releaseMbid}?inc=${this.releaseIncludes}`;
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

    public getWork(workID: string): Promise<any> {
        const uri = `${MB_BASE}work/${workID}?inc=recording-rels+artist-credits+work-rels`;
        return this.get(uri).toPromise();
    }

    public getWorks(workIDs: string[]): Promise<any> {
        const promises = [];
        workIDs.forEach(id => {
            promises.push(this.getWork(id));
        });
        return Promise.all(promises);
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
