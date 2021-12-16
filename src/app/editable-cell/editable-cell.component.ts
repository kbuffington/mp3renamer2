import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'editable-cell',
    templateUrl: './editable-cell.component.html',
    styleUrls: ['./editable-cell.component.scss'],
})
export class EditableCellComponent implements OnChanges {
    @Input() value: string;
    @Input() editing: boolean;
    @Input() dontSelect = 0; // number of characters to not select from end

    @Output() valueChange = new EventEmitter();
    @Output() editingChange = new EventEmitter();
    @Output() tabHandler = new EventEmitter();

    private backup: string;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.editing) {
            if (changes.editing.currentValue === true) {
                this.backup = this.value;
            } else if (!changes.editing.firstChange) {
                this.valChanged(this.value);
            }
        }
    }

    private valChanged(value) {
        setTimeout(() => {
            this.value = this.value?.trim(); // do we want to just trimRight?
            this.valueChange.emit(value);
        });
    }

    public keypressHandler(keyCode: string) {
        switch (keyCode) {
            case 'Escape':
                this.editing = false;
                this.value = this.backup;
                this.valChanged(this.value);
                this.editingChange.emit(this.editing);
                break;
            case 'Enter':
                this.editing = false;
                this.valChanged(this.value);
                this.editingChange.emit(this.editing);
                break;
            case 'Tab':
                this.tabHandler.emit();
                this.editing = false;
                this.valChanged(this.value);
                this.editingChange.emit(this.editing);
                this.tabHandler.emit();
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
