import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { ElectronService } from '@services/electron.service';
import { TrackService } from '../../services/track.service';

@Component({
    selector: 'upper-button-bar',
    templateUrl: './upper-button-bar.component.html',
    styleUrls: ['./upper-button-bar.component.scss'],
})
export class UpperButtonBarComponent implements OnInit {
    public filesLoaded = false;

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private ts: TrackService) {
        ts.getTracks().subscribe(tracks => {
            this.filesLoaded = tracks.length > 0;
        });
    }

    ngOnInit() {}

    /**
     * Displays file selector
     */
    public requestFiles() {
        let dir = this.configService.getCurrentConfig().homeDir;
        const fileList = this.ts.getCurrentTracks();
        if (fileList.length) {
            const regex = new RegExp(`${this.ts.pathDelimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')}$`, '');
            const folder = fileList[0].meta.folder.replace(regex, ''); // folder without trailing slash
            dir = folder.substring(0, folder.lastIndexOf(this.ts.pathDelimiter)); // up one directory
        }
        if (this.electronService.isElectron) {
            this.electronService.main.getFiles(dir);
        } else {
            // we'll need to use mocked file data here
        }
    }

    public reloadFiles() {
        const fileList = this.ts.getCurrentTracks().map(t => t.meta.folder + t.meta.filename);
        this.electronService.main.loadFiles(fileList);
    }

    public guessTitles() {
        this.ts.guessTitles();
    }

    renumberTracks() {
        this.ts.renumberTracks(1);
    }
}
