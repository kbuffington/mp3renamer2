import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackService } from '../services/track.service';

@Component({
	selector: 'right-panel',
	templateUrl: './right-panel.component.html',
	styleUrls: ['./right-panel.component.scss']
})
export class RightPanelComponent implements OnInit, OnDestroy {
	@Input() tracks: any[] = [];

	metadata: any;
	public metadataSubscription: Subscription;

	constructor(private ts: TrackService) {
	}

	ngOnInit() {
		this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
			console.log(m);
			this.metadata = m;
		});
	}

	ngOnDestroy() {
		this.metadataSubscription.unsubscribe();
	}

}
