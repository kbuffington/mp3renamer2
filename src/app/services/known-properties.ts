export type PropertyInfo = {
    userDefined: boolean; // if this is a non-standard (not in ID3 spec) property. Usually a custom TXXX frame
    multiValue: boolean; // true if the property is a multi-value property
    useDefault?: boolean; // true if all files should share the same default value
    alias?: string;
    write: boolean;
}

/* eslint-disable no-multi-spaces */
export const knownProperties: Map<string, PropertyInfo> = new Map([
    ['album',                       { write: true, userDefined: false, multiValue: false, useDefault: true }],
    ['albumSortOrder',              { write: true, userDefined: false, multiValue: false, useDefault: true }],
    ['artist',                      { write: true, userDefined: false, multiValue: false }],
    ['artistSortOrder',             { write: true, userDefined: false, multiValue: false, useDefault: true }],
    ['comment',                     { write: true, userDefined: false, multiValue: false }],
    ['composer',                    { write: true, userDefined: false, multiValue: true }],
    ['copyright',                   { write: true, userDefined: false, multiValue: true }],
    ['encodedBy',                   { write: true, userDefined: false, multiValue: true }],
    ['date',                        { write: true, userDefined: false, multiValue: true, useDefault: true }],
    ['genre',                       { write: true, userDefined: false, multiValue: true, useDefault: true }],
    ['originalArtist',              { write: true, userDefined: false, multiValue: true }],
    ['originalReleaseDate',         { write: true, userDefined: false, multiValue: true, useDefault: true }],
    ['partOfSet',                   { write: true, userDefined: false, multiValue: false }],
    ['performerInfo',               { write: true, userDefined: false, multiValue: true, useDefault: true }],
    ['title',                       { write: true, userDefined: false, multiValue: false }], // not needed?
    ['trackNumber',                 { write: true, userDefined: false, multiValue: false }], // not needed?
    ['ARTISTCOUNTRY',               { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['ARTISTFILTER',                { write: true, userDefined: true, multiValue: true }],
    ['DISCSUBTITLE',                { write: true, userDefined: true, multiValue: true }],
    ['CATALOGNUMBER',               { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['EDITION',                     { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['LABEL',                       { write: true, userDefined: true, multiValue: true, alias: 'label', useDefault: true }],
    ['MUSICBRAINZ_ARTISTID',        { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['MUSICBRAINZ_RELEASEGROUPID',  { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['MUSICBRAINZ_LABELID',         { write: false, userDefined: true, multiValue: true }],
    ['RELEASETYPE',                 { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['RELEASECOUNTRY',              { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['replaygain_album_gain',       { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['replaygain_album_peak',       { write: true, userDefined: true, multiValue: true, useDefault: true }],
    ['replaygain_track_gain',       { write: true, userDefined: true, multiValue: true }],
    ['replaygain_track_peak',       { write: true, userDefined: true, multiValue: true }],
    ['VINYL SIDE',                  { write: true, userDefined: true, multiValue: false }],
    ['VINYL TRACKNUMBER',           { write: true, userDefined: true, multiValue: false }],
]);
