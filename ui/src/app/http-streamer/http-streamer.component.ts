
import { throwError as observableThrowError,  Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { TrackService } from '../services/track.service';
import { map, catchError } from 'rxjs/operators';


const dataUrl = 'http://localhost:666/rest/data';

@Component({
	selector: 'http-streamer',
	templateUrl: './http-streamer.component.html',
	styleUrls: ['./http-streamer.component.scss']
})
export class HttpStreamerComponent implements OnInit {
	private data: any[] = [];
	private errorMessage: any = '';

	constructor(private http: Http,
				private ts: TrackService) { }

	ngOnInit() {
		this.subscribeToDelayed();
	}

	subscribeToData() {
		this.getData(dataUrl)
			.subscribe(
				data => this.data.push(data),
				error => this.errorMessage = <any>error,
				() => {
					// this.subscribeToData();
				}
			);
	}

	subscribeToPost() {
		this.postData()
			.subscribe(
				data => this.data.push(data),
				error => this.errorMessage = <any>error
			);
	}

	subscribeToDelayed() {
		this.getData('http://localhost:666/rest/open')
			.subscribe(
				data => {
					if (data.length) {
						this.ts.setTracks(data[0]);
					}
				},
				error => {
					console.log(error);
					this.errorMessage = <any>error;
				},
				() => {
					console.log('complete');
					this.subscribeToDelayed();
				}
			);
	}

	postData(): Observable<any[]> {
		return this.http.post(dataUrl, { 'kevin': 'buffington', 'is': 'great', 'yes': true })
			.pipe(map(resp => this.extractData(resp)),
			catchError(this.handleError));
	}

	getData(uri: string): Observable<any[]> {
		return this.http.get(uri)
			.pipe(map(resp => this.extractData(resp)),
			catchError(this.handleError));
	}

	private extractData(res: Response) {
		console.log(res);
		// this.subscribeToData();
		const body = [res.json()];
		return body || [];
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
