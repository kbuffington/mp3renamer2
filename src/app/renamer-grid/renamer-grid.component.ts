import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { TrackService } from '../services/track.service';
import { Subscription } from 'rxjs';

export class TrackObj {
	meta: {
		filename: string;
	}
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
				t.meta.originalFilename = t.meta.filename;
				return t;
			});
			this.selected = this.tracks;
			this.tracks.forEach(t => console.log(t.meta.filename, t.artist));
			this.clearEditing();
		});
	}

	clearEditing() {
		const numRows = this.tracks.length + 1;
		const numCols = 4;
		const editingGrid = [];
		for (let i = 0; i < numRows; i++) {
			editingGrid[i] = [];
			for (let j = 0; j < numCols; j++) {
				editingGrid[i][j] = false;
			}
		}
		this.editing = editingGrid;
	}

	dummyValues(): any[] {
		const tracks = [];
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
			},
			title: 'For Those About To Rock (We Salute You)',
			artist: 'AC/DC',
			trackNumber: '01'
		});
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
			},
			title: 'Put the Finger on You',
			artist: 'AC/DC',
			trackNumber: '02'
		});
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
			},
			title: 'For Those About To Rock (We Salute You)',
			artist: 'AC/DC',
			trackNumber: '03'
		});
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
			},
			title: 'Put the Finger on You',
			artist: 'AC/DC',
			trackNumber: '04'
		});
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
			},
			title: 'For Those About To Rock (We Salute You)',
			artist: 'AC/DC',
			trackNumber: '05'
		});
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
			},
			title: 'Put the Finger on You',
			artist: 'AC/DC',
			trackNumber: '06'
		});
		tracks.push({
			meta: {
				filename: 'ACDC [For Those About to Rock (We Salute You) 07] - C.O.D..mp3',
			},
			title: 'C.O.D.',
			artist: 'AC/DC',
			trackNumber: '07'
		});
		tracks.push({
			meta: {
				filename: 'ASIWYFA [Gangs 08] Gangs',
			},
			title: 'Gangs of the modern era which is now dumbass',
			artist: 'And So I Watch You From Afar',
			trackNumber: '08'
		});
		tracks.push({
			meta: {
				filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			},
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '09'
		});
		tracks.push({
			meta: {
				filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			},
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '10'
		});
		tracks.push({
			meta: {
				filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			},
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '10'
		});
		tracks.push({
			meta: {
				filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
			},
			title: 'Where Greater Men Have Fallen',
			artist: 'Primordial',
			trackNumber: '10'
		});
		return tracks;
	}

	startEditing(index: number, col: number) {
		this.clearEditing();
		this.editing[index][col] = true;
	}
}
