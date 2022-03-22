
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetadataObj } from '@classes/track.classes';
import { TrackService } from '@services/track.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'metadata-handler',
    templateUrl: './metadata-handler.component.html',
    styleUrls: ['./metadata-handler.component.scss'],
})
export class MetadataHandlerComponent implements OnInit, OnDestroy {
    public metadata: MetadataObj;

    private metadataSubscription: Subscription;

    constructor(private ts: TrackService) {}

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            this.metadata = m;
        });
    }

    ngOnDestroy() {
        this.metadataSubscription.unsubscribe();
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
        }, 100);
    }
}
