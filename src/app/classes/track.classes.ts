/**
 * Track data comes from NodeID3. Should not be used internally except when
 * creating Metadata objects, or when preparing to write data to tags.
 */
export type Track = {
    artist?: string | string[];
    album?: string;
    composer?: string | string[];
    genre?: string | string[];
    image?: any;
    partOfSet?: string;
    performerInfo?: string | string[];
    title?: string;
    trackNumber?: string;
    userDefined?: {
        // non-standard properties (typically stored in TXXX frame)
        [key: string]: any;
    };
    meta: {
        // information about the physical file
        originalFilename: string;
        filename: string;
        folder: string;
        extension: string;
    };
    raw: any; // raw frames from the file
};

export class MetadataProperty {
    private pvtDefault = '';

    public different = false; // whether not all values are the same
    public multiValue = false;
    public origValue = '';
    public overwrite = true;
    public userDefined = false;
    public useDefault = false; // if true, the default value will be used instead of individual values for each track
    public defaultChanged = false; // has initial value of useDefault changed, or has default value changed?
    public values: string[] = [];
    public origValues: string[] = []; // copy of values used for resetting
    public write = true; // whether to write this property to the file

    public get default() {
        return this.pvtDefault;
    }

    public set default(value) {
        this.pvtDefault = value;
    }
}

export type MetadataObj = {
    album?: MetadataProperty;
    albumSortOrder?: MetadataProperty;
    artist?: MetadataProperty;
    ARTISTCOUNTRY?: MetadataProperty;
    ARTISTFILTER?: MetadataProperty;
    artistSortOrder?: MetadataProperty;
    CATALOGNUMBER?: MetadataProperty;
    composer?: MetadataProperty;
    copyright?: MetadataProperty;
    comment?: MetadataProperty;
    date?: MetadataProperty;
    DISCSUBTITLE?: MetadataProperty;
    EDITION?: MetadataProperty;
    encodedBy?: MetadataProperty;
    genre?: MetadataProperty;
    image?: MetadataProperty;
    LABEL?: MetadataProperty;
    MUSICBRAINZ_ARTISTID?: MetadataProperty;
    MUSICBRAINZ_LABELID?: MetadataProperty;
    MUSICBRAINZ_RELEASEGROUPID?: MetadataProperty;
    originalArtist?: MetadataProperty;
    originalReleaseDate?: MetadataProperty;
    partOfSet?: MetadataProperty; // disc
    performerInfo?: MetadataProperty; // album artist
    replaygain_album_gain?: MetadataProperty;
    replaygain_album_peak?: MetadataProperty;
    replaygain_track_gain?: MetadataProperty;
    replaygain_track_peak?: MetadataProperty;
    RELEASECOUNTRY?: MetadataProperty;
    RELEASETYPE?: MetadataProperty;
    title?: MetadataProperty;
    trackNumber?: MetadataProperty;
    'VINYL SIDE'?: MetadataProperty;
    'VINYL TRACKNUMBER'?: MetadataProperty;
};

export type MetadataKey = keyof MetadataObj;

export class TrackOptions {
    showArtwork?: boolean;
    localArtwork?: string; // path to user loaded artwork not saved yet
}

export class UnknownPropertiesObj {
    [key: string]: MetadataProperty;
}

export type CommentStruct = {
    language: string;
    shortText: string;
    text: string;
};

export class ImageType {
    id = 3;
    name = 'front cover';
}

export class ImageStruct {
    mime = 'jpeg';
    imageBuffer: Buffer;
    type: ImageType;

    constructor(imageBuffer: Buffer, mimeType?: string, type?: ImageType) {
        this.imageBuffer = imageBuffer;
        this.type = type || new ImageType();
        if (mimeType) {
            this.mime = mimeType;
        }
    }
}
