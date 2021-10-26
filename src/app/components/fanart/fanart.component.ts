import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FanartAlbum, FanartArtist, FanartImg, HDMusicLogo } from '@services/fanart.classes';
import { FanartService } from '@services/fanart.service';
import { TrackService } from '@services/track.service';
import { ElectronService } from 'ngx-electron';

@Component({
    selector: 'fanart',
    templateUrl: './fanart.component.html',
    styleUrls: ['./fanart.component.scss'],
})
export class FanartComponent implements OnInit {
    public artistData: FanartArtist;
    public artistId: string;
    public albumData: FanartAlbum;
    public popoverImage: FanartImg;
    public popoverImageIndex: number;
    public multiDisc = false;
    public numLogos = 0;
    public releaseGroupId: string;

    private hoverTimer: any;

    @ViewChild('popOverContainer') popOverContainer: ElementRef;

    constructor(private electronService: ElectronService,
                private route: ActivatedRoute,
                private router: Router,
                private ts: TrackService,
                private fanartService: FanartService) {
        this.artistId = route.snapshot.queryParamMap.get('artistId');
        this.releaseGroupId = route.snapshot.queryParamMap.get('albumId');
    }

    ngOnInit() {
        this.getArtistArt();
        this.getAlbumArt();
    }

    private getArtistArt() {
        this.fanartService.getArtist(this.artistId).toPromise().then(artist => {
            this.artistData = new FanartArtist(artist);
            this.numLogos = this.artistData.hdmusiclogos.length;
            console.log(this.artistData);
        });
    }

    private getAlbumArt() {
        this.fanartService.getAlbum(this.releaseGroupId).toPromise().then(album => {
            this.albumData = new FanartAlbum(album, this.releaseGroupId);
            console.log(this.albumData);
        });
    }

    public logoButtonClicked(logo: HDMusicLogo) {
        if (logo.save) {
            logo.save = false;
        } else {
            this.artistData.hdmusiclogos.map(logo => logo.save = false);
            logo.save = true;
        }
    }

    public discButtonClicked(index: number) {
        const discs = this.albumData.album.cdart;
        if (this.multiDisc) {
            if (discs[index].saveIndex !== 0) {
                const oldVal = discs[index].saveIndex;
                discs[index].saveIndex = 0;
                discs.forEach((d, index, arr) => {
                    if (d.saveIndex > oldVal) {
                        arr[index].saveIndex--;
                    }
                });
            } else {
                // get highest saveIndex and add one
                discs[index].saveIndex = Math.max(...discs.map(d => d.saveIndex)) + 1;
            }
        } else {
            if (discs[index].saveIndex) {
                discs[index].saveIndex = 0;
            } else {
                discs.map(d => d.saveIndex = 0);
                discs[index].saveIndex = 1;
            }
        }
    }

    public cdArtFilename(index: number): string {
        return index > 0 ? `cd${this.multiDisc ? index : ''}.png` : '';
    }

    public isSaveDisabled(): boolean {
        return !this.artistData?.hdmusiclogos.find(val => val.save) &&
            !this.albumData?.album.cdart.find(val => val.saveIndex);
    }

    public saveSelected() {
        const saveLogo = this.artistData.hdmusiclogos.filter(val => val.save);
        const saveDiscs = this.albumData.album.cdart.filter(val => val.saveIndex);
        saveLogo.forEach(logo => {
            this.electronService.ipcRenderer.send('download', {
                url: logo.url,
                options: {
                    filename: `${this.artistData.name}.png`,
                    directory: '/Users/kevinbuffington',
                },
            });
        });
        saveDiscs.forEach(disc => {
            console.log(this.ts.getCurrentFolder());
            this.electronService.ipcRenderer.send('download', {
                url: disc.url,
                options: {
                    filename: this.cdArtFilename(disc.saveIndex),
                    directory: this.ts.getCurrentFolder(),
                },
            });
        });
        console.log(saveLogo, saveDiscs);
        this.router.navigate(['/']);
    }

    public mouseEnter(imageIndex: number) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
            this.popoverImageIndex = imageIndex;
            this.setPopoverImage(this.popoverImageIndex);
        }, 2000);
    }

    public mouseLeave() {
        clearTimeout(this.hoverTimer);
    }

    private setPopoverImage(imageIndex: number) {
        setTimeout(() => this.popOverContainer.nativeElement.focus());
        if (imageIndex < 0) {
            imageIndex = this.numLogos + this.albumData.album.cdart.length - 1;
        } else if (imageIndex >= this.numLogos + this.albumData.album.cdart.length) {
            imageIndex = 0;
        }
        this.popoverImageIndex = imageIndex;
        if (imageIndex < this.numLogos) {
            this.popoverImage = this.artistData.hdmusiclogos[imageIndex];
        } else {
            this.popoverImage = this.albumData.album.cdart[imageIndex - this.numLogos];
        }
    }

    public zoom(event, imageIndex: number) {
        event.stopPropagation();
        this.setPopoverImage(imageIndex);
    }

    public keypressed(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
                this.setPopoverImage(this.popoverImageIndex - 1);
                break;
            case 'ArrowRight':
                this.setPopoverImage(this.popoverImageIndex + 1);
                break;
            case 'Escape':
                this.popoverImage = null;
                break;
        }
    }
}
