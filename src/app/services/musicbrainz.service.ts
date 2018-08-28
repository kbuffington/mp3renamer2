
import { throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { map, catchError } from 'rxjs/operators';

const MB_BASE = 'https://musicbrainz.org/ws/2/';

@Injectable()
export class MusicbrainzService {
	constructor(private http: Http) { }

	/**
	 * Queries MB with URI provided
	 *
	 * @param url unencoded URL
	 */
	get(url: string) {
		const uri = encodeURI(url);
		console.log(uri);
		return this.http.get(uri)
				.pipe(map(r => r.json()), catchError(this.handleError.bind(this)));
	}

	getReleaseInfo(artist: string, album: string) {
		const uri = `${MB_BASE}release/?limit=100&query=artist:"${artist}" AND release:"${album}"`;
		return this.get(uri);
	}

	getArtist(artistMBID: string) {
		const uri = `${MB_BASE}artist/?query=arid:${artistMBID}`;
		return this.get(uri);
	}

	private handleError(error: any) {
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.error(errMsg);
		return observableThrowError(errMsg);
	}
}
