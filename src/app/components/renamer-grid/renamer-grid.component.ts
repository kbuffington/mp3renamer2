import { Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ElectronService } from '@services/electron.service';

import { TrackService } from '../../services/track.service';
import { MetadataObj } from '../../classes/track.classes';

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
    @Input() closeMenu: number;

    public editing: boolean[] = [];
    public selected: any[] = [];
    public loadingFiles = false;
    public showMenu = false;
    public menuTopLeftPosition = { x: '0px', y: '0px' };

    private menuRow: number;

    constructor(private electronService: ElectronService,
                private ts: TrackService,
                private zone: NgZone) {}

    ngOnInit() {
        this.electronService.ipcRenderer?.on('loadingFiles', (event, val) => {
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
        if (changes.closeMenu) {
            this.showMenu = false;
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

    public updateMetadata(index?: number, property?: string) {
        if (property === 'title') {
            // needed to handle multi-try/stage guessing for delete & find/replace
            console.log(this.metadata.title.origValues[index], this.metadata.title.values[index]);
            this.metadata.title.origValues[index] = this.metadata.title.values[index];
        }
        this.ts.setMetadata(this.metadata);
    }

    public onRightClick(event: MouseEvent, index: number) {
        console.log(event, index);
        const bodyWidth = document.querySelector('body').clientWidth;
        this.menuRow = index;
        this.showMenu = true;
        let x = event.clientX;
        if (x + 140 > bodyWidth) {
            x = bodyWidth - 140;
        }
        this.menuTopLeftPosition.x = x + 'px';
        this.menuTopLeftPosition.y = event.clientY + 'px';
    }

    public menuHandler(action: string) {
        switch (action) {
            case 'check':
                this.selected = [...this.tracks];
                break;
            case 'uncheck':
                this.selected = [];
                break;
            case 'check-this':
                this.selected = this.tracks.filter((t, index) => index === this.menuRow);
                break;
            case 'inverse':
                const selectedTracks = this.selected.map((t: TrackObj) => this.tracks.indexOf(t));
                this.selected = this.tracks.filter((t, index) => !selectedTracks.includes(index));
                break;
            default:
                console.warn('Unknown action:', action);
        }
        this.selectionChanged(this.selected);
        this.showMenu = false;
    }
}
