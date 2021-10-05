import { Component, OnInit } from '@angular/core';
import { ArtistCredit, Release } from '@services/musicbrainz.classes';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { MetadataObj, TrackService } from '@services/track.service';
import { throwError as observableThrowError } from 'rxjs';

@Component({
	selector: 'get-metadata',
	templateUrl: './get-metadata.component.html',
	styleUrls: ['./get-metadata.component.scss']
})
export class GetMetadataComponent implements OnInit {
	public releaseData: any;
	public releases: Release[] = [];
	public artist: string = '';
	public album: string = '';
	public numTracks: number;
	public selectedRelease: Release;

	private metadata: MetadataObj;

	constructor(private mb: MusicbrainzService,
				private ts: TrackService) {}

	ngOnInit() {
		this.metadata = this.ts.getCurrentMetadata();
		this.artist = this.metadata.artist.default;
		this.album = this.metadata.album.default;
		this.numTracks = this.ts.getNumTracks();
		const artistMBID = this.metadata.MUSICBRAINZ_ARTISTID.default;
		this.requestMetadata();
	}

	public requestMetadata() {
		this.selectedRelease = null;
		this.mb.searchReleases({ artist: this.artist, release: this.album })
			.subscribe(
				(data: any) => {
					this.releaseData = data;
					this.releases = data.releases?.map(r => new Release(r)) ?? [];
				},
				error => this.handleError(error));
	}

	public getReleaseInfo(release: Release) {
		this.mb.getReleaseInfo(release.id)
			.subscribe(
				(release: any) => {
					this.selectedRelease = new Release(release);
					console.log(this.selectedRelease);
				},
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

	public apply() {

	}
}
