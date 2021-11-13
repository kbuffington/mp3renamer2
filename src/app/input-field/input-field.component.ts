import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetadataProperty } from '../services/track.classes';

export enum InputTypes {
    Input = 'INPUT',
    Genre = 'GENRE',
    Select = 'SELECT',
    Textarea = 'TEXTAREA',
    Country = 'COUNTRY',
    CountryCode = 'COUNTRYCODE',
}

@Component({
    selector: 'input-field',
    templateUrl: './input-field.component.html',
    styleUrls: ['./input-field.component.scss'],
})
export class InputFieldComponent implements OnInit {
    @Input() inputType: string = InputTypes.Input;
    @Input() label: string;
    @Input() labelStyle = '';
    @Input() countrySelect = false;
    @Input() readOnly = false;
    @Input() selectOptions: string[] = undefined;
    @Input() value: MetadataProperty;

    @Output() valueChange = new EventEmitter();
    @Output() showConflicts = new EventEmitter();

    public displayLabel = '';
    public editValues = false;
    public inputTypes = InputTypes;

    constructor() {}

    ngOnInit() {
        this.displayLabel = this.label.substring(0, this.label.length - 1);
        if (this.selectOptions) {
            this.inputType = InputTypes.Select;
        }
    }

    public defaultValChanged(value: string) {
        this.value.default = value;
        this.value.defaultChanged = true;
        this.valueChange.emit(this.value);
    }

    public showConflictValues() {
        this.showConflicts.emit();
    }
}
