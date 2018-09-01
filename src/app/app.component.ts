import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { TrackService } from './services/track.service';
import { TrackServiceMocks } from './services/track.service.mock';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	fileList: any[] = [];
	showArtist = true;

	public tracks: any[] = [];
	public trackSubscription: Subscription;

	constructor(private ts: TrackService,
				private zone: NgZone) {
		this.trackSubscription = ts.getTracks().subscribe(tracks => this.setupTracks(tracks));
	}

	ngOnInit() {
		this.ts.setTracks(TrackServiceMocks.mockTracks());
		// setInterval(() => {
		// 	console.log(this.tracks[0].meta.filename, this.selected[0].meta.filename);
		// }, 1000);
	}

	ngOnDestroy() {
		this.trackSubscription.unsubscribe();
	}

	setupTracks(trackList: any[]) {
		this.zone.run(() => {
			this.tracks = trackList;
			// this.selected = JSON.parse(JSON.stringify(this.tracks));
			// this.selected = this.tracks;
			// this.tracks.forEach(t => console.log(t.meta.filename, t.artist));
			// this.clearEditing();
		});
	}
}
