
import { Component, OnInit } from '@angular/core';
import { TrackService } from '@services/track.service';

@Component({
    selector: 'metadata-handler',
    templateUrl: './metadata-handler.component.html',
    styleUrls: ['./metadata-handler.component.scss'],
})
export class MetadataHandlerComponent implements OnInit {
    public tagsSet = false;

    constructor(private ts: TrackService) {
        this.ts.getTracks().subscribe(() => {
            this.tagsSet = false;
        });
    }

    ngOnInit() {
    }

    public resetTags() {
        this.ts.resetTrackData();
    }

    public setTags() {
        setTimeout(() => { // wait for DOM to update and metadata values to be set
            const metadata = this.ts.getCurrentMetadata();
            const sortOrder = metadata.albumSortOrder.default;
            const date = metadata.date.default;
            const origDate = metadata.originalReleaseDate.default;
            const val = origDate.length >= 4 ? origDate : date;
            if (sortOrder.length <= 7 && val.length >= 4) {
                metadata.albumSortOrder.default = val;
                metadata.albumSortOrder.different = false;
                this.ts.setMetadata(metadata);
            }
            this.ts.setTagData();
            this.tagsSet = true;
        }, 100);
    }
}
