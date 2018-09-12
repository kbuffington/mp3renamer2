import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MetadataProperty } from '../services/track.service';

@Component({
	selector: 'input-field',
	templateUrl: './input-field.component.html',
	styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnChanges {
	@Input() label: string;
	@Input() value: MetadataProperty;

	@Output() valueChange = new EventEmitter();

	public different = false;
	public showValues = false;

	constructor() {}

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
}
