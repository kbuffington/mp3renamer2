import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { TrackService } from '../services/track.service';
import { Subscription } from 'rxjs';

export class TrackObj {
	filename: string;
	title: string;
	artist: string;
	trackNumber: string;
}

@Component({
	selector: 'renamer-grid',
	templateUrl: './renamer-grid.component.html',
	styleUrls: ['./renamer-grid.component.scss']
})
export class RenamerGridComponent implements OnInit, OnDestroy {
	@Input() showArtist = false;

	public tracks: any[] = [];
	public editing: boolean[] = [];
	public selected: any[] = [];
	public subscription: Subscription;

	private backup: string;

	constructor(private ts: TrackService,
				private zone: NgZone) {
		this.subscription = ts.getTracks().subscribe(tracks => this.populateGrid(tracks));
	}

	ngOnInit() {
		this.ts.setTracks(this.dummyValues());
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	populateGrid(trackList: any[]) {
		this.zone.run(() => {
			this.tracks = trackList.map(t => {
				// t.filename = `${t.artist} [${t.album} ${t.trackNumber}] - ${t.title}`;
				return t;
			});
			this.tracks.forEach(t => console.log(t.filename, t.artist));
			this.editing = Array(this.tracks.length + 1).fill(false);
		});
	}

	dummyValues(): any[] {
		const tracks = [];
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
			title: 'For Those About To Rock (We Salute You)',
			artist: 'AC/DC',
			trackNumber: '01'
		});
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
			title: 'Put the Finger on You',
			artist: 'AC/DC',
			trackNumber: '02'
		});
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
			title: 'For Those About To Rock (We Salute You)',
			artist: 'AC/DC',
			trackNumber: '03'
		});
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
			title: 'Put the Finger on You',
			artist: 'AC/DC',
			trackNumber: '04'
		});
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
			title: 'For Those About To Rock (We Salute You)',
			artist: 'AC/DC',
			trackNumber: '05'
		});
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
			title: 'Put the Finger on You',
			artist: 'AC/DC',
			trackNumber: '06'
		});
		tracks.push({
			filename: 'ACDC [For Those About to Rock (We Salute You) 07] - C.O.D..mp3',
			title: 'C.O.D.',
			artist: 'AC/DC',
			trackNumber: '07'
		});
		tracks.push({
			filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '08'
		});
		tracks.push({
			filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '09'
		});
		tracks.push({
			filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '10'
		});
		tracks.push({
			filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '10'
		});
		tracks.push({
			filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '10'
		});
		return tracks;
	}

	edit(track: TrackObj, col: string, index: number) {
		// console.log(index, track);
		// track.filename = 'test';
		this.editing.fill(false);
		this.editing[index] = true;
		this.backup = track[col];
	}

	keypressHandler(keyCode: string, col: string, index: number) {
		switch (keyCode) {
			case 'Escape':
				this.editing[index] = false;
				this.tracks[index][col] = this.backup;
				// this.
				break;
			case 'Enter':
				this.editing[index] = false;
				break;
			default:
				break;
		}
	}

	gotFocus(event: any, index: number) {
		// console.log(index, event);
		setTimeout(() => {
			event.target.selectionStart = 0;
			event.target.selectionEnd = event.target.selectionEnd - 4;
		});
	}
}
