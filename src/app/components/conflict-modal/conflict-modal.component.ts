import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetadataProperty } from '@services/track.service';

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

    // public editValues = false;
    public showValues = false;
    private origDefault: string;
    private origValues: string[];
    private origUseDefault: boolean;

    constructor() { }

    ngOnInit(): void {
        this.origUseDefault = this.field.useDefault;
        this.origDefault = this.field.default;
        this.origValues = [...this.field.values];
    }

    public modalClosed() {
        this.showModalChange.emit(false);
    }

    public selectValue(value: string) {
        if (!this.readOnly) {
            this.defaultValChanged(value);
        }
        this.showValues = false;
    }

    public defaultValChanged(value: string) {
        this.field.default = value;
        this.field.useDefault = true;
        this.fieldChange.emit(this.field);
    }

    public resetValues() {
        this.field.useDefault = this.origUseDefault;
        this.field.default = this.field.origValue;
        this.field.values = [...this.field.origValues];
    }

    public onCancel() {
        // resets changes to dialog, but not previous changes to MetadataProperty
        this.field.useDefault = this.origUseDefault;
        this.field.default = this.origDefault;
        this.field.values = [...this.origValues];
        this.modalClosed();
    }

    showConflictValues() {
        if (!this.showValues) {
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
