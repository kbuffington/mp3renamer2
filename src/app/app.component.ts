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

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private ts: TrackService,
                private zone: NgZone) {
        configService.loadConfig();
        // we need to call zone.run() whenever the trackSubscription updates
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.trackSubscription = ts.getTracks().subscribe(tracks => zone.run(() => {}));
    }

    ngOnInit() {
        this.ts.setTracks([]);
        if (!this.electronService.remote.app.isPackaged) {
            if (this.electronService.isElectron) {
                const mainProcess = this.electronService.remote.require('./main.js');
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
}
