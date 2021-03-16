export class Artist {
    disambiguation: string;
	id: string;
	name: string;
	'sort-name': string;
}

export class ArtistCredit {
	artist?: Artist;
	name: string;
	joinphrase?: string;
}

export class Media {
    'disc-count': number;
    format: string;
    'track-count': number;
}

export class ReleaseGroup {
	id: string;
    'primary-type': string;
    // 'primary-type-id': string;
    title: string;
    'type-id': string;
}

export class Releases {
	'artist-credit': ArtistCredit;
	barcode: string;
	count: number;
	country: string;
	date: string;
	id: string;
    media: Media[];
    'release-group': ReleaseGroup;
    title: string;
	'track-count': number;
}