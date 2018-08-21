
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs, Headers } from '@angular/http';




@Injectable()
export class AuthenticatedHttpService extends Http {

	constructor(backend: XHRBackend, defaultOptions: RequestOptions) {
		super(backend, defaultOptions);
	}

	// request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
	// 	return super.request(url, options).catch((error: Response) => {
	// 			// if ((error.status === 401 || error.status === 403) && (window.location.href.match(/\?/g) || []).length < 2) {
	// 			if (error.status === 0) {
	// 				console.log('Server is down.');
	// 				// window.location.href = window.location.href + '?' + new Date().getMilliseconds();
	// 			}
	// 			return observableThrowError(error);
	// 		});
	// }
}
