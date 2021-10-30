import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { InputTypes } from 'app/input-field/input-field.component';
import { Subscription } from 'rxjs';
import { MetadataProperty, TrackService } from '../services/track.service';

@Component({
    selector: 'right-panel',
    templateUrl: './right-panel.component.html',
    styleUrls: ['./right-panel.component.scss'],
})
export class RightPanelComponent implements OnInit, OnDestroy {
    @Input() tracks: any[] = [];

    public conflictProperty: MetadataProperty;
    public conflictDisplayName: string;
    public conflictReadOnly: boolean;
    public hideConflicts = 0;
    public inputTypes = InputTypes;
    public metadata: { [key: string]: MetadataProperty; };
    public metadataSubscription: Subscription;
    public releaseTypes = [];
    public showModal = false;

    constructor(private ts: TrackService) {
    }

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            console.log(m);
            this.metadata = m;
        });
        this.releaseTypes = [
            'Album',
            'EP',
            'Single',
            'Live',
            'Compilation',
            'Soundtrack',
            'Anthology',
            'Bootleg',
            'Remix',
            'Demo',
            'Comedy',
        ];
    }

    ngOnDestroy() {
        this.metadataSubscription.unsubscribe();
    }

    guessArtistSortOrder() {
        const artist: string = this.metadata.artist.default;
        let sortOrder = '';
        if (artist.toLowerCase().indexOf('the ') === 0) {
            sortOrder = artist.substr(4) + ', The';
        } else {
            if (artist.trim().indexOf(' ') !== -1) {
                const artistParts = artist.split(' ');
                sortOrder = artistParts.pop() + ', ';
                sortOrder += artistParts.join(' ');
            }
        }
        this.updateValue('artistSortOrder', sortOrder);
    }

    updateValue(fieldname: string, value: string) {
        const metaField = this.metadata[fieldname];
        metaField.default = value;
        metaField.defaultChanged = true;
    }

    public showConflict(property: MetadataProperty, name: string, readOnly = false) {
        this.conflictProperty = property;
        this.conflictDisplayName = name;
        this.conflictReadOnly = readOnly;
        this.showModal = true;
    }
    // sendHide() {
    //     this.hideConflicts++;
    // }

    public swapDates() {
        const metadata = this.ts.getCurrentMetadata();
        const date: MetadataProperty = JSON.parse(JSON.stringify(metadata.date));
        const originalDate: MetadataProperty = JSON.parse(JSON.stringify(metadata.originalReleaseDate));
        metadata.date = originalDate;
        // metadata.date.changed = true;
        metadata.originalReleaseDate = date;
        // metadata.originalReleaseDate.changed = true;
        this.ts.setMetadata(metadata);
    }

    public setReleaseCountry(country: string) {
        const metadata = this.ts.getCurrentMetadata();
        metadata.RELEASECOUNTRY.default = country;
        metadata.RELEASECOUNTRY.defaultChanged = true;
        this.ts.setMetadata(metadata);
    }

    public tab2hasValues(): boolean {
        return !!(this.metadata.copyright?.default ||
            this.metadata.encodedBy?.default ||
            this.metadata.MUISCBRAINZ_ARTISTID?.default ||
            this.metadata.MUSICBRAINZ_RELEASEGROUPID?.default);
    }

    public tab2Conflicts(): boolean {
        return (!this.metadata.copyright?.defaultChanged && this.metadata.copyright?.different) ||
            (!this.metadata.encodedBy?.defaultChanged && this.metadata.encodedBy?.different) ||
            (!this.metadata.MUSICBRAINZ_ARTISTID?.defaultChanged && this.metadata.MUSICBRAINZ_ARTISTID?.different) ||
            (!this.metadata.MUSICBRAINZ_RELEASEGROUPID?.defaultChanged && this.metadata.MUSICBRAINZ_RELEASEGROUPID?.different);
    }
}
