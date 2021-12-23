import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { ElectronService } from '@services/electron.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { TrackService } from './services/track.service';
import { TrackServiceMocks } from './services/track.service.mock';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    public trackSubscription: Subscription;
    public title = 'MP3 Renamer2';

    public tracks = [];

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private ts: TrackService,
                private zone: NgZone) {
        configService.loadConfig();
        // we need to call zone.run() whenever the trackSubscription updates
        this.trackSubscription = ts.getTracks().subscribe(tracks => {
            zone.run(() => {});
            this.tracks = tracks;
        });
        ts.getFolder().subscribe(folder => {
            this.title = folder ? folder : 'MP3 Renamer2';
            zone.run(() => {});
        });
    }

    ngOnInit() {
        this.ts.setTracks([]);
        if (this.electronService.main.cliArguments.length) {
            const startPath = this.electronService.main.cliArguments.shift().replace(/\\\\/g, '\\');
            console.log('Loading files from:', startPath);
            this.electronService.main.loadFilesFromFolder(startPath);
        } else if (!this.electronService.remote.app.isPackaged) {
            if (this.electronService.isElectron) {
                const mainProcess = this.electronService.main;
                if (mainProcess.os !== 'win32') {
                    mainProcess.loadHardCoded();
                }
            } else {
                // we'll need to use mocked file data here
                this.ts.setTracks(TrackServiceMocks.mockTracks());
            }
        }
        this.electronService.ipcRenderer.on('files', (event, json) => {
            this.ts.setTracks(json);
        });
    }

    ngOnDestroy() {
        this.trackSubscription.unsubscribe();
    }

    public openFolder() {
        if (this.tracks.length) {
            const path = this.electronService.path.parse(this.ts.getCurrentPath());
            switch (this.electronService.remote.process.platform) {
                case 'win32':
                    this.electronService.childProcess.execFile('explorer.exe', [`${path.dir}\\${path.base}`])
                        .on('error', err => console.error(err));
                    break;
                default:
                case 'darwin':
                    this.electronService.childProcess.spawn('open', [`${path.dir}/${path.base}`])
                        .on('error', err => console.error(err));
                    break;
            }
        }
    }
}
