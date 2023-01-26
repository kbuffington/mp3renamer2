import { ConfigService } from './config.service';
import { ElectronService } from './electron.service';
import { TitleCaseService } from './title-case.service';
import { TitleFormatService } from './title-format.service';
import { TrackService } from './track.service';
import { TrackServiceMocks } from './track.service.mock';

describe('TitleFormatService', () => {
    let service: TitleFormatService;
    let trackService: TrackService;
    let titleCaseService: TitleCaseService;
    let configService: ConfigService;
    let electronService: ElectronService;

    beforeAll(() => {
        electronService = new ElectronService();
        titleCaseService = new TitleCaseService();
        configService = new ConfigService(electronService);
        trackService = new TrackService(electronService, titleCaseService, configService);
    });

    beforeEach(() => {
        trackService.setTracks(TrackServiceMocks.mockTracks());
        service = new TitleFormatService(trackService);
    });

    it('eval properly substitutes params', () => {
        expect(service.eval('%title%', 0)).toBe('For Those About To Rock (We Salute You)');
        expect(service.eval('%tracknumber%', 0)).toBe('01');
        expect(service.eval('%track number%', 0)).toBe('1');
        expect(service.eval('%tracknumber%', 1)).toBe('02');
        expect(service.eval('%artist%', 1)).toBe('AC/DC');
    });

    it('eval with complex nested functions', () => {
        // expect(service.eval('$ifequal(1,%tracknumber%,20,ignored)', 0)).toBe('20');
        expect(service.eval(
            '%artist% $ifgreater($ifequal(1,%tracknumber%,20,ignored),%track number%,$lower(%artist%),%artist) %album%', 0))
            .toBe('AC/DC ac/dc For Those About to Rock (We Salute You)');
        expect(service.eval('%tracknumber%', 0)).toBe('01');
    });

    it('%album artist%', () => {
        expect(service.eval('%album artist%', 0)).toBe('AC/DC');
        expect(service.eval('%album artist%', 1)).toBe('Various Artists');

        const mockTrackWithoutAlbumArtist = TrackServiceMocks.mockTrack({ composer: 'Beethoven' });
        trackService.setTracks([mockTrackWithoutAlbumArtist]);

        expect(service.eval('%album artist%', 0)).toBe('AC/DC');

        delete mockTrackWithoutAlbumArtist.artist;
        trackService.setTracks([mockTrackWithoutAlbumArtist]);

        expect(service.eval('%album artist%', 0)).toBe('Beethoven');
    });

    it('$if()', () => {
        expect(service.eval('$if(a,true,false)')).toBe('true');
        expect(service.eval('$if(1,true,false)')).toBe('true');
        expect(service.eval('$if(%artist%,true,false)')).toBe('true');

        expect(service.eval('$if(0,true,false)')).toBe('false');
        expect(service.eval('$if(,true,false)')).toBe('false');
        expect(service.eval('$if(?,true,false)')).toBe('false');
        expect(service.eval('$if(    ,true,false)')).toBe('false');
    });

    it('$ifequal()', () => {
        expect(service.eval('$ifequal(0,0,true,false)')).toBe('true');
        expect(service.eval('$ifequal(1,01,true,false)')).toBe('true');
        expect(service.eval('$ifequal(10,10,true,false)')).toBe('true');
        expect(service.eval('$ifequal(10, 10,true,false)')).toBe('true');
        expect(service.eval('$ifequal(%tracknumber%,1,true,false)')).toBe('true');
        expect(service.eval('$ifequal(10,100,true,false)')).toBe('false');
        expect(service.eval('$ifequal(%tracknumber%,%discnumber%,true,false)')).toBe('false');
    });

    it('$ifgreater()', () => {
        expect(service.eval('$ifgreater(1,0,true,false)')).toBe('true');
        expect(service.eval('$ifgreater(%tracknumber%,0,true,false)')).toBe('true');

        expect(service.eval('$ifgreater(10,100,true,false)')).toBe('false');
        expect(service.eval('$ifgreater(%tracknumber%,2,true,false)')).toBe('false');
    });

    it('$iflonger()', () => {
        expect(service.eval('$iflonger(short,really long,true,false)')).toBe('false');
        expect(service.eval('$iflonger(short,short,true,false)')).toBe('false');
        expect(service.eval('$iflonger(,short,true,false)')).toBe('false');

        expect(service.eval('$iflonger(short,long,true,false)')).toBe('true');
        expect(service.eval('$iflonger(short,,true,false)')).toBe('true');
    });

    it('$year()', () => {
        expect(service.eval('$year(2023)')).toBe('2023');
        expect(service.eval('$year(2023-01)')).toBe('2023');
        expect(service.eval('$year(2023-01-23)')).toBe('2023');
        expect(service.eval('$year(%date%)')).toBe('1983');

        expect(service.eval('$year(a)')).toBe('?');
        expect(service.eval('$year()')).toBe('?');
    });

    it('$roman()', () => {
        expect(service.eval('$roman(1)')).toBe('I');
        expect(service.eval('$roman(3)')).toBe('III');
        expect(service.eval('$roman(4)')).toBe('IIII');
        expect(service.eval('$roman(5)')).toBe('V');
        expect(service.eval('$roman(9)')).toBe('VIIII');
        expect(service.eval('$roman(18)')).toBe('XVIII');
        expect(service.eval('$roman( 4 )')).toBe('IIII');

        let mockTrack = TrackServiceMocks.mockTrack({ trackNumber: '9' });
        trackService.setTracks([mockTrack]);

        expect(service.eval('$roman(%tracknumber%)')).toBe('VIIII');

        mockTrack = TrackServiceMocks.mockTrack({ trackNumber: '09' });
        trackService.setTracks([mockTrack]);

        expect(service.eval('$roman(%tracknumber%)')).toBe('VIIII');

        delete mockTrack.trackNumber;
        trackService.setTracks([mockTrack]);

        expect(service.eval('$roman(%tracknumber%)')).toBe('');
    });

    it('$upper()', () => {
        const mockTrack = TrackServiceMocks.mockTrack({ artist: 'Mr. Big1!' });
        trackService.setTracks([mockTrack]);

        expect(service.eval('$upper(%artist%)')).toBe('MR. BIG1!');
    });

    it('$lower()', () => {
        const mockTrack = TrackServiceMocks.mockTrack({ artist: 'Mr. Big1!' });
        trackService.setTracks([mockTrack]);

        expect(service.eval('$lower(%artist%)')).toBe('mr. big1!');
    });
});
