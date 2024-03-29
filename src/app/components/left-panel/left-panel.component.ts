import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TrackService } from '@services/track.service';
import { Subscription } from 'rxjs';
import { MetadataObj, MetadataProperty } from '../../classes/track.classes';

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
    public deleteString: string;
    public doTitleCase: boolean;
    public findString: string;
    public replaceString: string;
    public metadata: MetadataObj;
    public metadataSubscription: Subscription;
    public showModal = false;

    constructor(private ts: TrackService) {
        this.deleteString = ts.deleteString;
        this.doTitleCase = ts.doTitleCase;
        this.findString = ts.findString;
        this.replaceString = ts.replaceString;
    }

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            this.metadata = m;
        });
    }

    ngOnDestroy() {
        this.metadataSubscription.unsubscribe();
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

    public updateDeleteString(val: string) {
        this.ts.deleteString = val;
    }

    public updateDoTitleCase(val: boolean) {
        this.ts.doTitleCase = val;
    }

    public updateFindReplaceVals() {
        this.ts.findString = this.findString;
        this.ts.replaceString = this.replaceString;
    }
}
