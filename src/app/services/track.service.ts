import { Injectable } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';
import { knownProperties } from './known-properties';

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

export class MetadataObj {
	[key: string]: MetadataProperty;
}

export class TrackOptions {
	showArtwork?: boolean;
}

export class CommentStruct {
	language: string;
	shortText: string;
	text: string;
}

@Injectable()
export class TrackService {

	private trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
	private trackMetaData: BehaviorSubject<MetadataObj> = new BehaviorSubject({});
	private trackOptions: BehaviorSubject<TrackOptions> = new BehaviorSubject({});
	private trackDataBackup: any;
	private trackCount: number;
	private selectedTracks: number[];

	constructor() { }

	getTracks(): Observable<Track[]> {
		return this.trackList.asObservable();
	}

	getMetadata(): Observable<MetadataObj> {
		return this.trackMetaData.asObservable();
	}

	getTrackOptions(): Observable<TrackOptions> {
		return this.trackOptions.asObservable();
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

	getCurrentMetadata(): MetadataObj {
		return this.trackMetaData.getValue();
	}

	private processTracks(tracks: any) {
		const metaData: MetadataObj = {};
		const trackOptions: TrackOptions = {};
		const unknownProperties: any = {};
		let imageLoaded = false;

		knownProperties.forEach((prop, name) => {
			this.processField(metaData, tracks, name, prop.userDefined, prop.multiValue);
		});
		tracks.forEach(t => {
			if (t.userDefined) {
				Object.keys(t.userDefined).forEach(prop => {
					if (!knownProperties.has(prop) && !unknownProperties[prop]) {
						this.processField(metaData, tracks, prop, true, true);
						unknownProperties[prop] = true;
					}
				});
			}
			if (!imageLoaded && t.image) {
				imageLoaded = true;
				trackOptions.showArtwork = true;
			}
		});
		this.trackMetaData.next(metaData);
		this.trackOptions.next(trackOptions);
	}

	setMetadata(updatedMetadata: MetadataObj) {
		this.trackMetaData.next(updatedMetadata);
	}

	private processField(metadata, tracks, property: string, userDefined: boolean, multiValue: boolean) {
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

	private setMetadataValue(metaProp: MetadataProperty, value: string | CommentStruct) {
		if (Array.isArray(value)) {
			value = value.join('; ');
		}
		if (!metaProp.default) {
			metaProp.default = value.hasOwnProperty('text') ? value['text'] : value;
		}
		metaProp.values.push(value.hasOwnProperty('text') ? value['text'] : value);
	}

	previewFilenames(pattern: string) {
		const trackList = this.trackList.getValue();
		const metadata = this.trackMetaData.getValue();
		trackList.map(t => {
			t.meta.filename =
				`${metadata.artist.default.trim()} [${metadata.album.default.trim()} ${t.trackNumber.trim()}] - ${t.title.trim()}${t.meta.extension}`;
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

	renumberTracks(startNumber: number) {
		let count = 0;
		this.getCurrentTracks().forEach((t: Track, index: number) => {
			if (this.selectedTracks.includes(index)) {
				t.trackNumber = (startNumber + count + '').padStart(2, '0');
				count++;
			}
		});
	}

	updateSelectedTracks(selectedTracks: number[]) {
		this.selectedTracks = selectedTracks;
	}
}
