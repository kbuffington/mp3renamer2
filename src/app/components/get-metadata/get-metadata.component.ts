import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArtistCacheService } from '@services/artist-cache.service';
import { ArtistCredit, ArtistData, Release, Work } from '@classes/musicbrainz.classes';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { ThrottleService } from '@services/throttle.service';
import { TrackService } from '@services/track.service';
import { MetadataObj, MetadataProperty } from '@classes/track.classes';
import { throwError as observableThrowError } from 'rxjs';
import { CacheService } from '@services/cache.service';
import { TitleCaseService } from '@services/title-case.service';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';

export enum DiffMatchType {
    Equal = 0,
    Add = 1,
    Remove = -1,
}

export class ReleaseDisplay extends Release {
    needsArtistCol: boolean;

    constructor(json: any, metadata: MetadataObj) {
        super(json);
        const partOfSet = metadata.partOfSet;
        metadata.trackNumber.values.forEach((trackNumber: string, index) => {
            const pos = (partOfSet.useDefault ? partOfSet.default : partOfSet.values[index]).split('/');
            const disc = parseInt(pos[0]) ? parseInt(pos[0]) : 1;
            const discTrackStr = `${disc}-${parseInt(trackNumber)}`;
            const t = this.tracks.find(track => track.discTrackStr === discTrackStr);
            if (t && t.metadataFoundIndex === -1) {
                t.metadataFoundIndex = index;
                t.metadataTitle = metadata.title.values[index];
                if (t.title !== t.metadataTitle) {
                    const dmp = new DiffMatchPatch();
                    const diffs = dmp.diff_main(t.metadataTitle, t.title);
                    dmp.diff_cleanupSemantic(diffs);
                    t.titleDiffs = diffs;
                }
                t.metadataArtist = metadata.artist.values[index];
                if (t.artistString !== t.metadataArtist) {
                    this.needsArtistCol = true;
                    const dmp = new DiffMatchPatch();
                    const diffs = dmp.diff_main(t.metadataArtist, t.artistString);
                    dmp.diff_cleanupSemantic(diffs);
                    t.artistDiffs = diffs;
                }
            }
        });
        this.needsArtistCol = this.needsArtistCol || this.tracks.some(t => t.artistString !== this.artistString);
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
    public date = '';
    public diffMatchType = DiffMatchType;
    public fetchingReleases = false;
    public fuzzySearch = false;
    public hasCovers = false;
    public numCovers = 0; // number of cover artists for album
    public numTracks: number;
    public releaseGroup: string;
    public selectedRelease: ReleaseDisplay;

    private metadata: MetadataObj;

    constructor(private mb: MusicbrainzService,
                private router: Router,
                private artistCache: ArtistCacheService,
                private throttleService: ThrottleService,
                private titleCaseService: TitleCaseService,
                private cs: CacheService,
                private ts: TrackService) {}

    ngOnInit() {
        this.metadata = this.ts.getCurrentMetadata();
        this.artist = this.metadata.artist.default;
        this.album = this.metadata.album.default;
        this.releaseGroup = this.metadata.MUSICBRAINZ_RELEASEGROUPID.default;
        this.numTracks = this.ts.getNumTracks();
        if (this.artist || this.album) {
            this.requestMetadata().then(() => {
                setTimeout(() => {
                    if (!this.releases.length) {
                        this.fuzzySearch = true;
                        this.requestMetadata();
                    }
                }, 10);
            });
        }
    }

    public requestMetadata(): Promise<any> {
        this.selectedRelease = null;
        this.fetchingReleases = true;
        this.throttleService.clearQueuedRequests();
        return this.mb.searchReleases({
            artist: this.artist, release: this.album, date: this.date, releaseGroup: this.releaseGroup,
        }, this.fuzzySearch)
            .then(data => {
                // set timeout so release table refreshes even if entry is cached
                setTimeout(() => {
                    this.fetchingReleases = false;
                    this.releaseData = data;
                    this.releases = data.releases?.map(r => new Release(r)) ?? [];
                });
            });
    }

    public getReleaseInfo(release: Release) {
        this.hasCovers = false;
        this.selectedRelease = null;
        this.throttleService.clearQueuedRequests();
        setTimeout(() => {
            this.mb.getReleaseInfo(release.id)
                .subscribe(
                    (release: any) => {
                        this.numCovers = 0;
                        this.selectedRelease = new ReleaseDisplay(release, this.metadata);
                        console.log(this.selectedRelease);
                        this.getArtistCountries(this.selectedRelease.artistCredits);
                        this.selectedRelease.tracks.forEach(track => {
                            track.relations.forEach(relation => {
                                if (relation.attributes.includes('cover')) {
                                    this.numCovers++;
                                    this.mb.getWork(relation.work.id).then(work => {
                                        const w = new Work(work);
                                        const rel = w.relations.find(r => r.attributes.length === 0);
                                        if (rel?.artistString && rel.artistString !== track.artistString) {
                                            track.originalArtist = rel.artistString;
                                            this.hasCovers = true;
                                            this.numCovers--;
                                        }
                                    }).catch(err => err);
                                }
                            });
                        });
                    },
                    error => this.handleError(error));
        }, 10);
    }

    private getArtistCountries(artists: ArtistCredit[]) {
        const artistIds = artists.filter(a => {
            return a.name !== 'Various Artists' && !this.artistCache.has(a.artist.id);
        }).map(a => a.artist.id);
        if (artistIds.length) {
            this.mb.getArtists(artistIds).then(artistData => {
                artistData.artists.forEach(artist => {
                    if (artist.country) {
                        this.artistCache.set(new ArtistData(artist));
                    } else if (artist.area) {
                        this.mb.getCountry(artist.area.id).then(country => {
                            artist.country = country;
                            this.artistCache.set(new ArtistData(artist));
                        });
                    }
                });
            });
        }
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
        metadata[key].defaultChanged = true;
        metadata[key].default = val;
    }

    private setNewDefault(metadata: MetadataObj, key: string) {
        const firstVal = metadata[key].values.find(val => val) ?? '';
        this.setMetadataVal(metadata, key, firstVal);
        this.setDifferentFlag(metadata[key]);
    }

    private setDifferentFlag(metaProp: MetadataProperty) {
        const firstVal = metaProp.values[0] ?? undefined;
        metaProp.different = metaProp.values.some(v => v !== firstVal);
        metaProp.useDefault = !metaProp.different;
    }

    public apply(release: ReleaseDisplay) {
        const metadata = this.ts.getCurrentMetadata();
        this.setMetadataVal(metadata, 'artist', release.artistString);
        this.setMetadataVal(metadata, 'album', release.title);
        this.setMetadataVal(metadata, 'date', release.date);
        this.setMetadataVal(metadata, 'CATALOGNUMBER', release.labelInfo.selectedCatalog ?? '');
        this.setMetadataVal(metadata, 'EDITION', release.disambiguation);
        this.setMetadataVal(metadata, 'LABEL', release.labelInfo.allLabels);
        this.setMetadataVal(metadata, 'RELEASECOUNTRY', release.country);
        this.setMetadataVal(metadata, 'RELEASETYPE', release.releaseGroup.primaryType);
        this.setMetadataVal(metadata, 'MUSICBRAINZ_RELEASEGROUPID', release.releaseGroup.id);
        this.setMetadataVal(metadata, 'MUSICBRAINZ_ARTISTID', release.artistCredits[0].artist.id);
        this.setMetadataVal(metadata, 'MUSICBRAINZ_LABELID', release.labelInfo.labelIds.join('; '));
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
                if (track.originalArtist) {
                    metadata.originalArtist.values[track.metadataFoundIndex] = track.originalArtist;
                }
                let countries = [];
                track.artistIDs.forEach((artistId: string) => {
                    if (this.artistCache.has(artistId)) {
                        countries.push(this.artistCache.get(artistId).country);
                    }
                });
                countries = [...new Set(countries)];
                metadata.ARTISTCOUNTRY.values[track.metadataFoundIndex] = countries.join('; ');
            }
        });
        this.setDifferentFlag(metadata.artist);
        // these properties were changed in forEach, so find and set new default
        this.setNewDefault(metadata, 'originalArtist');
        this.setNewDefault(metadata, 'partOfSet');
        this.setNewDefault(metadata, 'DISCSUBTITLE');
        this.setNewDefault(metadata, 'ARTISTFILTER');
        this.setNewDefault(metadata, 'ARTISTCOUNTRY');

        // album artist
        const needsAlbumArtist = release.tracks.some(track => track.artistString !== release.artistString);
        this.setMetadataVal(metadata, 'performerInfo', needsAlbumArtist ? release.artistString : '');

        // artist sort order
        this.setMetadataVal(metadata, 'artistSortOrder',
            release.artistSortString !== release.artistString ? release.artistSortString : '');

        this.ts.setMetadata(metadata);
        this.router.navigate(['/']);
    }

    public guessCase(prop) {
        this.selectedRelease[prop] = this.titleCaseService.titleCaseString(this.selectedRelease[prop]);
    }

    public copyOriginalReleaseToDate() {
        this.selectedRelease.date = this.selectedRelease.releaseGroup.firstReleaseDate;
    }

    public clearCache() {
        this.cs.clearAll();
        this.requestMetadata();
    }
}
