import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { TrackService } from './track.service';
import { ElectronService } from './electron.service';
import { ConfigService, ConfigSettingsObject } from './config.service';
import { TitleCaseService } from './title-case.service';
import { ValuesWrittenService } from './values-written.service';
import { MetadataObj, MetadataProperty, Track } from '../classes/track.classes';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTrack(filename: string, folder: string, overrides: Partial<Track> = {}): Track {
    return {
        meta: { filename, folder, originalFilename: '', extension: '' },
        raw: null,
        ...overrides,
    } as Track;
}

function makeProp(values: string[], useDefault = false): MetadataProperty {
    const p = new MetadataProperty();
    p.values = [...values];
    p.origValues = [...values];
    p.default = values[0] ?? '';
    p.origValue = values[0] ?? '';
    p.useDefault = useDefault;
    p.write = true;
    return p;
}

const DEFAULT_CONFIG: ConfigSettingsObject = {
    homeDir: 'C:\\Music',
    artistLogoDir: '',
    labelLogoDir: '',
    fanartApiKey: '',
    aadPath: '',
    aadParams: '',
    replaceUnicodeApostrophe: false,
    replaceUnicodeEllipsis: false,
    replaceUnicodeQuotes: false,
    replacementFileNameChars: {
        '\\': '-',
        '/': '-',
        ':': '-',
        '*': '',
        '?': '',
        '"': "'",
        '<': '',
        '>': '_',
        '|': '',
    },
};

// ── suite ─────────────────────────────────────────────────────────────────────

describe('TrackService', () => {
    let service: TrackService;
    let mockValuesWrittenService: jasmine.SpyObj<ValuesWrittenService>;
    let configSubject: BehaviorSubject<ConfigSettingsObject>;

    beforeEach(() => {
        configSubject = new BehaviorSubject<ConfigSettingsObject>(DEFAULT_CONFIG);

        const mockElectronService = {
            main: { os: 'linux' },
            util: null,
            fs: { rename: jasmine.createSpy('rename') },
        };

        const mockConfigService = {
            getConfig: () => configSubject.asObservable(),
        };

        mockValuesWrittenService = jasmine.createSpyObj('ValuesWrittenService', [
            'markWritten',
            'markDirty',
        ]);

        TestBed.configureTestingModule({
            providers: [
                TrackService,
                TitleCaseService,
                { provide: ElectronService, useValue: mockElectronService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: ValuesWrittenService, useValue: mockValuesWrittenService },
            ],
        });

        service = TestBed.inject(TrackService);
    });

    it('sets pathDelimiter to \\ on win32', () => {
        const winElectronService = {
            main: { os: 'win32' },
            util: null,
            fs: { rename: jasmine.createSpy() },
        };
        const winService = new TrackService(
            winElectronService as any,
            TestBed.inject(TitleCaseService),
            { getConfig: () => configSubject.asObservable() } as any,
            mockValuesWrittenService,
        );
        expect(winService.pathDelimiter).toBe('\\');
    });

    // ── alphaRoman ──────────────────────────────────────────────────────────

    describe('alphaRoman()', () => {
        it('converts numbers to alphabetic Roman numerals', () => {
            expect(service.alphaRoman(1)).toBe('I');
            expect(service.alphaRoman(2)).toBe('II');
            expect(service.alphaRoman(4)).toBe('IIII');
            expect(service.alphaRoman(5)).toBe('V');
            expect(service.alphaRoman(6)).toBe('VI');
            expect(service.alphaRoman(9)).toBe('VIIII');
            expect(service.alphaRoman(10)).toBe('X');
            expect(service.alphaRoman(14)).toBe('XIIII');
            expect(service.alphaRoman(29)).toBe('XXVIIII');
        });
        it('accepts a string argument', () => expect(service.alphaRoman('3')).toBe('III'));
    });

    // ── path helpers ────────────────────────────────────────────────────────

    describe('getCurrentPath()', () => {
        it('returns empty string when no tracks are loaded', () => {
            expect(service.getCurrentPath()).toBe('');
        });

        it('returns the folder of the first track', () => {
            service.setTracks([makeTrack('song.mp3', '/Music/Artist/Album/')]);
            expect(service.getCurrentPath()).toBe('/Music/Artist/Album/');
        });
    });

    describe('getCurrentDirectory()', () => {
        it('returns empty string when no tracks loaded', () => {
            expect(service.getCurrentDirectory()).toBe('');
        });

        it('extracts directory name without path or trailing slash', () => {
            service.setTracks([makeTrack('song.mp3', '/Music/Artist/Album/')]);
            expect(service.getCurrentDirectory()).toBe('Album');
        });

        it('works for a single-level path', () => {
            service.setTracks([makeTrack('song.mp3', '/Music/')]);
            expect(service.getCurrentDirectory()).toBe('Music');
        });
    });

    // ── track management ────────────────────────────────────────────────────

    describe('setTracks()', () => {
        it('sets originalFilename from filename', () => {
            service.setTracks([makeTrack('01 - Song.mp3', '/Music/')]);
            expect(service.getCurrentTracks()[0].meta.originalFilename).toBe('01 - Song.mp3');
        });

        it('extracts the file extension', () => {
            service.setTracks([makeTrack('01 - Song.mp3', '/Music/')]);
            expect(service.getCurrentTracks()[0].meta.extension).toBe('.mp3');
        });

        it('emits the track list', () => {
            const tracks: Track[] = [];
            service.getTracks().subscribe(t => tracks.push(...t));
            service.setTracks([makeTrack('song.mp3', '/Music/')]);
            expect(tracks.length).toBeGreaterThan(0);
        });

        it('calls markWritten after loading', () => {
            service.setTracks([makeTrack('song.mp3', '/Music/')]);
            expect(mockValuesWrittenService.markWritten).toHaveBeenCalled();
        });

        it('updates the track count via getNumTracks', () => {
            service.setTracks([
                makeTrack('a.mp3', '/Music/'),
                makeTrack('b.mp3', '/Music/'),
                makeTrack('c.mp3', '/Music/'),
            ]);
            expect(service.getNumTracks()).toBe(3);
        });
    });

    describe('clearTracks()', () => {
        it('empties the track list', () => {
            service.setTracks([makeTrack('song.mp3', '/Music/')]);
            service.clearTracks();
            expect(service.getNumTracks()).toBe(0);
        });
    });

    describe('resetTrackData()', () => {
        it('restores tracks to the state at last setTracks call', () => {
            service.setTracks([makeTrack('original.mp3', '/Music/')]);
            service.getCurrentTracks()[0].meta.filename = 'modified.mp3';
            service.resetTrackData();
            expect(service.getCurrentTracks()[0].meta.filename).toBe('original.mp3');
        });
    });

    describe('revertFilenames()', () => {
        it('resets filenames to originalFilename', () => {
            service.setTracks([makeTrack('original.mp3', '/Music/')]);
            service.getCurrentTracks()[0].meta.filename = 'renamed.mp3';
            service.revertFilenames();
            expect(service.getCurrentTracks()[0].meta.filename).toBe('original.mp3');
        });

        it('reverts all tracks', () => {
            service.setTracks([makeTrack('a.mp3', '/Music/'), makeTrack('b.mp3', '/Music/')]);
            service.getCurrentTracks().forEach(t => (t.meta.filename = 'renamed.mp3'));
            service.revertFilenames();
            expect(service.getCurrentTracks()[0].meta.filename).toBe('a.mp3');
            expect(service.getCurrentTracks()[1].meta.filename).toBe('b.mp3');
        });
    });

    // ── metadata helpers ─────────────────────────────────────────────────────

    describe('setMetadata() / getCurrentMetadata()', () => {
        it('stores and retrieves metadata', () => {
            const m: MetadataObj = { title: makeProp(['My Song']) };
            service.setMetadata(m);
            expect(service.getCurrentMetadata().title!.default).toBe('My Song');
        });
    });

    // ── fixCapitalization ────────────────────────────────────────────────────

    describe('fixCapitalization()', () => {
        beforeEach(() => {
            const m: MetadataObj = {
                title: makeProp(['Song Of the Summer', 'Another Of the Songs']),
                album: makeProp(['Best Of the Year'], true),
            };
            service.setMetadata(m);
        });

        it('fixes selected title values', () => {
            service.updateSelectedTracks([0]);
            service.fixCapitalization();
            expect(service.getCurrentMetadata().title!.values[0]).toBe('Song of the Summer');
        });

        it('does not change unselected title values', () => {
            service.updateSelectedTracks([0]);
            service.fixCapitalization();
            expect(service.getCurrentMetadata().title!.values[1]).toBe('Another Of the Songs');
        });

        it('fixes album default regardless of selection', () => {
            service.updateSelectedTracks([]);
            service.fixCapitalization();
            expect(service.getCurrentMetadata().album!.default).toBe('Best of the Year');
        });

        it('sets album defaultChanged after fixing', () => {
            service.updateSelectedTracks([]);
            service.fixCapitalization();
            expect(service.getCurrentMetadata().album!.defaultChanged).toBeTrue();
        });

        it('calls markDirty', () => {
            service.updateSelectedTracks([0]);
            service.fixCapitalization();
            expect(mockValuesWrittenService.markDirty).toHaveBeenCalled();
        });
    });

    // ── guessTitles ──────────────────────────────────────────────────────────

    describe('guessTitles()', () => {
        beforeEach(() => {
            const m: MetadataObj = {
                title: makeProp(['song one', 'song two']),
            };
            service.setMetadata(m);
        });

        it('applies title case to selected tracks when doTitleCase is true', () => {
            service.doTitleCase = true;
            service.updateSelectedTracks([0]);
            service.guessTitles();
            expect(service.getCurrentMetadata().title!.values[0]).toBe('Song One');
        });

        it('does not apply title case when doTitleCase is false', () => {
            service.doTitleCase = false;
            service.updateSelectedTracks([0]);
            service.guessTitles();
            expect(service.getCurrentMetadata().title!.values[0]).toBe('song one');
        });

        it('leaves unselected tracks unchanged', () => {
            service.doTitleCase = true;
            service.updateSelectedTracks([0]);
            service.guessTitles();
            expect(service.getCurrentMetadata().title!.values[1]).toBe('song two');
        });

        it('applies deleteString to selected tracks', () => {
            service.deleteString = 'song ';
            service.doTitleCase = false;
            service.updateSelectedTracks([0]);
            service.guessTitles();
            expect(service.getCurrentMetadata().title!.values[0]).toBe('one');
        });

        it('applies find/replace to selected tracks', () => {
            service.findString = 'one';
            service.replaceString = 'ONE';
            service.doTitleCase = false;
            service.updateSelectedTracks([0]);
            service.guessTitles();
            expect(service.getCurrentMetadata().title!.values[0]).toBe('song ONE');
        });

        it('calls markDirty', () => {
            service.updateSelectedTracks([0]);
            service.guessTitles();
            expect(mockValuesWrittenService.markDirty).toHaveBeenCalled();
        });
    });

    // ── renumberTracks ───────────────────────────────────────────────────────

    describe('renumberTracks()', () => {
        beforeEach(() => {
            service.setTracks([
                makeTrack('01.mp3', '/Music/', { trackNumber: '01' }),
                makeTrack('02.mp3', '/Music/', { trackNumber: '02' }),
                makeTrack('03.mp3', '/Music/', { trackNumber: '03' }),
            ]);
        });

        it('numbers selected tracks starting from the given number', () => {
            service.updateSelectedTracks([0, 1, 2]);
            service.renumberTracks(1);
            const values = service.getCurrentMetadata().trackNumber!.values;
            expect(values[0]).toBe('01');
            expect(values[1]).toBe('02');
            expect(values[2]).toBe('03');
        });

        it('pads track numbers to two digits', () => {
            service.updateSelectedTracks([0]);
            service.renumberTracks(5);
            expect(service.getCurrentMetadata().trackNumber!.values[0]).toBe('05');
        });

        it('only renumbers selected tracks', () => {
            service.updateSelectedTracks([0, 2]);
            service.renumberTracks(10);
            const values = service.getCurrentMetadata().trackNumber!.values;
            expect(values[0]).toBe('10');
            expect(values[1]).toBe('02'); // unselected, unchanged
            expect(values[2]).toBe('11');
        });

        it('calls markDirty', () => {
            service.updateSelectedTracks([0]);
            service.renumberTracks(1);
            expect(mockValuesWrittenService.markDirty).toHaveBeenCalled();
        });
    });

    // ── getNewFolderName ─────────────────────────────────────────────────────

    describe('getNewFolderName()', () => {
        it('returns undefined when config is not yet loaded', () => {
            configSubject.next({} as ConfigSettingsObject);
            expect(service.getNewFolderName()).toBeUndefined();
        });

        it('builds folder name from artist, year, and album', () => {
            const m: MetadataObj = {
                artist: makeProp(['The Beatles']),
                album: makeProp(['Abbey Road'], true),
                date: makeProp(['1969'], true),
            };
            service.setMetadata(m);
            expect(service.getNewFolderName()).toBe('The Beatles - 1969 - Abbey Road');
        });

        it('prefers artistSortOrder over artist', () => {
            const m: MetadataObj = {
                artist: makeProp(['The Beatles']),
                artistSortOrder: makeProp(['Beatles, The'], true),
                album: makeProp(['Abbey Road'], true),
                date: makeProp(['1969'], true),
            };
            service.setMetadata(m);
            expect(service.getNewFolderName()).toContain('Beatles, The');
        });

        it('omits year segment when no date metadata exists', () => {
            const m: MetadataObj = {
                artist: makeProp(['The Beatles']),
                album: makeProp(['Abbey Road'], true),
            };
            service.setMetadata(m);
            expect(service.getNewFolderName()).toBe('The Beatles - Abbey Road');
        });

        it('appends edition in brackets when present', () => {
            const m: MetadataObj = {
                artist: makeProp(['The Beatles']),
                album: makeProp(['Abbey Road'], true),
                date: makeProp(['1969'], true),
                EDITION: makeProp(['Remastered'], true),
            };
            service.setMetadata(m);
            expect(service.getNewFolderName()).toBe('The Beatles - 1969 - Abbey Road [Remastered]');
        });

        it('replaces forbidden characters using config replacementFileNameChars', () => {
            const m: MetadataObj = {
                artist: makeProp(['Artist: Name']),
                album: makeProp(['Album/Title'], true),
                date: makeProp(['2000'], true),
            };
            service.setMetadata(m);
            const result = service.getNewFolderName();
            expect(result).not.toContain(':');
            expect(result).not.toContain('/');
        });
    });
});
