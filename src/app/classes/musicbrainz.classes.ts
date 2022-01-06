import { Diff } from 'diff-match-patch';
import { countryCodes } from '../services/countries';

export class ArtistTag {
    count: number;
    name: string;
}

// object from artist query
export class ArtistData {
    id: string;
    name: string;
    sortName: string;
    country: string;
    type: string;
    tags: ArtistTag[];

    constructor(json: any) {
        this.id = json.id;
        this.name = json.name;
        this.sortName = json['sort-name'];
        this.country = json.country?.length === 2 ? countryCodes.find(c => c.code === json.country).name : json.country;
        this.type = json.type;
        this.tags = json.tags;
    }
}

// object as part of artist-credit in release query
export class Artist {
    disambiguation: string;
    id: string;
    name: string;
    sortName: string;
    type: string;

    constructor(json: any) {
        Object.assign(this, json);
        this.sortName = json['sort-name'];
        delete this['sort-name'];
    }
}

export class ArtistCredit {
    artist?: Artist;
    name: string;
    joinphrase?: string;

    constructor(json: any) {
        Object.assign(this, json);
        if (json.artist) {
            this.artist = new Artist(json.artist);
        }
    }
}

export class Label {
    catalogNum?: string;
    id: string;
    name: string;
    disambiguation: string;

    constructor(json: any) {
        this.catalogNum = json['catalog-number'];
        if (json.label) {
            this.id = json.label.id;
            this.name = json.label.name;
            this.disambiguation = json.label.disambiguation;
        }
    }
}

export class LabelInfo {
    label: Label[] = [];
    allLabels = ''; // semi-colon delimited list of labels
    catalogNumbers = [];
    selectedCatalog: string;
    labelIds: string[] = [];

    constructor(labels: any[]) {
        if (labels.length) {
            labels.forEach(l => {
                if (l['catalog-number'] && !this.catalogNumbers.includes(l['catalog-number'])) {
                    this.catalogNumbers.push(l['catalog-number']);
                }
            });
            // we keep all unique catalog numbers, but remove duplicate labels
            this.label = labels.map(l => new Label(l)).filter(l => {
                if (!this.labelIds.includes(l.id)) {
                    this.labelIds.push(l.id);
                    return true;
                }
                return false;
            });
            this.allLabels = this.label.map(l => l.name).join('; ');
            if (this.catalogNumbers.length) {
                this.selectedCatalog = this.catalogNumbers[0];
            }
        }
    }
}

export class Track {
    id: string;
    position: number;
    length: number;
    title: string;
    discNumber: number;
    relations: WorkRelation[] = [];

    // added fields
    artistIDs: string[];
    artistCredits: ArtistCredit[];
    artistString: string;
    artistDiffs: Diff[] = [];
    artistFilter = ''; // sort-order style name used for artistFilter field
    discSet = ''; // if only one disc, this is empty, otherwise formatted like "1/3"
    discTrackStr: string;
    titleDiffs: Diff[] = []; // does the title differ from the metadata?
    metadataFound = false; // was the track found in the metadata (by discTrackStr)?
    metadataFoundIndex = -1; // index into tracklist of found item
    metadataArtist?: string;
    metadataTitle?: string; // title found in metadata
    originalArtist?: string;
    time: string;

    constructor(json: any, discNumber: number, totalDiscs: number, albumArtist: string) {
        Object.assign(this, json);
        // this.title = this.title.replace(/’/g, '\'');
        this.artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
        delete this['artist-credit'];
        this.artistIDs = this.artistCredits.map(ac => ac.artist.id);
        this.artistString = this.artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
            return idx == 0 ?
                (artist.name + (artist.joinphrase ? artist.joinphrase : '')) :
                prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
        }, '');
        if (this.artistString !== albumArtist) {
            this.artistFilter = this.artistCredits.map(ac => ac.artist.sortName).join('; ');
            if (albumArtist === 'Various Artists' || albumArtist === 'Soundtrack') {
                this.artistFilter += '; ' + albumArtist;
            }
        }
        const seconds = json.length / 1000;
        this.time = `${Math.floor(seconds / 60)}:${('00' + Math.floor(seconds % 60)).slice(-2)}`;
        this.discNumber = discNumber;
        if (totalDiscs > 1) {
            this.discSet = `${discNumber}/${totalDiscs}`;
        }
        this.discTrackStr = `${discNumber}-${this.position}`;
        this.relations = json.recording.relations?.map(r => new WorkRelation(r));
    }
}
export class Media {
    format: string;
    position: number;
    title: string;
    tracks: Track[];

    trackCount: number;

    constructor(json: any, totalMedia: number, albumArtist: string) {
        Object.assign(this, json);
        this.tracks = json.tracks ? json.tracks.map(t => new Track(t, this.position, totalMedia, albumArtist)) : [];
        this.trackCount = json['track-count'];
    }
}

export class ReleaseGroup {
    id: string;
    title: string;
    primaryType: string;
    firstReleaseDate: string;
    typeId: string;
    secondaryTypes: string[];

    constructor(json: any) {
        this.id = json.id;
        this.title = json.title;
        this.primaryType = json['primary-type'];
        this.firstReleaseDate = json['first-release-date'];
        this.typeId = json['primary-type-id'];
        this.secondaryTypes = json['secondary-types'];
    }
}

export class Release {
    barcode: string;
    count: number;
    country: string;
    date: string;
    disambiguation: string;
    id: string;
    media: Media[];
    title: string;

    artistString: string;
    artistSortString: string;
    artistCredits: ArtistCredit[];
    releaseGroup: ReleaseGroup;
    trackCount: number;
    tracks: Track[] = [];
    labelInfo?: LabelInfo;

    constructor(json: any) {
        Object.assign(this, json); // maybe assign all properties to avoid duplicates?
        this.artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
        this.artistString = this.artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
            return idx == 0 ?
                (artist.name + (artist?.joinphrase ?? '')) :
                prevVal + artist.name + (artist?.joinphrase ?? '');
        }, '');
        this.artistSortString = this.artistCredits.reduce((prevVal, credit: ArtistCredit, idx) => {
            return idx == 0 ?
                (credit.artist.sortName + (credit?.joinphrase ?? '')) :
                prevVal + credit.artist.sortName + (credit?.joinphrase ?? '');
        }, '');
        this.media = json.media ? json.media.map(m => new Media(m, json.media.length, this.artistString)) : [];
        this.media.forEach(m => {
            this.tracks.push(...m.tracks);
        });
        this.releaseGroup = new ReleaseGroup(json['release-group']);
        this.labelInfo = json['label-info'] ? new LabelInfo(json['label-info']) : undefined;
        if (json['track-count']) {
            this.trackCount = json['track-count'];
        } else {
            this.trackCount = this.media.reduce((prevVal, m) => prevVal + m.trackCount, 0);
        }
    }
}

export class AreaRelation {
    direction: string;
    type: string;
    area: Area;

    constructor(json: any) {
        this.direction = json.direction;
        this.type = json.type;
        this.area = new Area(json.area);
    }
}

export class Area {
    id: string;
    name: string;
    type: string;
    relations?: AreaRelation[];

    constructor(json: any) {
        this.id = json.id;
        this.name = json.name;
        this.type = json.type;
        if (json['relation-list']?.length) {
            // TODO: is it possible for relation-list to have more than one element?
            this.relations = json['relation-list'][0].relations.map(r => new AreaRelation(r));
        }
    }
}

export class WorkRelation {
    direction: string;
    attributes: string[];
    targetType: string;
    type: string;
    artistCredits?: ArtistCredit[];
    artistString?: string;
    work?: Work;

    constructor(json: any) {
        this.direction = json.direction;
        this.attributes = json.attributes;
        this.targetType = json.targetType;
        this.type = json.type;
        if (json.recording?.['artist-credit']) {
            this.artistCredits = json.recording['artist-credit']?.map(ac => new ArtistCredit(ac));
            this.artistString = this.artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
                return idx == 0 ?
                    (artist.name + (artist.joinphrase ? artist.joinphrase : '')) :
                    prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
            }, '');
        }
        if (json.work) {
            this.work = new Work(json.work);
        }
    }
}
export class Work {
    id: string;
    title: string;
    relations?: WorkRelation[];

    constructor(json: any) {
        this.id = json.id;
        this.title = json.title;
        if (json['relations']) {
            this.relations = json['relations']?.map(r => new WorkRelation(r)) ?? [];
        }
    }
}
