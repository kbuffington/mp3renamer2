import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
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

	constructor(private electronService: ElectronService,
				private ts: TrackService,
				private zone: NgZone) {
		this.trackSubscription = ts.getTracks().subscribe(tracks => this.setupTracks(tracks));
	}

	ngOnInit() {
		if (this.electronService.isElectronApp) {
			const mainProcess = this.electronService.remote.require('./main.js');
			mainProcess.loadHardCoded();
		} else {
			// we'll need to use mocked file data here
			this.ts.setTracks(TrackServiceMocks.mockTracks());
		}
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

	previewRename() {
		this.ts.previewFilenames('');
	}

	revertRename() {
		this.ts.revertFilenames();
	}

	setNames() {
		console.log('TODO: setNames() in app.component');
	}

	renameFolder() {
		console.log('TODO: renameFolder() in app.component');
	}

	getFanart() {
		console.log('TODO: getFanart() in app.component');
	}

	downloadArt() {
		console.log('TODO: downloadArt() in app.component');
	}

	quitApp() {
		console.log('TODO: quitApp() in app.component');
	}
}
