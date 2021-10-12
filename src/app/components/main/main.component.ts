import { Component, OnDestroy, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { TrackService } from '@services/track.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
	public showArtist = true;
	public tracks: any[] = [];
	public trackSubscription: Subscription;

	constructor(private electronService: ElectronService, private ts: TrackService) {
	}

	ngOnInit() {
		this.tracks = this.ts.getCurrentTracks();
		this.trackSubscription = this.ts.getTracks().subscribe(tracks => this.tracks = tracks);
	}

	ngOnDestroy() {
		this.trackSubscription.unsubscribe();
	}

	previewRename() {
		this.ts.previewFilenames('');
	}

	revertRename() {
		this.ts.revertFilenames();
	}

	setNames() {
		console.log('TODO: setNames() in main.component');
	}

	renameFolder() {
		console.log('TODO: renameFolder() in main.component');
	}

	getFanart() {
		console.log('TODO: getFanart() in main.component');
	}

	downloadArt() {
		console.log('TODO: downloadArt() in main.component');
	}

	quitApp() {
		const mainProcess = this.electronService.remote.require('./main.js');
		mainProcess.quitApp();
	}
}
