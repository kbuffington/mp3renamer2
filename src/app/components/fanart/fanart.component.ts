import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FanartAlbum, FanartArtist, HDMusicLogo } from '@services/fanart.classes';
import { FanartService } from '@services/fanart.service';

@Component({
    selector: 'fanart',
    templateUrl: './fanart.component.html',
    styleUrls: ['./fanart.component.scss'],
})
export class FanartComponent implements OnInit {
    public artistData: FanartArtist;
    public artistId: string;
    public albumData: FanartAlbum;
    public releaseGroupId: string;
    // public logoButtons: boolean[] = [];
    // public discArtButtons: number[] = [];
    public multiDisc = false;

    constructor(private route: ActivatedRoute,
                private router: Router,
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
            console.log(this.artistData);
        });
    }

    private getAlbumArt() {
        this.fanartService.getAlbum(this.releaseGroupId).toPromise().then(album => {
            this.albumData = new FanartAlbum(album, this.releaseGroupId);
            // for (let i = 0; i < this.albumData.album.cdart.length; i++) {
            //     this.discArtButtons[i] = 0;
            // }
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
        return index > 0 ? `cd${index}.png` : '';
    }

    public isSaveDisabled():boolean {
        return !this.artistData?.hdmusiclogos.find(val => val.save) &&
            !this.albumData?.album.cdart.find(val => val.saveIndex);
    }

    public saveSelected() {
        const saveLogo = this.artistData.hdmusiclogos.filter(val => val.save);
        const saveDiscs = this.albumData.album.cdart.filter(val => val.saveIndex);
        console.log(saveLogo, saveDiscs);
        this.router.navigate(['/']);
    }
}
