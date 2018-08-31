import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'input-field',
	templateUrl: './input-field.component.html',
	styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnInit {
	@Input() label: string;
	@Input() value: string;

	@Output() valueChange = new EventEmitter();

	constructor() { }

	ngOnInit() {
		console.log(this.label, this.value);
	}

	valChanged(value) {
		this.valueChange.emit(value);
	}

}
