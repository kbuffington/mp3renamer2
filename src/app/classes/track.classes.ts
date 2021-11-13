export interface Track {
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
    write = false; // whether to write this property to the file
}

export class MetadataObj {
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

// TODO: the first five words should be used by the musicbrainz fuzzy search in ReplaceCommonWords()
// words that are lowercased if in the middle of a title (not first or last word)
export const lowerCaseWords = ['a', 'an', 'the', 'and', 'of', 'but', 'as', 'or', 'for', 'nor', 'at', 'by',
    'to', 'etc.', 'in', 'n\'', 'o\'', 'on',
    'vs', 'vs.'];

// Acronyms or other words that should always be upper case
export const upperCaseWords = ['DOA', 'RIP'];

// Words that should probably always be lower case
export const alwaysLowerCaseWords = ['remix', 'feat.'];
