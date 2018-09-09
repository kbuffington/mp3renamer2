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
	private alteredDefault = false;

	constructor() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.value && changes.value.currentValue) {
			const val: MetadataProperty = changes.value.currentValue;
			this.different = false;
			this.showValues = false;
			this.alteredDefault = false;
			val.values.forEach(t => {
				if (t !== val.default && val.default !== undefined) {
					this.different = true;
				}
			});
		}
	}

	defaultValChanged(value: string) {
		this.value.default = value;
		this.alteredDefault = true;	// doesn't check if default is actually different
		this.valueChange.emit(this.value);
	}
}
