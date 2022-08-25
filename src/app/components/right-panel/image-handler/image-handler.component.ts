import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrackService } from '@services/track.service';
import { ImageStruct, MetadataObj, TrackOptions } from '@classes/track.classes';
import { ElectronService } from '@services/electron.service';

class ImgInfo {
    name?: string;
    path?: string;
    x?: number;
    y?: number;
}

@Component({
    selector: 'image-handler',
    templateUrl: './image-handler.component.html',
    styleUrls: ['./image-handler.component.scss'],
})
export class ImageHandlerComponent implements OnInit, OnDestroy {
    public imgPath = '';
    public embedImage: ImgInfo = { x: 0, y: 0 };
    public localImages: ImgInfo[];
    public metadata: MetadataObj;
    public path: string;
    public popoverImage: ImgInfo;
    public title = 'Embedded';
    public trackOptions: TrackOptions;
    public trackOptionsSubscription: Subscription;

    @ViewChild('coverImg') readonly coverImg: ElementRef;
    @ViewChild('popOverContainer') popOverContainer: ElementRef;
    @ViewChildren('localImg') readonly localImgEls: QueryList<ElementRef>;

    constructor(private ts: TrackService,
                private electronService: ElectronService) {
        this.ts.getMetadata().subscribe(metadata => {
            this.metadata = metadata;
        });
    }

    private get cachebuster(): string {
        return '?cb=' + ('' + Date.now()).substring(7);
    }

    ngOnInit() {
        this.trackOptionsSubscription = this.ts.getTrackOptions().subscribe(o => {
            this.trackOptions = o;
            this.title = 'Embedded';
            this.refreshImage(this.trackOptions.localArtwork);
            this.embedImage = { x: 0, y: 0, path: this.imgPath };
            this.localImages = [];
            this.path = this.ts.getCurrentPath();
            this.electronService.fs.readdir(this.path, (err, files) => {
                if (!files?.length) return;
                files.forEach(f => {
                    if (f.match(/\.(png|jpg|jpeg|gif)$/)) {
                        this.localImages.push({ name: f, path: `file:///${this.path}${f}${this.cachebuster}` });
                    }
                });
            });
        });
    }

    ngOnDestroy() {
        this.trackOptionsSubscription.unsubscribe();
    }

    public onLoad(index?: number) {
        if (index >= 0) {
            this.localImages[index].x = (this.localImgEls.get(index).nativeElement as HTMLImageElement).naturalWidth;
            this.localImages[index].y = (this.localImgEls.get(index).nativeElement as HTMLImageElement).naturalHeight;
        } else {
            this.embedImage.x = (this.coverImg.nativeElement as HTMLImageElement).naturalWidth;
            this.embedImage.y = (this.coverImg.nativeElement as HTMLImageElement).naturalHeight;
        }
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
        if (localFile) {
            this.imgPath = `file:///${localFile}${this.cachebuster}`;
        } else {
            this.imgPath = `file:///${this.electronService.main.electronPath}/temp/embeddedArtwork.jpg${this.cachebuster}`;
        }
        console.log(this.imgPath);
    }

    public zoomImg(img: ImgInfo) {
        this.popoverImage = img;
        setTimeout(() => this.popOverContainer.nativeElement.focus());
    }

    public keypressed(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                this.popoverImage = null;
                break;
        }
    }

    public writeToggled() {
        this.metadata.valuesWritten = false;
    }
}
