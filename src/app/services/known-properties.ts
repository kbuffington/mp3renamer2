export class PropertyInfo {
	userDefined: boolean;
	multiValue: boolean;
	alias?: string;
}

export const knownProperties: Map<string, PropertyInfo> = new Map([
	['album', 						{ userDefined: false, multiValue: false }],
	['albumSortOrder', 				{ userDefined: false, multiValue: false }],
	['artist', 						{ userDefined: false, multiValue: false }],
	['artistSortOrder', 			{ userDefined: false, multiValue: false }],
	['comment', 					{ userDefined: false, multiValue: false }],
	['composer', 					{ userDefined: false, multiValue: true }],
	['copyright', 					{ userDefined: false, multiValue: true }],
	['encodedBy', 					{ userDefined: false, multiValue: true }],
	['date', 						{ userDefined: false, multiValue: true }],
	['genre', 						{ userDefined: false, multiValue: true }],
	['originalArtist', 				{ userDefined: false, multiValue: true }],
	['originalReleaseDate', 		{ userDefined: false, multiValue: true }],
	['partOfSet', 					{ userDefined: false, multiValue: false }],
	['performerInfo', 				{ userDefined: false, multiValue: true }],
	['title',						{ userDefined: false, multiValue: false }],	// not needed?
	['trackNumber',					{ userDefined: false, multiValue: false }],	// not needed?
	['ARTISTCOUNTRY', 				{ userDefined: true, multiValue: true }],
	['ARTISTFILTER', 				{ userDefined: true, multiValue: true }],
	['DISCSUBTITLE', 				{ userDefined: true, multiValue: true }],
	['CATALOGNUMBER', 				{ userDefined: true, multiValue: true }],
	['EDITION', 					{ userDefined: true, multiValue: true }],
	['LABEL', 						{ userDefined: true, multiValue: true, alias: 'label'}],
	['MUSICBRAINZ_ARTISTID', 		{ userDefined: true, multiValue: true }],
	['MUSICBRAINZ_RELEASEGROUPID', 	{ userDefined: true, multiValue: true }],
	['RELEASETYPE', 				{ userDefined: true, multiValue: true }],
	['replaygain_album_gain', 		{ userDefined: true, multiValue: true }],
	['replaygain_album_peak', 		{ userDefined: true, multiValue: true }],
	['replaygain_track_gain', 		{ userDefined: true, multiValue: true }],
	['replaygain_track_peak', 		{ userDefined: true, multiValue: true }],
]);
