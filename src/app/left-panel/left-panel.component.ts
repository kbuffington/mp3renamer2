import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackOptions, TrackService } from '../services/track.service';

@Component({
	selector: 'left-panel',
	templateUrl: './left-panel.component.html',
	styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
	@Input() tracks: any[] = [];

	hideConflicts = 0;
	metadata: any;
	trackOptions: TrackOptions;
	public metadataSubscription: Subscription;
	public trackOptionsSubscription: Subscription;

	constructor(private ts: TrackService) {
	}

	ngOnInit() {
		this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
			this.metadata = m;
		});
		this.trackOptionsSubscription = this.ts.getTrackOptions().subscribe(o => {
			this.trackOptions = o;
		});
	}

	ngOnDestroy() {
		this.metadataSubscription.unsubscribe();
		this.trackOptionsSubscription.unsubscribe();
	}

	sendHide() {
		this.hideConflicts++;
	}
}
