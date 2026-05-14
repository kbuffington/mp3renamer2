export class FanartImg {
    id: number;
    likes: number;
    url: string;
    local = false;
    filename?: string;
    loaded = false;

    constructor(json: any) {
        this.id = json.id;
        this.likes = json.likes;
        this.url = json.url;
        if (json.local) {
            this.local = json.local;
        }
    }
}

export class AlbumCover extends FanartImg {
    constructor(json: any) {
        super(json);
    }
}

export class CdArt extends FanartImg {
    disc: number;
    size: number;
    saveIndex = 0;

    constructor(json: any) {
        super(json);
        this.disc = json.disc;
        this.size = json.size;
    }
}

export class AlbumArt {
    albumcover: AlbumCover[];
    cdart: CdArt[];

    constructor(json: any) {
        this.albumcover = json.albumcover?.map((img: any) => new AlbumCover(img)) ?? [];
        this.cdart = json.cdart?.map((img: any) => new CdArt(img)) ?? [];
    }
}

export class FanartAlbum {
    artistName: string;
    artistId: string;
    album: AlbumArt;

    constructor(json: any, releaseGroupId: string) {
        this.artistName = json.name;
        this.artistId = json.mbid_id;
        this.album = new AlbumArt(json.albums[releaseGroupId]);
    }
}

export class HDMusicLogo extends FanartImg {
    save = false;

    constructor(json: any) {
        super(json);
        if (json.save) {
            this.save = json.save;
        }
    }
}

export class FanartArtist {
    name: string;
    mbid: string;
    hdmusiclogos: HDMusicLogo[] = [];

    constructor(json: any) {
        this.name = json.name;
        this.mbid = json.mbid_id;
        this.hdmusiclogos = json.hdmusiclogo?.map((hdml: any) => new HDMusicLogo(hdml)) ?? [];
    }
}

export class LabelLogo extends FanartImg {
    save = false;
    color: string;

    constructor(json: any) {
        super(json);
        this.color = json.colour;
        if (json.save) {
            this.save = json.save;
        }
    }
}
export class FanartMusicLabel {
    name: string;
    labelId: string;
    musiclabels: LabelLogo[] = [];

    constructor(json: any) {
        this.name = json.name;
        this.labelId = json.id;
        this.musiclabels = json.musiclabel?.map((ml: any) => new LabelLogo(ml)) ?? [];
    }
}
