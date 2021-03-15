import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TrackService, UnknownPropertiesObj } from '@services/track.service';

@Component({
	selector: 'unknown-properties',
	templateUrl: './unknown-properties.component.html',
	styleUrls: ['./unknown-properties.component.scss']
})
export class UnknownPropertiesComponent implements OnInit, OnDestroy, OnChanges {
	@Input() unknownProperties: UnknownPropertiesObj;

	unknownPropArray = [];
	public editing: boolean[] = [];
	public selected: any[] = [];

	constructor(private ts: TrackService) {}

	ngOnInit() {}

	ngOnDestroy() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.unknownProperties && changes.unknownProperties.currentValue) {
			this.unknownPropArray = Object.keys(changes.unknownProperties.currentValue);
			// this.selected = changes.unknownProperties.currentValue.map(t => t);
			this.clearEditing();
		}
	}

	clearEditing() {
		const numRows = this.unknownPropArray.length + 1;
		const numCols = 2;
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

	selectionChanged(selection: any) {
		console.log(selection);
	}
}
