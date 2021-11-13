import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { ElectronService } from '@services/electron.service';
import { TrackService } from '../services/track.service';

@Component({
    selector: 'upper-button-bar',
    templateUrl: './upper-button-bar.component.html',
    styleUrls: ['./upper-button-bar.component.scss'],
})
export class UpperButtonBarComponent implements OnInit {
    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private ts: TrackService) {}

    ngOnInit() {}

    public requestFiles() {
        const config = this.configService.getCurrentConfig();
        if (this.electronService.isElectron) {
            const mainProcess = this.electronService.remote.require('./main.js');
            mainProcess.getFiles(config.homeDir);
        } else {
            // we'll need to use mocked file data here
        }
    }

    public guessTitles() {
        this.ts.guessTitles();
    }

    renumberTracks() {
        this.ts.renumberTracks(1);
    }
}
