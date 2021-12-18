import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { ElectronService } from '@services/electron.service';
import { TitleFormatService } from '@services/title-format.service';
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

    constructor(private electronService: ElectronService,
                private cs: ConfigService,
                private tf: TitleFormatService,
                private ts: TrackService) {
    }

    ngOnInit() {
        this.trackSubscription = this.ts.getTracks().subscribe(tracks => this.tracks = tracks);
        this.metadataSubscription = this.ts.getMetadata().subscribe(metadata => {
            this.metadata = metadata;
            this.showArtist = this.metadata.artist.different;
        });
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
        const config = this.cs.getCurrentConfig();
        let params = this.tf.eval(config.aadParams).split(' /');
        params = params.map(p => {
            if (p[0] !== '/') {
                p = '/' + p;
            }
            return p.trim();
        });
        const splitParams = [];
        params.forEach(p => {
            const index = p.indexOf(' ');
            splitParams.push(p.substring(0, index), p.substring(index + 1).replace(/^"/, '').replace(/"$/, ''));
        });

        console.log(params, splitParams);
        const path = this.electronService.path.parse(config.aadPath);
        const aad = this.electronService.childProcess.execFile(`${path.dir}\\${path.base}`, splitParams.filter(p => p.length));
        aad.on('error', (err) => console.error('error:', err) );
    }

    quitApp() {
        const mainProcess = this.electronService.remote.require('./main.js');
        mainProcess.quitApp();
    }
}
