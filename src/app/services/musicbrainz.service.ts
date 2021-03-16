import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const MB_BASE = 'https://musicbrainz.org/ws/2/';

@Injectable()
export class MusicbrainzService {
	constructor(private http: HttpClient) { }

	/**
	 * Queries MB with URI provided
	 *
	 * @param url unencoded URL
	 */
	private get(url: string) {
		const uri = encodeURI(url);
		console.log(uri);
		return this.http.get(uri);
	}

	getReleaseInfo(artist: string, album: string) {
		const uri = `${MB_BASE}release/?limit=100&query=artist:"${artist.trim()}" AND release:"${album.trim()}"`;
		return this.get(uri);
	}

	getArtist(artistMBID: string) {
		const uri = `${MB_BASE}artist/?query=arid:${artistMBID.trim()}`;
		return this.get(uri);
	}
}
