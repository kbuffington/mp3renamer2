import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { TrackService } from '../services/track.service';

@Component({
  selector: 'request-files',
  templateUrl: './request-files.component.html',
  styleUrls: ['./request-files.component.scss']
})
export class RequestFilesComponent implements OnInit {
	constructor(private electronService: ElectronService,
				private ts: TrackService) { }

	ngOnInit() {
		this.electronService.ipcRenderer.on('files', (event, message) => {
			this.ts.setTracks(message);
		});
	}

	requestFiles() {
		if (this.electronService.isElectronApp) {
			const mainProcess = this.electronService.remote.require('./main.js');
			mainProcess.getFiles();
		} else {
			// we'll need ot use mocked file data here
		}
	}

	clearFiles() {
		this.ts.clearTracks();
	}
}
