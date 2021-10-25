import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs/internal/Subscription';
import { TrackService } from './services/track.service';
import { TrackServiceMocks } from './services/track.service.mock';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    fileList: any[] = [];

    public trackSubscription: Subscription;

    constructor(private electronService: ElectronService,
                private ts: TrackService,
                private zone: NgZone) {
        // we need to call zone.run() whenever the trackSubscription updates
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.trackSubscription = ts.getTracks().subscribe(tracks => zone.run(() => {}));
    }

    ngOnInit() {
        if (this.electronService.isElectronApp) {
            const mainProcess = this.electronService.remote.require('./main.js');
            mainProcess.loadHardCoded();
        } else {
            // we'll need to use mocked file data here
            this.ts.setTracks(TrackServiceMocks.mockTracks());
        }
        this.electronService.ipcRenderer.on('files', (event, json) => {
            this.ts.setTracks(json);
        });
    }

    ngOnDestroy() {
        this.trackSubscription.unsubscribe();
    }
}
