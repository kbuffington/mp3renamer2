import { Injectable } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';

export type Track = any;

@Injectable()
export class TrackService {

	private _trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
	private trackDataBackup: any;

	constructor() { }

	getTracks(): Observable<Track[]> {
		return this._trackList.asObservable();
	}

	setTracks(tracks: any) {
		this.trackDataBackup = JSON.parse(JSON.stringify(tracks));
		const trackList = tracks.map(t => {
			t.meta.originalFilename = t.meta.filename;
			return t;
		});
		this._trackList.next(trackList);
	}

	resetTrackData() {
		this.setTracks(this.trackDataBackup);
	}

	clearTracks() {
		this._trackList.next([]);
	}

	getCurrentTracks(): Track[] {
		return this._trackList.getValue();
	}

}
