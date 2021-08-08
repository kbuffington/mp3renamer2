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
	id: string;
	name: string;

	constructor(json: any) {
		Object.assign(this, json);
	}
}

export class LabelInfo {
	'catalog-number'?: string;
	label: Label[];

	constructor(json: any) {
		Object.assign(this, json);
		if (json.label?.length) {
			this.label = json.label.map(l => new Label(l));
		}
	}
}

export class Track {
	id: string;
	position: number;
	length: number;
	title: string;

	artistString: string;
	time: string;

	constructor(json: any) {
		Object.assign(this, json);
		const artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
		this.artistString = artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
			return idx == 0
				? (artist.name + (artist.joinphrase ? artist.joinphrase : ''))
				: prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
		}, '');
		const seconds = json.length / 1000;
		this.time = `${Math.floor(seconds / 60)}:${("00" + Math.floor(seconds % 60)).slice(-2)}`;
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
		this.tracks = json.tracks ? json.tracks.map(t => new Track(t)) : [];
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
		this.releaseGroup = new ReleaseGroup(json['release-group']);
		this.labelInfo = json['label-info'] ? new LabelInfo(json['label-info']) : undefined;
		this.trackCount = json['track-count'];
	}
}