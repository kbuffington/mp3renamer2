import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackService } from '../services/track.service';

@Component({
	selector: 'left-panel',
	templateUrl: './left-panel.component.html',
	styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
	@Input() tracks: any[] = [];

	hideConflicts = 0;
	metadata: any;
	public metadataSubscription: Subscription;

	constructor(private ts: TrackService) {
	}

	ngOnInit() {
		this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
			this.metadata = m;
		});
	}

	ngOnDestroy() {
		this.metadataSubscription.unsubscribe();
	}

	sendHide() {
		this.hideConflicts++;
	}
}
