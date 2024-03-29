export class TrackServiceMocks {
    static mockTracks(): any[] {
        const tracks = [];
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'For Those About To Rock (We Salute You)',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '01',
            comment: 'This is a really long string of commented text that we can use to test out ' +
                     'the comments section of the page.\nTrying some line breaks\n\nhere.',
            composer: 'Satan',
            date: '1983-02-24',
            originalArtist: 'AC/DC',
            genre: 'Rock; Made-up-genre; Metal; Pop',
            userDefined: {
                ARTISTCOUNTRY: 'United States; Germany; Sweden;',
                ARTISTFILTER: 'AC/DC; Scott, Bon',
                EDITION: 'Super Deluxe Remaster',
                RELEASECOUNTRY: 'AU',
                RELEASETYPE: 'Album',
                MUSICBRAINZ_ARTISTID: '66c662b6-6e2f-4930-8610-912e24c63ed1',
                MUSICBRAINZ_RELEASEGROUPID: '331084ff-497b-3e3a-958e-0fefdae80cb6',
            },
        });
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            performerInfo: 'Various Artists',
            title: 'Put the Finger on You',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '02',
        });
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'Something is upside-down anti-intellectual fuckery',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '03',
        });
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'the the the the (the the) the the the (the the the)',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '04',
        });
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 01] - For Those About to Rock.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'DOA PCP NWA',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '05',
        });
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 02] - Put the Finger on You.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'Do it if you want to (Metallica remix)',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '06',
        });
        tracks.push({
            meta: {
                filename: 'ACDC [For Those About to Rock (We Salute You) 07] - C.O.D..mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'C.O.D.',
            artist: 'AC/DC',
            album: 'For Those About to Rock (We Salute You)',
            trackNumber: '07',
        });
        tracks.push({
            meta: {
                filename: 'ASIWYFA [Gangs 08] Gangs',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'Gangs of the modern era which is now dumbass',
            artist: 'And So I Watch You From Afar',
            album: 'Gangs',
            trackNumber: '08',
        });
        tracks.push({
            meta: {
                filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: '8a.m. 9P.M. 10am 11PM (feat. Kesha)',
            artist: 'Primordial',
            album: 'Where Greater Men Have Fallen',
            trackNumber: '09',
        });
        tracks.push({
            meta: {
                filename: 'Primordial [Where Greater Men Have Fallen 02] - Where Greater Men Have Fallen.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'Where Greater Men Have Fallen',
            artist: 'Primordial',
            album: 'Where Greater Men Have Fallen',
            trackNumber: '10',
        });
        return tracks;
    }

    static mockTrack(extraProps = {}): any {
        return Object.assign({
            meta: {
                filename: 'Mock Track.mp3',
                folder: '/music/ACDC - For Those About to Rock',
            },
            title: 'Mock Track',
            artist: 'AC/DC',
            album: 'Mock Track',
            trackNumber: '01',
            genre: 'Rock; Made-up-genre; Metal; Pop',
            userDefined: {
                ARTISTCOUNTRY: 'United States; Germany; Sweden;',
                EDITION: 'Super Deluxe Remaster',
                RELEASETYPE: 'Album',
                MUSICBRAINZ_ARTISTID: '66c662b6-6e2f-4930-8610-912e24c63ed1',
                MUSICBRAINZ_RELEASEGROUPID: '331084ff-497b-3e3a-958e-0fefdae80cb6',
            },
        }, extraProps);
    }
}
