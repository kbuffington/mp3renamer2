import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MetadataProperty } from '../services/track.service';

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
export class InputFieldComponent implements OnInit, OnChanges {
    @Input() inputType: string = InputTypes.Input;
    @Input() label: string;
    @Input() labelStyle = '';
    @Input() hideConflicts: number;
    @Input() countrySelect = false;
    @Input() readOnly = false;
    @Input() selectOptions: string[] = undefined;
    @Input() value: MetadataProperty;

    @Output() valueChange = new EventEmitter();
    @Output() showingConflicts = new EventEmitter();

    public displayLabel = '';
    public different = false;
    public editValues = false;
    public inputTypes = InputTypes;
    public showValues = false;

    constructor() {}

    ngOnInit() {
        this.displayLabel = this.label.substring(0, this.label.length - 1);
        if (this.selectOptions) {
            this.inputType = InputTypes.Select;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value?.currentValue) {
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
        this.value.changed = true;
        this.valueChange.emit(this.value);
    }

    selectValue(value: string) {
        if (!this.readOnly) {
            this.defaultValChanged(value);
        }
        this.showValues = false;
    }

    public resetValues() {
        this.value.changed = false;
        this.value.default = this.value.origValue;
        this.value.values = [...this.value.origValues];
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public identify(index: number, item: string) {
        return index;
    }
}
