
import { throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class MusicbrainzService {
	private baseUrl = 'http://localhost:4200/';

	constructor(private http: Http) { }

	get(url: string) {
		const uri = url.replace(/^http.*musicbrainz.org\//, this.baseUrl);
		return this.http.get(uri)
				.pipe(map(r => r.json()), catchError(this.handleError.bind(this)));
	}

	private handleError(error: any) {
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.error(errMsg);
		return observableThrowError(errMsg);
	}
}
