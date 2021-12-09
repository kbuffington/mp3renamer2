import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TrackService } from '@services/track.service';
import { MetadataProperty, UnknownPropertiesObj } from '@classes/track.classes';

@Component({
    selector: 'unknown-properties',
    templateUrl: './unknown-properties.component.html',
    styleUrls: ['./unknown-properties.component.scss'],
})
export class UnknownPropertiesComponent implements OnInit, OnDestroy, OnChanges {
    @Input() unknownProperties: UnknownPropertiesObj;

    @Output() unknownPropertiesChange = new EventEmitter<UnknownPropertiesObj[]>();

    public unknownPropArray = [];
    public unknownPropCopy = [];
    public editing: boolean[] = [];
    public selected: any[] = [];

    constructor(private ts: TrackService) {}

    ngOnInit() {}

    ngOnDestroy() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.unknownProperties && changes.unknownProperties.currentValue) {
            this.unknownPropArray = Object.keys(changes.unknownProperties.currentValue);
            this.unknownPropCopy = [...this.unknownPropArray];
            console.log(this.unknownProperties, this.unknownPropArray);

            this.selected = [...this.unknownPropArray];
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
        this.clearEditing();
        this.editing[index][col] = true;
    }

    public selectionChanged(selection: any) {
        console.log(selection);
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
        const newProp = new MetadataProperty();
        const name = 'NEW_PROPERTY';
        newProp.different = false;
        newProp.useDefault = true;
        newProp.userDefined = true;
        newProp.write = true;
        this.unknownProperties[name] = newProp;
        this.unknownPropArray.push(name);
        this.unknownPropCopy.push(name);
        this.selected.push(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public indexTrackBy(index: number, item: string) {
        return index;
    }
}
