import { Component, OnDestroy, OnInit } from '@angular/core';
import { ElectronService } from '@services/electron.service';

import { TrackService } from '@services/track.service';
import { MetadataObj } from '@classes/track.classes';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
    public showArtist = true;
    public tracks: any[] = [];
    public metadata: MetadataObj;

    private trackSubscription: Subscription;
    private metadataSubscription: Subscription;

    constructor(private electronService: ElectronService, private ts: TrackService) {
    }

    ngOnInit() {
        this.trackSubscription = this.ts.getTracks().subscribe(tracks => this.tracks = tracks);
        this.metadataSubscription = this.ts.getMetadata().subscribe(metadata => this.metadata = metadata);
    }

    ngOnDestroy() {
        this.trackSubscription.unsubscribe();
        this.metadataSubscription.unsubscribe();
    }

    previewRename() {
        this.ts.previewFilenames('');
    }

    revertRename() {
        this.ts.revertFilenames();
    }

    setNames() {
        this.ts.setFilenames();
    }

    renameFolder() {
        this.ts.renameFolder();
    }

    downloadArt() {
        console.log('TODO: downloadArt() in main.component');
    }

    quitApp() {
        const mainProcess = this.electronService.remote.require('./main.js');
        mainProcess.quitApp();
    }
}
