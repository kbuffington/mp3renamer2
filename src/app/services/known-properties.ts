export class PropertyInfo {
    userDefined: boolean;
    multiValue: boolean; // true if the property is a multi-value property
    useDefault?: boolean; // true if all files should share the same default value
    alias?: string;
}

/* eslint-disable no-multi-spaces */
export const knownProperties: Map<string, PropertyInfo> = new Map([
    ['album',                       { userDefined: false, multiValue: false, useDefault: true }],
    ['albumSortOrder',              { userDefined: false, multiValue: false, useDefault: true }],
    ['artist',                      { userDefined: false, multiValue: false }],
    ['artistSortOrder',             { userDefined: false, multiValue: false, useDefault: true }],
    ['comment',                     { userDefined: false, multiValue: false }],
    ['composer',                    { userDefined: false, multiValue: true }],
    ['copyright',                   { userDefined: false, multiValue: true }],
    ['encodedBy',                   { userDefined: false, multiValue: true }],
    ['date',                        { userDefined: false, multiValue: true, useDefault: true }],
    ['genre',                       { userDefined: false, multiValue: true, useDefault: true }],
    ['originalArtist',              { userDefined: false, multiValue: true }],
    ['originalReleaseDate',         { userDefined: false, multiValue: true, useDefault: true }],
    ['partOfSet',                   { userDefined: false, multiValue: false }],
    ['performerInfo',               { userDefined: false, multiValue: true, useDefault: true }],
    ['title',                       { userDefined: false, multiValue: false }], // not needed?
    ['trackNumber',                 { userDefined: false, multiValue: false }], // not needed?
    ['ARTISTCOUNTRY',               { userDefined: true, multiValue: true, useDefault: true }],
    ['ARTISTFILTER',                { userDefined: true, multiValue: true }],
    ['DISCSUBTITLE',                { userDefined: true, multiValue: true }],
    ['CATALOGNUMBER',               { userDefined: true, multiValue: true, useDefault: true }],
    ['EDITION',                     { userDefined: true, multiValue: true, useDefault: true }],
    ['LABEL',                       { userDefined: true, multiValue: true, alias: 'label', useDefault: true }],
    ['MUSICBRAINZ_ARTISTID',        { userDefined: true, multiValue: true, useDefault: true }],
    ['MUSICBRAINZ_RELEASEGROUPID',  { userDefined: true, multiValue: true, useDefault: true }],
    ['RELEASETYPE',                 { userDefined: true, multiValue: true, useDefault: true }],
    ['RELEASECOUNTRY',              { userDefined: true, multiValue: true, useDefault: true }],
    ['replaygain_album_gain',       { userDefined: true, multiValue: true, useDefault: true }],
    ['replaygain_album_peak',       { userDefined: true, multiValue: true, useDefault: true }],
    ['replaygain_track_gain',       { userDefined: true, multiValue: true }],
    ['replaygain_track_peak',       { userDefined: true, multiValue: true }],
]);
