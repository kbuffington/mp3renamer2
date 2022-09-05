import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElectronService } from '@services/electron.service';
import { MetadataProperty } from '../classes/track.classes';

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
    @Input() copyToClipboard = false;

    @Output() valueChange = new EventEmitter();
    @Output() showConflicts = new EventEmitter();

    public displayLabel = '';
    public editValues = false;
    public inputTypes = InputTypes;
    public showCopied = false;

    constructor(private electronService: ElectronService) {}

    ngOnInit() {
        this.displayLabel = this.label.substring(0, this.label.length - 1);
        if (this.selectOptions) {
            this.inputType = InputTypes.Select;
        }
    }

    public defaultValChanged(value: string) {
        this.value.default = value;
        this.value.defaultChanged = true;
        this.value.useDefault = true;
        this.valueChange.emit(this.value);
    }

    public showConflictValues() {
        this.showConflicts.emit();
    }

    public onFocus($event) {
        $event.target.select();
        if (this.copyToClipboard) {
            this.electronService.remote.clipboard.writeText($event.target.value);
            this.showCopied = true;
        }
        setTimeout(() => {
            this.showCopied = false;
        }, 1000);
    }
}
