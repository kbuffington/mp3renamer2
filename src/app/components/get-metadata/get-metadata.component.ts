import { Component, OnInit } from '@angular/core';
import { ArtistCredit, Releases } from '@services/musicbrainz.classes';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { TrackService } from '@services/track.service';
import { throwError as observableThrowError } from 'rxjs';

@Component({
	selector: 'get-metadata',
	templateUrl: './get-metadata.component.html',
	styleUrls: ['./get-metadata.component.scss']
})
export class GetMetadataComponent implements OnInit {
	public releaseData: any;
	public releases: Releases[] = [];

	constructor(private mb: MusicbrainzService,
				private ts: TrackService) {}

	ngOnInit() {
		this.requestMetadata();
	}

	requestMetadata() {
		const metadata = this.ts.getCurrentMetadata();
		const artist = metadata.artist.default;
		const album = metadata.album.default;
		const artistMBID = metadata.MUSICBRAINZ_ARTISTID.default;
		this.mb.getReleaseInfo(artist, album)
		// this.mb.getArtist(artistMBID)
			.subscribe(
				(data: any) => {
					this.releaseData = data;
					this.releases = data?.releases ?? []
				},
				error => this.handleError(error));
	}

	public artistCredit(credits: ArtistCredit[]): string {
		const artistString = credits.reduce((prevVal, artist: ArtistCredit, idx) => {
			return idx == 0
				? (artist.name + (artist.joinphrase ? artist.joinphrase : ''))
				: prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
		}, '');
		return artistString;
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
