export class PropertyInfo {
	userDefined: boolean;
	multiValue: boolean;
}

export const knownProperties: Map<string, PropertyInfo> = new Map([
	['artist', 						{ userDefined: false, multiValue: false }],
	['title',						{ userDefined: false, multiValue: false }],	// not needed?
	['trackNumber',					{ userDefined: false, multiValue: false }],	// not needed?
	['album', 						{ userDefined: false, multiValue: false }],
	['genre', 						{ userDefined: false, multiValue: true }],
	['albumSortOrder', 				{ userDefined: false, multiValue: false }],
	['artistSortOrder', 			{ userDefined: false, multiValue: false }],
	['comment', 					{ userDefined: false, multiValue: false }],
	['composer', 					{ userDefined: false, multiValue: true }],
	['copyright', 					{ userDefined: false, multiValue: true }],
	['date', 						{ userDefined: false, multiValue: true }],
	['encodedBy', 					{ userDefined: false, multiValue: true }],
	['originalArtist', 				{ userDefined: false, multiValue: true }],
	['partOfSet', 					{ userDefined: false, multiValue: false }],
	['performerInfo', 				{ userDefined: false, multiValue: true }],
	['RELEASETYPE', 				{ userDefined: true, multiValue: true }],
	['EDITION', 					{ userDefined: true, multiValue: true }],
	['LABEL', 						{ userDefined: true, multiValue: true }],
	['ARTISTCOUNTRY', 				{ userDefined: true, multiValue: true }],
	['ARTISTFILTER', 				{ userDefined: true, multiValue: true }],
	['MUSICBRAINZ_ARTISTID', 		{ userDefined: true, multiValue: true }],
	['MUSICBRAINZ_RELEASEGROUPID', 	{ userDefined: true, multiValue: true }],
	['CATALOGNUMBER', 				{ userDefined: true, multiValue: true }],
	['DISCSUBTITLE', 				{ userDefined: true, multiValue: true }],
	['replaygain_album_gain', 		{ userDefined: true, multiValue: true }],
	['replaygain_album_peak', 		{ userDefined: true, multiValue: true }],
	['replaygain_track_gain', 		{ userDefined: true, multiValue: true }],
	['replaygain_track_peak', 		{ userDefined: true, multiValue: true }],
]);
