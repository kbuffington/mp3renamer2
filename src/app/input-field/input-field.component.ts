import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MetadataProperty } from '../services/track.service';

@Component({
	selector: 'input-field',
	templateUrl: './input-field.component.html',
	styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnInit, OnChanges {
	@Input() label: string;
	@Input() labelStyle = '';
	@Input() value: MetadataProperty;
	@Input() readOnly = false;
	@Input() selectOptions: string[] = undefined;
	@Input() hideConflicts: number;

	@Output() valueChange = new EventEmitter();
	@Output() showingConflicts = new EventEmitter();

	public displayLabel = '';
	public different = false;
	public showValues = false;

	constructor() {}

	ngOnInit() {
		this.displayLabel = this.label.substring(0, this.label.length - 1);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.value && changes.value.currentValue) {
			const val: MetadataProperty = changes.value.currentValue;
			this.different = false;
			this.showValues = false;
			val.values.forEach(t => {
				if (t !== val.default && val.default !== undefined) {
					this.different = true;
				}
			});
		}
		if (changes.hideConflicts) {
			this.showValues = false;
		}
	}

	defaultValChanged(value: string) {
		this.value.default = value;
		if (value !== this.value.origValue) {
			this.value.changed = true;
		} else {
			this.value.changed = false;
		}
		this.valueChange.emit(this.value);
	}

	selectValue(value: string) {
		if (!this.readOnly) {
			this.defaultValChanged(value);
		}
		this.showValues = false;
	}

	showConflictValues() {
		if (!this.showValues) {
			this.showingConflicts.emit();
			setTimeout(() => {
				this.showValues = true;
			});
		} else {
			this.showValues = false;
		}
	}

	public identify(index: number, item: string) {
		return index;
	}
}
