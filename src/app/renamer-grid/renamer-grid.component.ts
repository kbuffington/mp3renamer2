import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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

	public editing: boolean[] = [];
	public selected: any[] = [];

	constructor(private ts: TrackService) {}

	ngOnInit() {}

	ngOnDestroy() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.tracks && changes.tracks.currentValue) {
			this.selected = changes.tracks.currentValue.map(t => t);
			this.clearEditing();
		}
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

	startEditing(index: number, col: number) {
		this.clearEditing();
		this.editing[index][col] = true;
	}

	selectionChanged(selection: TrackObj[]) {
		const selectedTracks = selection.map((t: TrackObj) => this.tracks.indexOf(t));
		this.ts.updateSelectedTracks(selectedTracks.sort());
	}
}
