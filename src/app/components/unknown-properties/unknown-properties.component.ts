import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TrackService } from '@services/track.service';
import { MetadataObj, MetadataProperty, UnknownPropertiesObj } from '@classes/track.classes';
import { Subscription } from 'rxjs';

@Component({
    selector: 'unknown-properties',
    templateUrl: './unknown-properties.component.html',
    styleUrls: ['./unknown-properties.component.scss'],
})
export class UnknownPropertiesComponent implements OnInit, OnDestroy, OnChanges {
    @Input() unknownProperties: UnknownPropertiesObj;
    @Input() stopEditing: number;

    @Output() unknownPropertiesChange = new EventEmitter<UnknownPropertiesObj[]>();

    public unknownPropArray = [];
    public unknownPropCopy = [];
    public editing: boolean[] = [];
    public selected: any[] = [];

    private metadata: MetadataObj;
    private metadataSubscription: Subscription;
    private loadedComponent = false;

    constructor(private ts: TrackService) {}

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            this.metadata = m;
        });
        this.loadedComponent = true;
    }

    ngOnDestroy() {
        this.metadataSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.unknownProperties && changes.unknownProperties.currentValue) {
            this.unknownPropArray = Object.keys(changes.unknownProperties.currentValue);
            this.unknownPropCopy = [...this.unknownPropArray];

            this.selected = [...this.unknownPropArray.filter(p => this.unknownProperties[p].write)];
            this.clearEditing();
        }
        if (changes.stopEditing) {
            this.clearEditing();
        }
    }

    public clearEditing() {
        const numRows = this.unknownPropArray.length;
        const numCols = 2;
        const editingGrid = [];
        for (let i = 0; i <= numRows; i++) {
            editingGrid[i] = [];
            for (let j = 0; j < numCols; j++) {
                editingGrid[i][j] = false;
            }
        }
        this.editing = editingGrid;
    }

    public startEditing(index: number, col: number) {
        setTimeout(() => {
            this.clearEditing();
            this.editing[index][col] = true;
        }, 10);
    }

    public selectionChanged(selection: any) {
        Object.keys(this.unknownProperties).forEach(p => this.unknownProperties[p].write = false);
        selection.forEach(key => {
            this.unknownProperties[key].write = true;
        });
        if (!this.loadedComponent) {
            this.metadata.valuesWritten = false;
        }
        this.loadedComponent = false;
    }

    public updatePropertyName(index: number, editing: boolean) {
        setTimeout(() => {
            const newName = this.unknownPropCopy[index];
            const origPropertyName = this.unknownPropArray[index];
            if (!editing && newName !== origPropertyName) {
                console.log(`Renaming property ${origPropertyName} to ${newName}`);
                this.unknownProperties[newName] = this.unknownProperties[origPropertyName];
                delete this.unknownProperties[origPropertyName];
                this.unknownPropArray[index] = newName;
                this.ts.setUnknownProperties(this.unknownProperties);
            }
        }, 10); // needs to happen after update from inside editable-cell
    }

    public editedPropertyValue(property: MetadataProperty, editing: boolean) {
        if (!editing && property.origValue !== property.default) {
            // updated value so always use default
            property.useDefault = true;
        }
    }

    public addProperty() {
        const newProp = new MetadataProperty(null);
        const newPropCount = Object.keys(this.unknownProperties).filter(p => p.includes('NEW_PROPERTY')).length;
        const name = `NEW_PROPERTY${newPropCount > 0 ? newPropCount + 1 : ''}`;
        newProp.different = false;
        newProp.useDefault = true;
        newProp.userDefined = true;
        newProp.write = true;
        this.unknownProperties[name] = newProp;
        this.unknownPropArray.push(name);
        this.unknownPropCopy.push(name);
        this.selected.push(name);
        this.startEditing(this.unknownPropArray.length - 1, 0);
        this.setFocusCell(this.unknownPropArray.length - 1, 0);
        this.metadata.valuesWritten = false;
    }

    public tabPressed(row: number, column: number) {
        if (column === 0) {
            this.startEditing(row, 1);
            this.setFocusCell(row, 1);
        }
    }

    private setFocusCell(row: number, col: number) {
        const colName = col === 0 ? 'key' : 'val';
        // wait for element to be rendered
        setTimeout(() => {
            const cell = document.getElementById(`cell-${row}-${colName}`);
            const input = cell.getElementsByTagName('input')[0];
            if (input) {
                input.focus();
            }
        }, 10);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public indexTrackBy(index: number, item: string) {
        return index;
    }
}
