import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetadataProperty } from '@classes/track.classes';

@Component({
    selector: 'conflict-modal',
    templateUrl: './conflict-modal.component.html',
    styleUrls: ['./conflict-modal.component.scss'],
})
export class ConflictModalComponent implements OnInit {
    @Input() field: MetadataProperty;
    @Input() displayName: string;
    @Input() showModal = false;
    @Input() readOnly = false;

    @Output() fieldChange = new EventEmitter<MetadataProperty>();
    @Output() showModalChange = new EventEmitter<boolean>();

    public showValues = false;

    private origDefault: string;
    private origValues: string[];
    private origUseDefault: boolean;
    private origDefaultChanged: boolean;

    constructor() { }

    ngOnInit(): void {
        this.origUseDefault = this.field.useDefault;
        this.origDefaultChanged = this.field.defaultChanged;
        this.origDefault = this.field.default;
        this.origValues = [...this.field.values];
    }

    public modalClosed() {
        const first = this.field.values[0];
        this.field.different = this.field.values.some(v => v !== first);
        this.fieldChange.emit(this.field);
        this.showModalChange.emit(false);
    }

    public selectValue(value: string) {
        if (!this.readOnly) {
            this.defaultValChanged(value);
        }
        this.showValues = false;
    }

    // toggle is negated in the template
    public toggledDefault(value: boolean) {
        this.field.useDefault = value;
        this.field.defaultChanged = value;
    }

    public defaultValChanged(value: string) {
        this.field.default = value;
        this.field.defaultChanged = true;
        this.fieldChange.emit(this.field);
    }

    public resetValues() {
        this.field.useDefault = this.origUseDefault;
        this.field.default = this.field.origValue;
        this.field.values = [...this.field.origValues];
        this.field.defaultChanged = false;
    }

    public onCancel() {
        // resets changes to dialog, but not previous changes to MetadataProperty
        this.field.useDefault = this.origUseDefault;
        this.field.default = this.origDefault;
        this.field.values = [...this.origValues];
        this.field.defaultChanged = this.origDefaultChanged;
        this.modalClosed();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public identify(index: number, item: string) {
        return index;
    }

    public copyToAllVals() {
        this.field.values = new Array(this.field.values.length).fill(this.field.default);
    }
}
