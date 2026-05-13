import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArtistCacheService } from '@services/artist-cache.service';
import { ArtistCredit, ArtistData, Release, Work } from '@classes/musicbrainz.classes';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { ThrottleService } from '@services/throttle.service';
import { TrackService } from '@services/track.service';
import { MetadataKey, MetadataObj, MetadataProperty } from '@classes/track.classes';
import { throwError as observableThrowError } from 'rxjs';
import { CacheService } from '@services/cache.service';
import { ElectronService } from '@services/electron.service';
import { TitleCaseService } from '@services/title-case.service';
import { ValuesWrittenService } from '@services/values-written.service';
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
        let needsArtistCol = false;
        metadata.trackNumber?.values.forEach((trackNumber: string, index) => {
            const pos = (partOfSet.useDefault ? partOfSet.default : partOfSet.values[index]).split(
                '/',
            );
            const disc = parseInt(pos[0]) ? parseInt(pos[0]) : 1;
            const discTrackStr = `${disc}-${parseInt(trackNumber)}`;
            const t = this.tracks.find(track => track.discTrackStr === discTrackStr);
            if (t && t.metadataFoundIndex === -1) {
                t.metadataFoundIndex = index;
                t.metadataTitle = metadata.title?.values[index];
                if (t.metadataTitle && t.title !== t.metadataTitle) {
                    const dmp = new DiffMatchPatch();
                    const diffs = dmp.diff_main(t.metadataTitle, t.title);
                    dmp.diff_cleanupSemantic(diffs);
                    t.titleDiffs = diffs;
                }
                t.metadataArtist = metadata.artist?.values[index];
                if (t.metadataArtist && t.artistString !== t.metadataArtist) {
                    needsArtistCol = true;
                    const dmp = new DiffMatchPatch();
                    const diffs = dmp.diff_main(t.metadataArtist, t.artistString);
                    dmp.diff_cleanupSemantic(diffs);
                    t.artistDiffs = diffs;
                }
            }
        });
        this.needsArtistCol =
            needsArtistCol || this.tracks.some(t => t.artistString !== this.artistString);
    }
}

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

@Component({
    selector: 'get-metadata',
    templateUrl: './get-metadata.component.html',
    styleUrls: ['./get-metadata.component.scss'],
    standalone: false,
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
    public hasVinylTracks = false;
    public numCovers = 0; // number of cover artists for album
    public numTracks: number;
    public releaseGroup: string;
    public selectedRelease: ReleaseDisplay;
    public useVinylNumbering = false;

    private metadata: MetadataObj;

    constructor(
        private mb: MusicbrainzService,
        private router: Router,
        private artistCache: ArtistCacheService,
        private throttleService: ThrottleService,
        private titleCaseService: TitleCaseService,
        private cs: CacheService,
        private electronService: ElectronService,
        private ts: TrackService,
        private valuesWrittenService: ValuesWrittenService,
    ) {}

    public copyCatalog() {
        const val = this.selectedRelease?.labelInfo?.selectedCatalog;
        if (val) {
            this.electronService.remote.clipboard.writeText(val);
        }
    }

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
        return this.mb
            .searchReleases(
                {
                    artist: this.artist,
                    release: this.album,
                    date: this.date,
                    releaseGroup: this.releaseGroup,
                },
                this.fuzzySearch,
            )
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
            this.mb.getReleaseInfo(release.id).subscribe(
                (release: any) => {
                    this.numCovers = 0;
                    this.selectedRelease = new ReleaseDisplay(release, this.metadata);
                    this.hasVinylTracks = this.selectedRelease.tracks.some(
                        t => t.position != t['number'],
                    );
                    this.useVinylNumbering = false;
                    console.log(this.selectedRelease);
                    const isVariousArtists = ['Various Artists', 'Soundtrack'].includes(
                        this.selectedRelease.artistString,
                    );
                    const trackCredits = isVariousArtists
                        ? this.selectedRelease.tracks.flatMap(t => t.artistCredits)
                        : [];
                    this.getArtistCountries([
                        ...this.selectedRelease.artistCredits,
                        ...trackCredits,
                    ]);
                    this.selectedRelease.tracks.forEach(track => {
                        track.relations.forEach(relation => {
                            if (relation.attributes.includes('cover')) {
                                this.numCovers++;
                                this.mb
                                    .getWork(relation.work.id)
                                    .then(work => {
                                        const w = new Work(work);
                                        const rel = w.relations.find(
                                            r => r.attributes.length === 0,
                                        );
                                        if (
                                            rel?.artistString &&
                                            rel.artistString !== track.artistString
                                        ) {
                                            track.originalArtist = rel.artistString;
                                            this.hasCovers = true;
                                        }
                                        this.numCovers--;
                                    })
                                    .catch(err => err);
                            }
                        });
                    });
                },
                error => this.handleError(error),
            );
        }, 10);
    }

    private async getArtistCountries(artists: ArtistCredit[]) {
        const artistIds = [
            ...new Set(
                artists
                    .filter(
                        a =>
                            a.artist &&
                            a.name !== 'Various Artists' &&
                            a.name !== 'Soundtrack' &&
                            !this.artistCache.has(a.artist.id),
                    )
                    .map(a => a.artist.id),
            ),
        ];
        if (artistIds.length) {
            const artistData = await this.mb.getArtists(artistIds);
            for (const artist of artistData.artists) {
                if (artist.country) {
                    this.artistCache.set(new ArtistData(artist));
                } else if (artist.area) {
                    const country = await this.mb.getCountry(artist.area.id);
                    artist.country = country;
                    this.artistCache.set(new ArtistData(artist));
                }
            }
        }
    }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        const errMsg = error.message
            ? error.message
            : error.status
            ? `${error.status} - ${error.statusText}`
            : 'Server error';
        console.error(errMsg); // log to console instead
        return observableThrowError(errMsg);
    }

    private setMetadataVal(metadata: MetadataObj, key: MetadataKey, val: string) {
        metadata[key]!.defaultChanged = true;
        metadata[key]!.default = val;
    }

    private setNewDefault(metadata: MetadataObj, key: MetadataKey) {
        const firstVal = metadata[key]!.values.find(val => val) ?? '';
        this.setMetadataVal(metadata, key, firstVal);
        this.setDifferentFlag(metadata[key]!);
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
        this.setMetadataVal(metadata, 'CATALOGNUMBER', release.labelInfo?.selectedCatalog ?? '');
        this.setMetadataVal(metadata, 'EDITION', release.disambiguation);
        this.setMetadataVal(metadata, 'LABEL', release.labelInfo?.allLabels ?? '');
        this.setMetadataVal(metadata, 'RELEASECOUNTRY', release.country);
        this.setMetadataVal(metadata, 'RELEASETYPE', release.releaseGroup.primaryType);
        this.setMetadataVal(metadata, 'MUSICBRAINZ_RELEASEGROUPID', release.releaseGroup.id);
        this.setMetadataVal(metadata, 'MUSICBRAINZ_ARTISTID', release.artistCredits[0].artist.id);
        this.setMetadataVal(
            metadata,
            'MUSICBRAINZ_LABELID',
            release.labelInfo?.labelIds.join('; ') ?? '',
        );
        if (
            new Date(release.date).getTime() -
                new Date(release.releaseGroup.firstReleaseDate).getTime() >
            ONE_WEEK
        ) {
            this.setMetadataVal(
                metadata,
                'originalReleaseDate',
                release.releaseGroup.firstReleaseDate,
            );
        } else {
            this.setMetadataVal(metadata, 'originalReleaseDate', '');
        }

        const needsAlbumArtist = release.tracks.some(
            track => track.artistString !== release.artistString,
        );
        release.tracks.forEach((track: any) => {
            if (track.metadataFoundIndex >= 0) {
                metadata.title!.values[track.metadataFoundIndex] = track.title;
                metadata.artist!.values[track.metadataFoundIndex] = track.artistString;
                metadata.partOfSet!.values[track.metadataFoundIndex] = track.discSet;
                metadata.DISCSUBTITLE!.values[track.metadataFoundIndex] =
                    release.media[track.discNumber - 1].title ?? '';
                metadata.ARTISTFILTER!.values[track.metadataFoundIndex] = track.artistFilter;
                if (track.originalArtist) {
                    metadata.originalArtist!.values[track.metadataFoundIndex] =
                        track.originalArtist;
                }
                if (needsAlbumArtist) {
                    let countries: string[] = [];
                    track.artistIDs.forEach((artistId: string) => {
                        if (this.artistCache.has(artistId)) {
                            const country = this.artistCache.get(artistId)?.country;
                            if (country) {
                                countries.push(country);
                            }
                        }
                    });
                    countries = [...new Set(countries)];
                    metadata.ARTISTCOUNTRY!.values[track.metadataFoundIndex] = countries.join('; ');
                }
            }
        });
        this.setDifferentFlag(metadata.artist!);
        // these properties were changed in forEach, so find and set new default
        this.setNewDefault(metadata, 'originalArtist');
        this.setNewDefault(metadata, 'partOfSet');
        this.setNewDefault(metadata, 'DISCSUBTITLE');
        this.setNewDefault(metadata, 'ARTISTFILTER');
        if (needsAlbumArtist) {
            this.setNewDefault(metadata, 'ARTISTCOUNTRY');
        } else {
            const releaseCountries = [
                ...new Set(
                    release.artistCredits
                        .map(ac => this.artistCache.get(ac.artist!.id)?.country)
                        .filter(c => c),
                ),
            ];
            if (releaseCountries.length) {
                this.setMetadataVal(metadata, 'ARTISTCOUNTRY', releaseCountries.join('; '));
            }
            metadata.ARTISTCOUNTRY!.different = false;
            metadata.ARTISTCOUNTRY!.useDefault = true;
        }

        // album artist
        this.setMetadataVal(
            metadata,
            'performerInfo',
            needsAlbumArtist ? release.artistString : '',
        );

        // artist sort order
        this.setMetadataVal(
            metadata,
            'artistSortOrder',
            release.artistSortString !== release.artistString ? release.artistSortString : '',
        );

        if (this.useVinylNumbering) {
            this.applyVinylNumbering(metadata, release);
        }

        this.ts.setMetadata(metadata);
        this.valuesWrittenService.markDirty();
        this.router.navigate(['/']);
    }

    private applyVinylNumbering(metadata: MetadataObj, release: ReleaseDisplay) {
        release.tracks.forEach(track => {
            if (track.metadataFoundIndex >= 0) {
                const number = String(track['number'] ?? '');
                const sideMatch = number.match(/^([A-Za-z]+)/);
                const numMatch = number.match(/(\d+)$/);
                metadata['VINYL SIDE'].values[track.metadataFoundIndex] = sideMatch
                    ? sideMatch[1]
                    : '';
                metadata['VINYL TRACKNUMBER'].values[track.metadataFoundIndex] = numMatch
                    ? numMatch[1]
                    : '';
            }
        });
        this.setNewDefault(metadata, 'VINYL SIDE');
        this.setNewDefault(metadata, 'VINYL TRACKNUMBER');
    }

    public guessCase(prop: string) {
        this.selectedRelease[prop] = this.titleCaseService.titleCaseString(
            this.selectedRelease[prop],
        );
    }

    public copyOriginalReleaseToDate() {
        this.selectedRelease.date = this.selectedRelease.releaseGroup.firstReleaseDate;
    }

    public clearCache() {
        this.cs.clearAll();
        this.requestMetadata();
    }
}
