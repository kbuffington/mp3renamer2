import { Injectable } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';

export type Track = any;

@Injectable()
export class TrackService {

	private _trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);

	constructor() { }

	getTracks(): Observable<Track[]> {
		return this._trackList.asObservable();
	}

	setTracks(tracks: any) {
		tracks = tracks.map(t => {
			const keys = Object.keys(t);
			let n = keys.length;
			while (n--) {
				const key = keys[n];
				t[key.toLowerCase()] = t[key];
			}
			return t;
		});
		console.log(tracks);
		this._trackList.next(tracks);
	}

	clearTracks() {
		this._trackList.next([]);
	}

}
