import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackOptions, TrackService, UnknownPropertiesObj } from '../services/track.service';

@Component({
    selector: 'left-panel',
    templateUrl: './left-panel.component.html',
    styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
    @Input() tracks: any[] = [];
    @Input() showArtist = false;

    @Output() showArtistChange = new EventEmitter();

    hideConflicts = 0;
    metadata: any;
    trackOptions: TrackOptions;
    unknownProperties: UnknownPropertiesObj;
    public metadataSubscription: Subscription;
    public trackOptionsSubscription: Subscription;

    constructor(private ts: TrackService) {
    }

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            this.metadata = m;
            this.unknownProperties = this.ts.getUnknownProperties();
        });
        this.trackOptionsSubscription = this.ts.getTrackOptions().subscribe(o => {
            this.trackOptions = o;
        });
    }

    ngOnDestroy() {
        this.metadataSubscription.unsubscribe();
        this.trackOptionsSubscription.unsubscribe();
    }

    showArtistChanged(val) {
        this.showArtistChange.emit(val);
    }

    sendHide() {
        this.hideConflicts++;
    }
}
