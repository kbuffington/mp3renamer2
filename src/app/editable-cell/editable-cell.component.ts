import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
	selector: 'editable-cell',
	templateUrl: './editable-cell.component.html',
	styleUrls: ['./editable-cell.component.scss'],
})
export class EditableCellComponent implements OnChanges {
	@Input() value: string;
	@Input() editing: boolean;
	@Input() dontSelect = 0;	// number of characters to not select from end

	@Output() valueChange = new EventEmitter();
	@Output() editingChange = new EventEmitter();

	private backup: string;

	ngOnChanges(changes: SimpleChanges) {
		if (changes.editing && changes.editing.currentValue === true) {
			this.backup = this.value;
		}
	}

	valChanged(value) {
		this.valueChange.emit(value);
	}

	keypressHandler(keyCode: string) {
		switch (keyCode) {
			case 'Escape':
				this.editing = false;
				this.editingChange.emit(this.editing);
				this.value = this.backup;
				this.valChanged(this.value);
				break;
			case 'Enter':
				this.editing = false;
				this.value = this.value.trim();	// TODO: maybe just trimRight?
				this.editingChange.emit(this.editing);
				break;
			default:
				break;
		}
	}

	gotFocus(event: any) {
		setTimeout(() => {
			event.target.selectionStart = 0;
			event.target.selectionEnd = event.target.selectionEnd - this.dontSelect;
		});
	}
}
