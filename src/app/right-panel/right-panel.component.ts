import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { InputTypes } from 'app/input-field/input-field.component';
import { Subscription } from 'rxjs';
import { TrackService } from '../services/track.service';
import { MetadataProperty, UnknownPropertiesObj } from '../classes/track.classes';
import { ElectronService } from '@services/electron.service';

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
    public inputTypes = InputTypes;
    public metadata: { [key: string]: MetadataProperty; };
    public metadataSubscription: Subscription;
    public releaseTypes = [];
    public showModal = false;
    public unknownProperties: UnknownPropertiesObj;

    private hasUnknownProps: boolean;

    constructor(private ts: TrackService,
                private electronService: ElectronService) {}

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            console.log(m);
            this.metadata = m;
            this.unknownProperties = this.ts.getUnknownProperties();
            this.hasUnknownProps = Object.keys(this.unknownProperties).length !== 0;
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
        return !!(this.hasUnknownProps ||
            this.metadata.copyright?.default ||
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

    public openMusicBrainz(prop: string) {
        let mbid;
        let urlBase;
        if (prop === 'MUSICBRAINZ_ARTISTID') {
            mbid = this.metadata.MUSICBRAINZ_ARTISTID.default;
            urlBase = 'artist';
        } else if (prop === 'MUSICBRAINZ_RELEASEGROUPID') {
            urlBase = 'release-group';
            mbid = this.metadata.MUSICBRAINZ_RELEASEGROUPID.default;
        }
        const url = `https://musicbrainz.org/${urlBase}/${mbid}`;
        this.electronService.remote.shell.openExternal(url);
    }

    public openFanart() {
        const artistId = this.metadata.MUSICBRAINZ_ARTISTID.default;
        const url = `http://fanart.tv/artist/${artistId}`;
        this.electronService.remote.shell.openExternal(url);
    }
}
