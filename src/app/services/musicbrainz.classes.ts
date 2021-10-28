export class Artist {
    disambiguation: string;
    id: string;
    name: string;
    'sort-name': string;

    constructor(json: any) {
        Object.assign(this, json);
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
    label: Label[];
    allLabels = ''; // semi-colon delimited list of labels
    catalogNumbers = [];
    selectedCatalog: string;

    constructor(labels: any[]) {
        Object.assign(this, labels);
        if (labels.length) {
            this.label = labels.map(l => new Label(l));
            this.label.forEach((l, idx) => {
                this.allLabels += l.name;
                if (idx < this.label.length - 1) {
                    this.allLabels += '; ';
                }
                if (l.catalogNum && !this.catalogNumbers.includes(l.catalogNum)) {
                    this.catalogNumbers.push(l.catalogNum);
                }
                if (this.catalogNumbers.length) {
                    this.selectedCatalog = this.catalogNumbers[0];
                }
            });
        }
    }
}

export class Track {
    id: string;
    position: number;
    length: number;
    title: string;
    discNumber: number;

    // added fields
    artistString: string;
    discSet = ''; // if only one disc, this is empty, otherwise formatted like "1/3"
    discTrackStr: string;
    metadataDiffers = false; // does the title differ from the metadata?
    metadataFound = false; // was the track found in the metadata (by discTrackStr)?
    metadataFoundIndex = -1; // index into tracklist of found item
    metadataTitle?: string; // title found in metadata
    time: string;


    constructor(json: any, discNumber: number, totalDiscs: number) {
        Object.assign(this, json);
        const artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
        this.artistString = artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
            return idx == 0 ?
                (artist.name + (artist.joinphrase ? artist.joinphrase : '')) :
                prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
        }, '');
        const seconds = json.length / 1000;
        this.time = `${Math.floor(seconds / 60)}:${('00' + Math.floor(seconds % 60)).slice(-2)}`;
        this.discNumber = discNumber;
        if (totalDiscs > 1) {
            this.discSet = `${discNumber}/${totalDiscs}`;
        }
        this.discTrackStr = `${discNumber}-${this.position}`;
    }
}
export class Media {
    format: string;
    position: number;
    title: string;
    tracks: Track[];

    trackCount: number;

    constructor(json: any, totalMedia: number) {
        Object.assign(this, json);
        this.tracks = json.tracks ? json.tracks.map(t => new Track(t, this.position, totalMedia)) : [];
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
                (artist.name + (artist.joinphrase ? artist.joinphrase : '')) :
                prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
        }, '');
        this.media = json.media ? json.media.map(m => new Media(m, json.media.length)) : [];
        this.media.forEach(m => {
            this.tracks.push(...m.tracks);
        });
        this.releaseGroup = new ReleaseGroup(json['release-group']);
        this.labelInfo = json['label-info'] ? new LabelInfo(json['label-info']) : undefined;
        this.trackCount = json['track-count'];
    }
}
