import { Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ElectronService } from '@services/electron.service';

import { TrackService } from '../services/track.service';
import { MetadataObj } from '../classes/track.classes';

export class TrackObj {
    meta: {
        filename: string;
    };
    title: string;
    artist: string;
    trackNumber: string;
}

@Component({
    selector: 'renamer-grid',
    templateUrl: './renamer-grid.component.html',
    styleUrls: ['./renamer-grid.component.scss'],
})
export class RenamerGridComponent implements OnInit, OnDestroy, OnChanges {
    @Input() showArtist = false;
    @Input() tracks: any[] = [];
    @Input() metadata: MetadataObj;

    public editing: boolean[] = [];
    public selected: any[] = [];
    public loadingFiles = false;

    constructor(private electronService: ElectronService,
                private ts: TrackService,
                private zone: NgZone) {}

    ngOnInit() {
        this.electronService.ipcRenderer.on('loadingFiles', (event, val) => {
            this.loadingFiles = val;
            this.zone.run(() => {});
        });
    }

    ngOnDestroy() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.tracks && changes.tracks.currentValue) {
            this.selected = changes.tracks.currentValue.map(t => t);
            this.clearEditing();
        }
    }

    clearEditing() {
        const numRows = this.tracks.length + 1;
        const numCols = 4;
        const editingGrid = [];
        for (let i = 0; i < numRows; i++) {
            editingGrid[i] = [];
            for (let j = 0; j < numCols; j++) {
                editingGrid[i][j] = false;
            }
        }
        this.editing = editingGrid;
    }

    startEditing(index: number, col: number) {
        this.clearEditing();
        this.editing[index][col] = true;
    }

    selectionChanged(selection: TrackObj[]) {
        const selectedTracks = selection.map((t: TrackObj) => this.tracks.indexOf(t));
        this.ts.updateSelectedTracks(selectedTracks.sort());
    }

    public updateMetadata() {
        this.ts.setMetadata(this.metadata);
    }
}
