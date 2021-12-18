/**
 * Track data comes from NodeID3. Should not be used internally except when
 * creating Metadata objects, or when preparing to write data to tags.
 */
export class Track {
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
}

export class MetadataProperty {
    default = '';
    different = false; // whether not all values are the same
    multiValue = false;
    origValue = '';
    overwrite = true;
    userDefined = false;
    useDefault = false; // if true, the default value will be used instead of individual values for each track
    defaultChanged = false; // has initial value of useDefault changed, or has default value changed?
    values: string[] = [];
    origValues: string[] = []; // copy of values used for resetting
    write = true; // whether to write this property to the file
}

export class MetadataObj {
    album?: MetadataProperty;
    albumSortOrder?: MetadataProperty;
    artist?: MetadataProperty;
    ARTISTCOUNTRY?: MetadataProperty;
    ARTISTFILTER?: MetadataProperty;
    artistSortOrder?: MetadataProperty;
    CATALOGNUMBER?: MetadataProperty;
    date?: MetadataProperty;
    DISCSUBTITLE?: MetadataProperty;
    EDITION?: MetadataProperty;
    LABEL?: MetadataProperty;
    MUSICBRAINZ_ARTISTID?: MetadataProperty;
    MUSICBRAINZ_LABELID?: MetadataProperty;
    MUSICBRAINZ_RELEASEGROUPID?: MetadataProperty;
    originalArtist?: MetadataProperty;
    originalReleaseDate?: MetadataProperty;
    partOfSet?: MetadataProperty; // disc
    performerInfo?: MetadataProperty; // album artist
    RELEASECOUNTRY?: MetadataProperty;
    RELEASETYPE?: MetadataProperty;
    title?: MetadataProperty;
    trackNumber?: MetadataProperty;
    [key: string]: MetadataProperty;
}

export class TrackOptions {
    showArtwork?: boolean;
}

export class UnknownPropertiesObj {
    [key: string]: MetadataProperty;
}

export class CommentStruct {
    language: string;
    shortText: string;
    text: string;
}
