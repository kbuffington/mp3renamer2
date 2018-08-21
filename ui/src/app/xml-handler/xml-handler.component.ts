
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { MusicbrainzService } from '../services/musicbrainz.service';
import { map, catchError } from 'rxjs/operators';

@Component({
	selector: 'xml-handler',
	templateUrl: './xml-handler.component.html',
	styleUrls: ['./xml-handler.component.scss']
})
export class XmlHandlerComponent implements OnInit {
	private data: any[] = [];
	private errorMessage: any = '';

	constructor(private http: Http,
				private mb: MusicbrainzService) { }

	ngOnInit() {
	}

	requestXml() {
		this.mb.get('http://musicbrainz.org/ws/2/recording/?limit=100&query=reid:b0df6008-679f-4134-ae7a-92628dd3cf14')
			.subscribe(
				data => this.data = data,
				error => this.errorMessage = <any>error,
				() => {
					console.log(this.data);
				});
		// this.getData('http://localhost:4200/ws/2/recording/?limit=100&query=reid:b0df6008-679f-4134-ae7a-92628dd3cf14')
		// 	.subscribe(
		// 		data => this.data = data,
		// 		error => this.errorMessage = <any>error,
		// 		() => {
		// 			console.log(this.data);
		// 		}
		// 	);
	}

	getData(uri: string): Observable<any[]> {
		return this.http.get(uri).pipe(
			map(resp => this.extractData(resp).bind(this)),
			catchError(err => this.handleError(err)));
	}

	private extractData(res: Response|any) {
		return JSON.parse(res._body) || {};
	}

	private handleError(error: any) {
		// In a real world app, we might use a remote logging infrastructure
		// We'd also dig deeper into the error to get a better message
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.error(errMsg); // log to console instead
		return observableThrowError(errMsg);
	}
}
