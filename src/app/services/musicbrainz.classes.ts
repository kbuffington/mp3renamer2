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

export class Media {
    'disc-count': number;
    format: string;
    'track-count': number;

	constructor(json: any) {
		Object.assign(this, json);
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
	'track-count': number;

	artistString: string;
	artistCredits: ArtistCredit[];
    releaseGroup: ReleaseGroup;
	labelInfo?: LabelInfo;

	constructor(json: any) {
		Object.assign(this, json);
		this.artistCredits = json['artist-credit'].map(ac => new ArtistCredit(ac));
		this.artistString = this.artistCredits.reduce((prevVal, artist: ArtistCredit, idx) => {
			return idx == 0
				? (artist.name + (artist.joinphrase ? artist.joinphrase : ''))
				: prevVal + artist.name + (artist.joinphrase ? artist.joinphrase : '');
		}, '');
		this.media = json.media ? json.media.map(m => new Media(m)) : [];
		this.releaseGroup = new ReleaseGroup(json['release-group']);
		this.labelInfo = json['label-info'] ? new LabelInfo(json['label-info']) : undefined;
	}
}