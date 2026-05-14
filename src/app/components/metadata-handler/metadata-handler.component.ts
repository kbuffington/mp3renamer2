import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetadataObj } from '@classes/track.classes';
import { TrackService } from '@services/track.service';
import { ValuesWrittenService } from '@services/values-written.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'metadata-handler',
    templateUrl: './metadata-handler.component.html',
    styleUrls: ['./metadata-handler.component.scss'],
    standalone: false,
})
export class MetadataHandlerComponent implements OnInit, OnDestroy {
    public metadata: MetadataObj | undefined;
    public valuesWritten = true;

    private metadataSubscription: Subscription | null = null;
    private valuesWrittenSubscription: Subscription | null = null;

    constructor(private ts: TrackService, private valuesWrittenService: ValuesWrittenService) {}

    ngOnInit() {
        this.metadataSubscription = this.ts.getMetadata().subscribe(m => {
            this.metadata = m;
        });
        this.valuesWrittenSubscription = this.valuesWrittenService.get().subscribe(v => {
            this.valuesWritten = v;
        });
    }

    ngOnDestroy() {
        this.metadataSubscription?.unsubscribe();
        this.valuesWrittenSubscription?.unsubscribe();
    }

    public resetTags() {
        this.ts.resetTrackData();
    }

    public setTags() {
        setTimeout(() => {
            // wait for DOM to update and metadata values to be set
            const metadata = this.ts.getCurrentMetadata();
            const sortOrder = metadata.albumSortOrder!.default;
            const date = metadata.date!.default;
            const origDate = metadata.originalReleaseDate!.default;
            const val = origDate.length >= 4 ? origDate : date;
            if (sortOrder.length <= 7 && val.length >= 4) {
                metadata.albumSortOrder!.default = val;
                metadata.albumSortOrder!.different = false;
                this.ts.setMetadata(metadata);
            }
            this.ts.setTagData();
        }, 100);
    }
}
