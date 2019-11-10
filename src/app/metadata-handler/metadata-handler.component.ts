
import { Component, OnInit } from '@angular/core';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { MusicbrainzService } from '../services/musicbrainz.service';
import { TrackService } from '../services/track.service';

@Component({
	selector: 'metadata-handler',
	templateUrl: './metadata-handler.component.html',
	styleUrls: ['./metadata-handler.component.scss']
})
export class MetadataHandlerComponent implements OnInit {
	private data: any;
	private errorMessage: any = '';

	constructor(private mb: MusicbrainzService,
				private ts: TrackService) { }

	ngOnInit() {
	}

	requestMetadata() {
		const tracks = this.ts.getCurrentTracks();
		const artist = tracks[0].artist;
		const album = tracks[0].album;
		const artistMBID = tracks[0].userDefined.MUSICBRAINZ_ARTISTID;
		this.mb.getReleaseInfo(artist, album)
		// this.mb.getArtist(artistMBID)
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

	reloadTags() {
		this.ts.resetTrackData();
	}

	setTags() {
		this.ts.setTagData();
	}
}
