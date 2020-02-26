import { Component, OnInit } from '@angular/core';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { TrackService } from '@services/track.service';
import { throwError as observableThrowError } from 'rxjs';

@Component({
	selector: 'get-metadata',
	templateUrl: './get-metadata.component.html',
	styleUrls: ['./get-metadata.component.scss']
})
export class GetMetadataComponent implements OnInit {
	private data: any;

	constructor(private mb: MusicbrainzService,
				private ts: TrackService) {}

	ngOnInit() {
		this.requestMetadata();
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

}
