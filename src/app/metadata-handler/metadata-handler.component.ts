
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { MusicbrainzService } from '../services/musicbrainz.service';
import { map, catchError } from 'rxjs/operators';
import { TrackService } from '../services/track.service';

@Component({
	selector: 'metadata-handler',
	templateUrl: './metadata-handler.component.html',
	styleUrls: ['./metadata-handler.component.scss']
})
export class MetadataHandlerComponent implements OnInit {
	private data: any[] = [];
	private errorMessage: any = '';

	constructor(private http: Http,
				private mb: MusicbrainzService,
				private ts: TrackService) { }

	ngOnInit() {
	}

	requestMetadata() {
		const tracks = this.ts.getCurrentTracks();
		const artist = tracks[0].artist;
		const album = tracks[0].album;
		const artistMBID = tracks[0].userDefined.MUSICBRAINZ_ARTISTID;
		this.mb.getArtist(artistMBID)
			.subscribe(
				data => this.data = data,
				error => this.handleError(error));
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
