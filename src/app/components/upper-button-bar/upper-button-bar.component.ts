import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { ElectronService } from '@services/electron.service';
import { TitleCaseService } from '@services/title-case.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { TrackService } from '../../services/track.service';

@Component({
    selector: 'upper-button-bar',
    templateUrl: './upper-button-bar.component.html',
    styleUrls: ['./upper-button-bar.component.scss'],
})
export class UpperButtonBarComponent implements OnInit, OnDestroy {
    public filesLoaded = false;
    public startNumber = 1;
    public capitalizationBad = false;

    private metadataSubscription: Subscription;

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private ts: TrackService,
                private titleCaseService: TitleCaseService) {
        ts.getTracks().subscribe(tracks => {
            this.filesLoaded = tracks.length > 0;
        });
    }

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            this.capitalizationBad = this.titleCaseService.hasBadCaps(m.title);
        });
    }

    ngOnDestroy() {
        this.metadataSubscription.unsubscribe();
    }

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

    public fixCapitalization() {
        this.ts.fixCapitalization();
    }

    public guessTitles() {
        this.ts.guessTitles();
    }

    public renumberTracks() {
        this.ts.renumberTracks(this.startNumber);
    }

    public inputClick(event: Event) {
        event.stopPropagation();
    }
}
