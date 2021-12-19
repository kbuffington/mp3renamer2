import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackService } from '@services/track.service';
import { TrackOptions } from '@classes/track.classes';
import { ElectronService } from '@services/electron.service';

@Component({
    selector: 'image-handler',
    templateUrl: './image-handler.component.html',
    styleUrls: ['./image-handler.component.scss'],
})
export class ImageHandlerComponent implements OnInit, OnDestroy {
    public imgSize = { x: 0, y: 0 };
    public trackOptions: TrackOptions;
    public trackOptionsSubscription: Subscription;
    public imgPath: string;

    @ViewChild('coverImg') readonly coverImg: ElementRef;

    constructor(private ts: TrackService,
                private electronService: ElectronService) {
        this.imgPath = `file:///${electronService.main.electronPath}/temp/embeddedArtwork.jpg`;
    }

    ngOnInit() {
        this.trackOptionsSubscription = this.ts.getTrackOptions().subscribe(o => {
            this.trackOptions = o;
            this.imgSize = { x: 0, y: 0 };
        });
    }

    ngOnDestroy() {
        this.trackOptionsSubscription.unsubscribe();
    }

    public onLoad() {
        this.imgSize.x = (this.coverImg.nativeElement as HTMLImageElement).naturalWidth;
        this.imgSize.y = (this.coverImg.nativeElement as HTMLImageElement).naturalHeight;
    }
}
