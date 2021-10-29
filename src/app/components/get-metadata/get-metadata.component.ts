import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Release } from '@services/musicbrainz.classes';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { MetadataObj, TrackService } from '@services/track.service';
import { throwError as observableThrowError } from 'rxjs';

export class ReleaseDisplay extends Release {
    constructor(json: any, metadata: MetadataObj) {
        super(json);
        const partOfSet = metadata.partOfSet;
        metadata.trackNumber.values.forEach((trackNumber: string, index) => {
            const pos = (partOfSet.changed ? partOfSet.default : partOfSet.values[index]).split('/');
            const disc = parseInt(pos[0]) ? parseInt(pos[0]) : 1;
            const discTrackStr = `${disc}-${parseInt(trackNumber)}`;
            const t = this.tracks.find(track => track.discTrackStr === discTrackStr);
            if (t && t.metadataFoundIndex === -1) {
                t.metadataFoundIndex = index;
                t.metadataTitle = metadata.title.values[index];
                t.metadataDiffers = t.title !== t.metadataTitle;
            }
        });
    }
}

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

@Component({
    selector: 'get-metadata',
    templateUrl: './get-metadata.component.html',
    styleUrls: ['./get-metadata.component.scss'],
})
export class GetMetadataComponent implements OnInit {
    public releaseData: any;
    public releases: Release[] = [];
    public artist = '';
    public album = '';
    public fetchingReleases = false;
    public numTracks: number;
    public selectedRelease: ReleaseDisplay;

    private metadata: MetadataObj;

    constructor(private mb: MusicbrainzService,
                private router: Router,
                private ts: TrackService) {}

    ngOnInit() {
        this.metadata = this.ts.getCurrentMetadata();
        this.artist = this.metadata.artist.default;
        this.album = this.metadata.album.default;
        this.numTracks = this.ts.getNumTracks();
        if (this.artist || this.album) {
            this.requestMetadata();
        }
    }

    public requestMetadata() {
        this.selectedRelease = null;
        this.fetchingReleases = true;
        this.mb.searchReleases({ artist: this.artist, release: this.album })
            .subscribe(
                (data: any) => {
                    this.fetchingReleases = false;
                    this.releaseData = data;
                    this.releases = data.releases?.map(r => new Release(r)) ?? [];
                },
                error => this.handleError(error));
    }

    public getReleaseInfo(release: Release) {
        this.mb.getReleaseInfo(release.id)
            .subscribe(
                (release: any) => {
                    this.selectedRelease = new ReleaseDisplay(release, this.metadata);
                    console.log(this.selectedRelease);
                },
                error => this.handleError(error));
    }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        const errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return observableThrowError(errMsg);
    }

    private setMetadataVal(metadata: MetadataObj, key: string, val: string) {
        // if (metadata[key].default !== val) {
        metadata[key].changed = true;
        // }
        metadata[key].default = val;
    }

    private setNewDefault(metadata: MetadataObj, key: string) {
        const firstVal = metadata[key].values.find(val => val) ?? '';
        this.setMetadataVal(metadata, key, firstVal);
        // should we clear the changed flag?
    }

    public apply(release: ReleaseDisplay) {
        const metadata = this.ts.getCurrentMetadata();
        this.setMetadataVal(metadata, 'artist', release.artistString);
        this.setMetadataVal(metadata, 'album', release.title);
        this.setMetadataVal(metadata, 'date', release.date);
        this.setMetadataVal(metadata, 'performerInfo', release.artistString);
        this.setMetadataVal(metadata, 'CATALOGNUMBER', release.labelInfo.selectedCatalog ?? '');
        this.setMetadataVal(metadata, 'EDITION', release.disambiguation);
        this.setMetadataVal(metadata, 'LABEL', release.labelInfo.allLabels);
        this.setMetadataVal(metadata, 'RELEASECOUNTRY', release.country);
        this.setMetadataVal(metadata, 'RELEASETYPE', release.releaseGroup.primaryType);
        if (new Date(release.date).getTime() - new Date(release.releaseGroup.firstReleaseDate).getTime() > ONE_WEEK) {
            this.setMetadataVal(metadata, 'originalReleaseDate', release.releaseGroup.firstReleaseDate);
        } else {
            this.setMetadataVal(metadata, 'originalReleaseDate', '');
        }

        release.tracks.forEach((track: any) => {
            if (track.metadataFoundIndex >= 0) {
                metadata.title.values[track.metadataFoundIndex] = track.title;
                metadata.artist.values[track.metadataFoundIndex] = track.artistString;
                metadata.partOfSet.values[track.metadataFoundIndex] = track.discSet;
                metadata.DISCSUBTITLE.values[track.metadataFoundIndex] = release.media[track.discNumber - 1].title ?? '';
                metadata.ARTISTFILTER.values[track.metadataFoundIndex] = track.artistFilter;
            }
        });
        // these properties were changed in forEach, so find and set new default
        this.setNewDefault(metadata, 'partOfSet');
        this.setNewDefault(metadata, 'DISCSUBTITLE');
        this.setNewDefault(metadata, 'ARTISTFILTER');

        this.ts.setMetadata(metadata);
        this.router.navigate(['/']);
    }
}
