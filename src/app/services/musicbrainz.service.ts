
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';

const MB_BASE = 'https://musicbrainz.org/ws/2/';

@Injectable()
export class MusicbrainzService {
	constructor(private http: HttpClient) { }

	/**
	 * Queries MB with URI provided
	 *
	 * @param url unencoded URL
	 */
	get(url: string) {
		const uri = encodeURI(url);
		console.log(uri);
		return this.http.get(uri);
	}

	getReleaseInfo(artist: string, album: string) {
		const uri = `${MB_BASE}release/?limit=100&query=artist:"${artist}" AND release:"${album}"`;
		return this.get(uri);
	}

	getArtist(artistMBID: string) {
		const uri = `${MB_BASE}artist/?query=arid:${artistMBID}`;
		return this.get(uri);
	}
}
