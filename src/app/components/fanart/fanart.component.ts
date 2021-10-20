import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FanartAlbum, FanartArtist } from '@services/fanart.classes';
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


    constructor(private route: ActivatedRoute,
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
            console.log(this.albumData);
        });
    }
}
