import { Component, OnInit } from '@angular/core';
import { ElectronService } from '@services/electron.service';
import { TrackService } from '../services/track.service';

@Component({
    selector: 'upper-button-bar',
    templateUrl: './upper-button-bar.component.html',
    styleUrls: ['./upper-button-bar.component.scss'],
})
export class UpperButtonBarComponent implements OnInit {
    constructor(private electronService: ElectronService,
                private ts: TrackService) {}

    ngOnInit() {}

    requestFiles() {
        if (this.electronService.isElectron) {
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
