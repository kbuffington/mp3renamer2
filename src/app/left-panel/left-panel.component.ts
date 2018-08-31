import { Component, Input, OnInit } from '@angular/core';
import { TrackService } from '../services/track.service';

@Component({
	selector: 'left-panel',
	templateUrl: './left-panel.component.html',
	styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit {
	@Input() tracks: any[] = [];

	constructor(private ts: TrackService) { }

	ngOnInit() {
	}

}
