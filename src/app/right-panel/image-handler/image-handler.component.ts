import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackService } from '@services/track.service';
import { ImageStruct, MetadataObj, TrackOptions } from '@classes/track.classes';
import { ElectronService } from '@services/electron.service';

@Component({
    selector: 'image-handler',
    templateUrl: './image-handler.component.html',
    styleUrls: ['./image-handler.component.scss'],
})
export class ImageHandlerComponent implements OnInit, OnDestroy {
    public imgPath = '';
    public imgSize = { x: 0, y: 0 };
    public metadata: MetadataObj;
    public title = 'Embedded';
    public trackOptions: TrackOptions;
    public trackOptionsSubscription: Subscription;

    @ViewChild('coverImg') readonly coverImg: ElementRef;

    constructor(private ts: TrackService,
                private electronService: ElectronService) {
        this.ts.getMetadata().subscribe(metadata => {
            this.metadata = metadata;
        });
    }

    ngOnInit() {
        this.trackOptionsSubscription = this.ts.getTrackOptions().subscribe(o => {
            this.trackOptions = o;
            this.imgSize = { x: 0, y: 0 };
            this.title = 'Embedded';
            this.refreshImage(this.trackOptions.localArtwork);
        });
    }

    ngOnDestroy() {
        this.trackOptionsSubscription.unsubscribe();
    }

    public onLoad() {
        this.imgSize.x = (this.coverImg.nativeElement as HTMLImageElement).naturalWidth;
        this.imgSize.y = (this.coverImg.nativeElement as HTMLImageElement).naturalHeight;
    }

    public loadImage() {
        const path = this.ts.getCurrentPath();
        this.electronService.remote.dialog.showOpenDialog({
            defaultPath: path ? path : '',
            properties: ['openFile'],
        }).then(result => {
            this.trackOptions.localArtwork = result.filePaths[0];
            const imgBuffer = this.electronService.fs.readFileSync(result.filePaths[0]);
            const imageData = new ImageStruct(imgBuffer);
            this.refreshImage();
            console.log(imageData);
            const metadata = this.ts.getCurrentMetadata();
            this.ts.processImageField(metadata, imageData);
            this.ts.setTrackOptions(this.trackOptions);
            this.title = 'Unsaved';
        }).catch(err => {
            console.warn(err);
        });
    }

    public refreshImage(localFile?: string) {
        const cachebuster = '?id=' + ('' + Math.random()).substring(2, 8);
        if (localFile) {
            this.imgPath = `file:///${localFile}${cachebuster}`;
        } else {
            this.imgPath = `file:///${this.electronService.main.electronPath}/temp/embeddedArtwork.jpg${cachebuster}`;
        }
        console.log(this.imgPath);
    }
}
