
import { Component, OnInit } from '@angular/core';
import { TrackService } from '@services/track.service';

@Component({
    selector: 'metadata-handler',
    templateUrl: './metadata-handler.component.html',
    styleUrls: ['./metadata-handler.component.scss'],
})
export class MetadataHandlerComponent implements OnInit {
    constructor(private ts: TrackService) { }

    ngOnInit() {
    }

    public resetTags() {
        this.ts.resetTrackData();
    }

    public setTags() {
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
    }
}
