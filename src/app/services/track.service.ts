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
		this._trackList.next(tracks);
	}

	clearTracks() {
		this._trackList.next([]);
	}

	getCurrentTracks(): Track[] {
		return this._trackList.getValue();
	}

}
