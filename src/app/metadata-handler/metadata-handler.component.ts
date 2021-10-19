
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

    reloadTags() {
        this.ts.resetTrackData();
    }

    setTags() {
        this.ts.setTagData();
    }
}
