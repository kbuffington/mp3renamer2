import { Injectable } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';

export type Track = any;

export class MetadataProperty {
	default = '';
	values: string[] = [];
}

@Injectable()
export class TrackService {

	private trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
	private trackMetaData: BehaviorSubject<any> = new BehaviorSubject({});
	private trackDataBackup: any;

	constructor() { }

	getTracks(): Observable<Track[]> {
		return this.trackList.asObservable();
	}

	getMetadata(): Observable<any> {
		return this.trackMetaData.asObservable();
	}

	setTracks(tracks: any) {
		this.trackDataBackup = JSON.parse(JSON.stringify(tracks));
		const trackList = tracks.map(t => {
			t.meta.originalFilename = t.meta.filename;
			return t;
		});
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
		this.processField(metaData, tracks, 'artist');
		this.processField(metaData, tracks, 'album');
		this.processField(metaData, tracks, 'genre');
		this.processField(metaData, tracks, 'albumSortOrder');
		this.processField(metaData, tracks, 'date');
		this.processField(metaData, tracks, 'comment');
		this.processField(metaData, tracks, 'discnumber');
		this.processField(metaData, tracks, 'totaldiscs');
		this.processField(metaData, tracks, 'originalArtist');
		this.processField(metaData, tracks, 'partOfSet');
		this.processField(metaData, tracks, 'originalArtist');
		this.processField(metaData, tracks, 'encodedBy');
		this.processField(metaData, tracks, 'copyright');
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

		this.trackMetaData.next(metaData);
	}

	processField(metadata, tracks, property: string, userDefined: boolean = false) {
		const metaProp = new MetadataProperty();
		tracks.forEach(t => {
			if (!userDefined) {
				if (t[property]) {
					if (!metaProp.default) {
						metaProp.default = t[property];
					}
					metaProp.values.push(t[property]);
				} else {
					metaProp.values.push('');
				}
			} else {
				if (t.userDefined && t.userDefined[property]) {
					if (!metaProp.default) {
						metaProp.default = t.userDefined[property];
					}
					metaProp.values.push(t.userDefined[property]);
				} else {
					metaProp.values.push('');
				}
			}
		});
		metadata[property] = metaProp;
	}

}
