export class FanartImg {
    id: number;
    likes: number;
    url: string;

    constructor(json) {
        this.id = json.id;
        this.likes = json.likes;
        this.url = json.url;
    }
}

export class AlbumCover extends FanartImg {
    constructor(json) {
        super(json);
    }
}

export class CdArt extends FanartImg {
    disc: number;
    size: number;

    constructor(json) {
        super(json);
        this.disc = json.disc;
        this.size = json.size;
    }
}

export class AlbumArt {
    albumcover: AlbumCover[];
    cdart: CdArt[];

    constructor(json) {
        this.albumcover = json.albumcover.map(img => new AlbumCover(img));
        this.cdart = json.cdart.map(img => new CdArt(img));
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
    constructor(json) {
        super(json);
    }
}

export class FanartArtist {
    name: string;
    mbid: string;
    hdmusiclogos: HDMusicLogo[] = [];

    constructor(json) {
        this.name = json.name;
        this.mbid = json.mbid_id;
        this.hdmusiclogos = json.hdmusiclogo.map(hdml => new HDMusicLogo(hdml));
    }
}
