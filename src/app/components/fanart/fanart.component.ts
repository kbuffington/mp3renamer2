import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdArt, FanartAlbum, FanartArtist, FanartImg, FanartMusicLabel, HDMusicLogo, LabelLogo } from '@classes/fanart.classes';
import { FanartService } from '@services/fanart.service';
import { TrackService } from '@services/track.service';
import { ElectronService } from '@services/electron.service';
import { ConfigService, ConfigSettingsObject } from '@services/config.service';
import { MetadataObj } from '@classes/track.classes';

@Component({
    selector: 'fanart',
    templateUrl: './fanart.component.html',
    styleUrls: ['./fanart.component.scss'],
})
export class FanartComponent implements OnInit {
    public artistData: FanartArtist;
    public albumData: FanartAlbum;
    public fetchingHdLogos = false;
    public fetchingLabels = 0;
    public musicLabels: FanartMusicLabel[] = [];
    public popoverImage: FanartImg;
    public popoverImageIndex: number;
    public multiDisc = false;
    public numLogos = 0;
    public numCds = 0;
    public numLabelLogos = 0;
    public cds: CdArt[] = [];

    private artistId: string;
    private labelIds: string[] = [];
    private hoverTimer: any;
    private releaseGroupId: string;
    private configSettings: ConfigSettingsObject;
    private metadata: MetadataObj;

    @ViewChild('popOverContainer') popOverContainer: ElementRef;

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private route: ActivatedRoute,
                private router: Router,
                private ts: TrackService,
                private fanartService: FanartService) {
        this.artistId = route.snapshot.queryParamMap.get('artistId');
        this.releaseGroupId = route.snapshot.queryParamMap.get('albumId');
        const labelIdsString = route.snapshot.queryParamMap.get('labelIds');
        if (labelIdsString) {
            this.labelIds = labelIdsString.split('; ');
        }
    }

    ngOnInit() {
        this.configSettings = this.configService.getCurrentConfig();
        this.getArtistArt();
        this.getAlbumArt();
        this.getLabelLogos();
    }

    private getArtistArt() {
        let logo: HDMusicLogo = undefined;
        this.fetchingHdLogos = true;
        this.metadata = this.ts.getCurrentMetadata();
        const artist = this.metadata.artist.default;
        const path = `${this.configSettings.artistLogoDir}/${artist}.png`;
        if (this.electronService.fs.existsSync(path)) {
            logo = new HDMusicLogo({
                local: true,
                save: true,
                url: `file://${path}?cb=${Date.now()}`,
            });
        }
        this.fanartService.getArtist(this.artistId).then(artist => {
            this.artistData = new FanartArtist(artist);
            if (logo) {
                this.artistData.hdmusiclogos.unshift(logo);
            }
            this.numLogos = this.artistData.hdmusiclogos.length;
            this.fetchingHdLogos = false;
            console.log(this.artistData);
        }).catch((err) => {
            this.fetchingHdLogos = false;
            if (err.status === 404) {
                console.log('No artist found for', this.artistId);
            } else {
                console.log(err);
            }
        });
    }

    private getAlbumArt() {
        this.numCds = 0;
        const currentPath = this.ts.getCurrentPath();
        this.electronService.fs.readdirSync(currentPath).forEach(file => {
            const cdMatch = file.match(/^cd(\d?)\.png$/);
            if (cdMatch) {
                const cd = new CdArt({
                    local: true,
                    url: `file://${currentPath}${file}?cb=${Date.now()}`,
                    disc: 1,
                    size: 1000,
                });
                if (cdMatch[1]) {
                    cd.disc = parseInt(cdMatch[1]);
                    this.multiDisc = true;
                }
                cd.saveIndex = cd.disc;
                cd.filename = file;
                this.cds.push(cd);
            }
        });
        this.fanartService.getAlbum(this.releaseGroupId).then(album => {
            this.albumData = new FanartAlbum(album, this.releaseGroupId);
            this.albumData.album.cdart.unshift(...this.cds);
            this.numCds += this.albumData.album.cdart.length;
            console.log(this.albumData);
        }).catch(err => {
            if (err.status === 404) {
                console.log('No album found for', this.releaseGroupId);
            } else {
                console.log(err);
            }
        });
    }

    private getLabelLogos() {
        this.labelIds.forEach(labelId => {
            this.fetchingLabels++;
            this.fanartService.getLogo(labelId).then(musiclabel => {
                const label = new FanartMusicLabel(musiclabel);
                const saveName = this.getLabelSaveName(label.name);
                const path = `${this.configSettings.labelLogoDir}/${saveName}.png`;
                if (this.electronService.fs.existsSync(path)) {
                    const logo = new LabelLogo({
                        local: true,
                        save: true,
                        url: `file://${path}?cb=${Date.now()}`,
                    });
                    label.musiclabels.unshift(logo);
                }
                this.musicLabels.push(label);
                this.numLabelLogos += label.musiclabels.length;
                this.fetchingLabels--;
                console.log(label);
            }).catch(err => {
                this.fetchingLabels--;
                if (err.status === 404) {
                    console.log('No logos found for label:', labelId);
                } else {
                    console.log(err);
                }
            });
        });
    }

    private getLabelSaveName(labelName: string): string {
        return labelName.replace(/ Records$/, '').replace(/ Recordings$/, '').replace(/ Music$/, '');
    }

    public logoButtonClicked(logo: HDMusicLogo) {
        clearTimeout(this.hoverTimer);
        if (logo.save) {
            logo.save = false;
        } else {
            this.artistData.hdmusiclogos.map(logo => logo.save = false);
            logo.save = true;
        }
    }

    public labelButtonClicked(logo: LabelLogo, label: FanartMusicLabel) {
        clearTimeout(this.hoverTimer);
        if (logo.save) {
            logo.save = false;
        } else {
            label.musiclabels.map(logo => logo.save = false);
            logo.save = true;
        }
    }

    public discButtonClicked(index: number) {
        clearTimeout(this.hoverTimer);
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
            !this.albumData?.album.cdart.find(val => val.saveIndex) &&
            !this.musicLabels.find(val => val.musiclabels.find(val => val.save));
    }

    public saveSelected() {
        const saveLogo = this.artistData?.hdmusiclogos.filter(val => val.save && !val.local) ?? [];
        const saveDiscs = this.albumData?.album.cdart.filter(val => val.saveIndex && !val.local) ?? [];
        const saveLabels = this.musicLabels.filter(val => val.musiclabels.filter(l => l.save).length > 0) ?? [];
        saveLogo.forEach(logo => {
            this.electronService.ipcRenderer.send('download', {
                url: logo.url,
                options: {
                    filename: `${this.artistData.name}.png`,
                    directory: this.configSettings.artistLogoDir,
                },
            });
        });
        saveDiscs.forEach(disc => {
            this.electronService.ipcRenderer.send('download', {
                url: disc.url,
                options: {
                    filename: this.cdArtFilename(disc.saveIndex),
                    directory: this.ts.getCurrentPath(),
                },
            });
        });
        saveLabels.forEach(label => {
            const img = label.musiclabels.find(l => l.save && !l.local);
            if (img) {
                const saveName = this.getLabelSaveName(label.name);
                this.electronService.ipcRenderer.send('download', {
                    url: img.url,
                    options: {
                        filename: `${saveName}.png`,
                        directory: this.configSettings.labelLogoDir,
                    },
                });
            }
        });
        this.router.navigate(['/']);
    }

    public mouseEnter(imageIndex: number, label?: FanartMusicLabel) {
        clearTimeout(this.hoverTimer);
        let imgIndex = imageIndex;
        if (label) {
            imgIndex = this.getLabelIndex(label, imageIndex);
        }
        this.hoverTimer = setTimeout(() => {
            this.popoverImageIndex = imgIndex;
            this.setPopoverImage(this.popoverImageIndex);
        }, 2000);
    }

    private getLabelIndex(label: FanartMusicLabel, index: number): number {
        let imgIndex = this.numLogos + this.numCds;
        for (let i = 0; i < this.musicLabels.length; i++) {
            if (this.musicLabels[i].name === label.name) {
                break;
            }
            imgIndex += this.musicLabels[i].musiclabels.length;
        }
        imgIndex += index;
        return imgIndex;
    }

    public mouseLeave() {
        clearTimeout(this.hoverTimer);
    }

    private setPopoverImage(imageIndex: number) {
        if (imageIndex < 0) {
            imageIndex = this.numLogos + this.albumData.album.cdart.length + this.numLabelLogos - 1;
        } else if (imageIndex >= this.numLogos + this.numCds + this.numLabelLogos) {
            imageIndex = 0;
        }
        this.popoverImageIndex = imageIndex;
        if (imageIndex < this.numLogos) {
            this.popoverImage = this.artistData.hdmusiclogos[imageIndex];
        } else if (imageIndex < this.numLogos + this.numCds) {
            this.popoverImage = this.albumData.album.cdart[imageIndex - this.numLogos];
        } else {
            let index = imageIndex - this.numLogos - this.numCds;
            let i = 0;
            while (index >= this.musicLabels[i].musiclabels.length) {
                index -= this.musicLabels[i].musiclabels.length;
                i++;
            }
            this.popoverImage = this.musicLabels[i].musiclabels[index];
        }
        if (!this.popoverImage.loaded) {
            this.popoverImage = undefined;
        } else {
            setTimeout(() => this.popOverContainer.nativeElement.focus());
        }
    }

    public zoom(event, index: number, label?: FanartMusicLabel) {
        event.stopPropagation();
        let imgIndex = index;
        if (label) {
            imgIndex = this.getLabelIndex(label, index);
        }
        this.setPopoverImage(imgIndex);
    }

    // we handle < 0 && > 0 in setPopoverImage()
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
                setTimeout(() => clearTimeout(this.hoverTimer), 100);
                break;
        }
    }

    public onLoad(img: FanartImg) {
        img.loaded = true;
    }
}
