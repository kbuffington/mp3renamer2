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
		this.catalogNum = json["catalog-number"];
		if (json.label) {
			this.id = json.label.id;
			this.name = json.label.name;
			this.disambiguation = json.label.disambiguation;
		}
	}
}

export class LabelInfo {
	label: Label[];
	allLabels = '';	// semi-colon delimited list of labels
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

	artistString: string;
	discTrackStr: string;
	metadataDiffers = false; // does the title differ from the metadata?
	metadataFound = false; // was the track found in the metadata (by discTrackStr)?
	metadataTitle?: string; // title found in metadata
	time: string;


	constructor(json: any, discNumber: number) {
		Object.assign(this, json);
		const artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
		this.artistString = artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
			return idx == 0
				? (artist.name + (artist.joinphrase ? artist.joinphrase : ''))
				: prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
		}, '');
		const seconds = json.length / 1000;
		this.time = `${Math.floor(seconds / 60)}:${("00" + Math.floor(seconds % 60)).slice(-2)}`;
		this.discNumber = discNumber;
		this.discTrackStr = `${discNumber}-${this.position}`;
	}
}
export class Media {
    'disc-count': number;
    format: string;
	position: number;
	tracks: Track[];

    trackCount: number;

	constructor(json: any) {
		Object.assign(this, json);
		this.tracks = json.tracks ? json.tracks.map(t => new Track(t, this.position)) : [];
		this.trackCount = json['track-count'];
	}
}

export class ReleaseGroup {
	id: string;
    'primary-type': string;
    // 'primary-type-id': string;
    title: string;
    'type-id': string;

	constructor(json: any) {
		Object.assign(this, json);
	}
}

export class Release {
	barcode: string;
	count: number;
	country: string;
	date: string;
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
		Object.assign(this, json);	// maybe assign all properties to avoid duplicates?
		this.artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
		this.artistString = this.artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
			return idx == 0
				? (artist.name + (artist.joinphrase ? artist.joinphrase : ''))
				: prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
		}, '');
		this.media = json.media ? json.media.map(m => new Media(m)) : [];
		this.media.forEach(m => {
			this.tracks.push(...m.tracks);
		});
		this.releaseGroup = new ReleaseGroup(json['release-group']);
		this.labelInfo = json['label-info'] ? new LabelInfo(json['label-info']) : undefined;
		this.trackCount = json['track-count'];
	}
}