import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetadataProperty, TrackService } from '../services/track.service';

@Component({
	selector: 'right-panel',
	templateUrl: './right-panel.component.html',
	styleUrls: ['./right-panel.component.scss']
})
export class RightPanelComponent implements OnInit, OnDestroy {
	@Input() tracks: any[] = [];

	hideConflicts = 0;
	metadata: { [key: string]: MetadataProperty; };
	public metadataSubscription: Subscription;
	public releaseTypes = [];

	constructor(private ts: TrackService) {
	}

	ngOnInit() {
		this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
			console.log(m);
			this.metadata = m;
		});
		this.releaseTypes = ['Album', 'EP', 'Single', 'Live', 'Compilation', 'Soundtrack', 'Anthology', 'Bootleg', 'Remix', 'Demo', 'Comedy'];
	}

	ngOnDestroy() {
		this.metadataSubscription.unsubscribe();
	}

	guessArtistSortOrder() {
		const artist: string = this.metadata.artist.default;
		let sortOrder = '';
		if (artist.toLowerCase().indexOf('the ') === 0) {
			sortOrder = artist.substr(4) + ', The';
		} else {
			if (artist.trim().indexOf(' ') !== -1) {
				const artistParts = artist.split(' ');
				sortOrder = artistParts.pop() + ', ';
				sortOrder += artistParts.join(' ');
			}
		}
		this.updateValue('artistSortOrder', sortOrder);
	}

	updateValue(fieldname: string, value: string) {
		const metaField = this.metadata[fieldname];
		metaField.default = value;
		metaField.changed = true;
	}

	sendHide() {
		this.hideConflicts++;
	}

	swapDates() {
		const metadata = this.ts.getCurrentMetadata();
		const date: MetadataProperty = JSON.parse(JSON.stringify(metadata.date));
		const originalDate: MetadataProperty = JSON.parse(JSON.stringify(metadata.originalReleaseDate));
		metadata.date = originalDate;
		metadata.date.changed = true;
		metadata.originalReleaseDate = date;
		metadata.originalReleaseDate.changed = true;
		this.ts.setMetadata(metadata);
	}
}
