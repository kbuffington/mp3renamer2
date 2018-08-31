import { Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackService } from '../services/track.service';

export class TrackObj {
	meta: {
		filename: string;
	};
	title: string;
	artist: string;
	trackNumber: string;
}

@Component({
	selector: 'renamer-grid',
	templateUrl: './renamer-grid.component.html',
	styleUrls: ['./renamer-grid.component.scss']
})
export class RenamerGridComponent implements OnInit, OnDestroy, OnChanges {
	@Input() showArtist = false;
	@Input() tracks: any[] = [];

	// public tracks: any[] = [];
	public editing: boolean[] = [];
	public selected: any[] = [];
	public subscription: Subscription;

	constructor(private ts: TrackService,
				private zone: NgZone) {
		// this.subscription = ts.getTracks().subscribe(tracks => this.populateGrid(tracks));
	}

	ngOnInit() {
		// this.ts.setTracks(this.dummyValues());
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.tracks && changes.tracks.currentValue) {
			// this.tracks = changes.tracks.currentValue;
			this.selected = this.tracks;
			this.clearEditing();
		}
	}

	// populateGrid(trackList: any[]) {
	// 	this.zone.run(() => {
	// 		this.tracks = trackList.map(t => {
	// 			t.meta.originalFilename = t.meta.filename;
	// 			return t;
	// 		});
	// 		this.selected = this.tracks;
	// 		this.tracks.forEach(t => console.log(t.meta.filename, t.artist));
	// 		this.clearEditing();
	// 	});
	// }

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

	startEditing(index: number, col: number) {
		this.clearEditing();
		this.editing[index][col] = true;
	}
}
