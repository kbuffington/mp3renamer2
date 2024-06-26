import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { ElectronService } from '@services/electron.service';
import { TitleFormatService } from '@services/title-format.service';
import { TrackService } from '@services/track.service';

import { MetadataObj, Track } from '@classes/track.classes';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
    public clickOccurred: number;
    public showArtist = true;
    public tracks: Track[] = [];
    public metadata: MetadataObj;
    public setNamesDisabled = true;
    public renameFolderDisabled = true;

    private setNamesCheck: any;
    private trackSubscription: Subscription;
    private metadataSubscription: Subscription;

    constructor(
        private electronService: ElectronService,
        private cs: ConfigService,
        private tf: TitleFormatService,
        private ts: TrackService,
    ) {}

    ngOnInit() {
        this.trackSubscription = this.ts.getTracks().subscribe(tracks => {
            this.tracks = tracks;
            // console.log(this.tf.eval('$roman(%tracknumber%)', 0));
            // console.log(this.tf.eval('$lower(%artistsortorder%) $upper(%artist%) $year($year(%date%))'));
        });
        this.metadataSubscription = this.ts.getMetadata().subscribe(metadata => {
            this.metadata = metadata;
            this.showArtist = this.metadata.artist.different;
        });
        this.setNamesCheck = setInterval(() => {
            this.isSetNamesDisabled();
            this.isRenameFolderDisabled();
        }, 200);
    }

    ngOnDestroy() {
        this.trackSubscription.unsubscribe();
        this.metadataSubscription.unsubscribe();
        clearInterval(this.setNamesCheck);
    }

    public previewRename() {
        this.ts.previewFilenames('');
        this.isSetNamesDisabled();
    }

    public revertRename() {
        this.ts.revertFilenames();
        this.setNamesDisabled = true;
    }

    public setNames() {
        this.ts.setFilenames();
        this.setNamesDisabled = true;
    }

    public renameFolder() {
        this.ts.renameFolder();
        this.renameFolderDisabled = true;
    }

    public downloadArt() {
        const config = this.cs.getCurrentConfig();
        const artist = this.tf.eval('%artist%');
        const album = this.tf.eval('%album%');
        const paramsString = config.aadParams
            .replace('%artist%', 'FIXARTISTSTRING')
            .replace('%album%', 'FIXALBUMSTRING');
        let params = this.tf.eval(paramsString).split(' /');
        params = params.map(p => {
            if (p[0] !== '/') {
                p = '/' + p;
            }
            return p.trim();
        });
        const splitParams = [];
        params.forEach(p => {
            const index = p.indexOf(' ');
            splitParams.push(
                p.substring(0, index),
                p
                    .substring(index + 1)
                    .replace('FIXARTISTSTRING', artist)
                    .replace('FIXALBUMSTRING', album)
                    .replace(/^"/, '')
                    .replace(/"$/, ''),
            );
        });

        console.log(params, splitParams);
        const path = this.electronService.path.parse(config.aadPath);
        const aad = this.electronService.childProcess.execFile(
            `${path.dir}\\${path.base}`,
            splitParams.filter(p => p.length),
        );
        aad.on('error', err => console.error('error:', err));
    }

    public quitApp() {
        this.electronService.main.quitApp();
    }

    private isSetNamesDisabled() {
        if (!this.tracks.length) {
            return true;
        }
        this.setNamesDisabled = !this.tracks.some(t => t.meta.filename !== t.meta.originalFilename);
    }

    private isRenameFolderDisabled() {
        if (!this.tracks.length) {
            return true;
        }
        this.renameFolderDisabled = this.ts.getNewFolderName() === this.ts.getCurrentDirectory();
    }

    public clicked() {
        this.clickOccurred = Date.now();
    }
}
