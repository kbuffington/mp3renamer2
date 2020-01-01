import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { TrackService } from '../services/track.service';

@Component({
	selector: 'upper-button-bar',
	templateUrl: './upper-button-bar.component.html',
	styleUrls: ['./upper-button-bar.component.scss']
})
export class UpperButtonBarComponent implements OnInit {

	constructor(private electronService: ElectronService,
		private ts: TrackService) { }

	ngOnInit() {
		this.electronService.ipcRenderer.on('files', (event, json) => {
			this.ts.setTracks(json);
		});
	}

	requestFiles() {
		if (this.electronService.isElectronApp) {
			const mainProcess = this.electronService.remote.require('./main.js');
			mainProcess.getFiles();
		} else {
			// we'll need to use mocked file data here
		}
	}

	guessTitles() {
		console.log('write guessTitles() method');
	}

	renumberTracks() {
		this.ts.renumberTracks(1);
	}
}
