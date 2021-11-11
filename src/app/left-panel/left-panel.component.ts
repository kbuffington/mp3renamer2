import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetadataObj, MetadataProperty, TrackOptions, TrackService, UnknownPropertiesObj } from '../services/track.service';

@Component({
    selector: 'left-panel',
    templateUrl: './left-panel.component.html',
    styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
    @Input() tracks: any[] = [];
    @Input() showArtist = false;

    @Output() showArtistChange = new EventEmitter();

    public conflictProperty: MetadataProperty;
    public conflictDisplayName: string;
    public conflictReadOnly: boolean;
    public metadata: MetadataObj;
    public metadataSubscription: Subscription;
    public showModal = false;
    public trackOptions: TrackOptions;
    public trackOptionsSubscription: Subscription;
    public unknownProperties: UnknownPropertiesObj;

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

    public showConflict(property: MetadataProperty, name: string, readOnly = false) {
        this.conflictProperty = property;
        this.conflictDisplayName = name;
        this.conflictReadOnly = readOnly;
        this.showModal = true;
    }

    showArtistChanged(val) {
        this.showArtistChange.emit(val);
    }
}
