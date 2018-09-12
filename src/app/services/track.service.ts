import { Injectable } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';

export interface Track {
	artist: string;
	album: string;
	title: string;
	trackNumber: string;
	userDefined: any;
	meta: {
		originalFilename: string;
		filename: string;
		extension: string;
	};
}

export class MetadataProperty {
	changed = false;
	default = '';
	multiValue = false;
	origValue = '';
	overwrite = true;
	userDefined = false;
	values: string[] = [];
}

@Injectable()
export class TrackService {

	private trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
	private trackMetaData: BehaviorSubject<any> = new BehaviorSubject({});
	private trackDataBackup: any;
	private trackCount: number;

	constructor() { }

	getTracks(): Observable<Track[]> {
		return this.trackList.asObservable();
	}

	getMetadata(): Observable<any> {
		return this.trackMetaData.asObservable();
	}

	setTracks(tracks: any) {
		this.trackDataBackup = JSON.parse(JSON.stringify(tracks));
		const trackList = tracks.map((t: Track) => {
			t.meta.originalFilename = t.meta.filename;
			t.meta.extension = t.meta.filename.substring(t.meta.filename.lastIndexOf('.'));
			return t;
		});
		this.trackCount = trackList.length;
		this.processTracks(tracks);
		this.trackList.next(trackList);
	}

	resetTrackData() {
		this.setTracks(this.trackDataBackup);
	}

	clearTracks() {
		this.trackList.next([]);
	}

	getCurrentTracks(): Track[] {
		return this.trackList.getValue();
	}

	processTracks(tracks: any) {
		const metaData = {};
		this.processField(metaData, tracks, 'artist', false, false);
		this.processField(metaData, tracks, 'album', false, false);
		// this.processField(metaData, tracks, 'title');		// not needed?
		// this.processField(metaData, tracks, 'trackNumber');	// not needed?
		this.processField(metaData, tracks, 'genre');
		this.processField(metaData, tracks, 'albumSortOrder', false, false);
		this.processField(metaData, tracks, 'artistSortOrder', false, false);
		this.processField(metaData, tracks, 'comment', false, false);
		this.processField(metaData, tracks, 'composer');
		this.processField(metaData, tracks, 'copyright');
		this.processField(metaData, tracks, 'date');
		this.processField(metaData, tracks, 'encodedBy');
		this.processField(metaData, tracks, 'originalArtist');
		this.processField(metaData, tracks, 'partOfSet', false, false);
		this.processField(metaData, tracks, 'performerInfo');
		this.processField(metaData, tracks, 'RELEASETYPE', true);
		this.processField(metaData, tracks, 'EDITION', true);
		this.processField(metaData, tracks, 'LABEL', true);
		this.processField(metaData, tracks, 'ARTISTCOUNTRY', true);
		this.processField(metaData, tracks, 'ARTISTFILTER', true);
		this.processField(metaData, tracks, 'MUSICBRAINZ_ARTISTID', true);
		this.processField(metaData, tracks, 'MUSICBRAINZ_RELEASEGROUPID', true);
		this.processField(metaData, tracks, 'CATALOGNUMBER', true);
		this.processField(metaData, tracks, 'DISCSUBTITLE', true);
		this.processField(metaData, tracks, 'replaygain_album_gain', true);
		this.processField(metaData, tracks, 'replaygain_album_peak', true);
		this.processField(metaData, tracks, 'replaygain_track_gain', true);
		this.processField(metaData, tracks, 'replaygain_track_peak', true);

		this.trackMetaData.next(metaData);
	}

	processField(metadata, tracks, property: string, userDefined: boolean = false, multiValue: boolean = true) {
		const metaProp = new MetadataProperty();
		metaProp.multiValue = multiValue;
		tracks.forEach(t => {
			if (!userDefined) {
				if (t[property]) {
					this.setMetadataValue(metaProp, t[property]);
				} else {
					metaProp.values.push('');
				}
			} else {
				metaProp.userDefined = true;
				if (t.userDefined && t.userDefined[property]) {
					this.setMetadataValue(metaProp, t.userDefined[property]);
				} else {
					metaProp.values.push('');
				}
			}
			metaProp.origValue = metaProp.default;
		});
		metadata[property] = metaProp;
	}

	setMetadataValue(metaProp: MetadataProperty, value: string) {
		if (Array.isArray(value)) {
			value = value.join('; ');
		}
		if (!metaProp.default) {
			metaProp.default = value;
		}
		metaProp.values.push(value);
	}

	previewFilenames(pattern: string) {
		const trackList = this.trackList.getValue();
		const metadata = this.trackMetaData.getValue();
		trackList.map(t => {
			t.meta.filename = metadata.artist.default + ' [' + metadata.album.default + ' ' + t.trackNumber + '] - ' + t.title + t.meta.extension;
		});
		this.trackList.next(trackList);
	}

	revertFilenames() {
		const trackList = this.trackList.getValue();
		trackList.map(t => {
			t.meta.filename = t.meta.originalFilename;
		});
		this.trackList.next(trackList);
	}

	setTagData() {
		const trackList = this.trackList.getValue();
		const metadata = this.trackMetaData.getValue();
		const trackTagFields = Array(this.trackCount).fill({});
		trackTagFields.forEach((t, i) => {
			t.artist = trackList[i].artist;
			t.title = trackList[i].title;
			t.trackNumber = trackList[i].trackNumber;
		});
		Object.keys(metadata).forEach(key => {
			const obj: MetadataProperty = metadata[key];
			let value: any;

			for (let i = 0; i < this.trackCount; i++) {
				if (obj.changed && obj.overwrite) {
					value = obj.default;
				} else {
					value = obj.values[i];
				}
				if (value) {
					if (obj.multiValue && value.includes('; ')) {
						value = value.split('; ');
					}
					if (!obj.userDefined) {
						trackTagFields[i][key] = value;
					} else {
						trackTagFields[i].userDefined = Object.assign({}, trackTagFields[i].userDefined);
						trackTagFields[i].userDefined[key] = value;
					}
				}
			}
		});
		console.log(trackTagFields);
	}
}
