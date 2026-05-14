import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { UpperButtonBarComponent } from './upper-button-bar.component';
import { ElectronService } from '@services/electron.service';
import { ConfigService, ConfigSettingsObject } from '@services/config.service';
import { TrackService } from '@services/track.service';
import { TitleCaseService } from '@services/title-case.service';
import { ValuesWrittenService } from '@services/values-written.service';
import { MetadataObj, MetadataProperty, Track } from '@classes/track.classes';

function makeMetadataProp(values: string[]): MetadataProperty {
    const p = new MetadataProperty();
    p.values = values;
    p.default = values[0] ?? '';
    return p;
}

function makeMetadata(titleValues: string[], albumDefault = ''): MetadataObj {
    const m: MetadataObj = {};
    m.title = makeMetadataProp(titleValues);
    m.album = makeMetadataProp([albumDefault]);
    return m;
}

describe('UpperButtonBarComponent', () => {
    let component: UpperButtonBarComponent;
    let fixture: ComponentFixture<UpperButtonBarComponent>;

    let trackSubject: BehaviorSubject<Track[]>;
    let metadataSubject: BehaviorSubject<MetadataObj>;
    let valuesWrittenSubject: BehaviorSubject<boolean>;

    let mockTrackService: jasmine.SpyObj<TrackService>;
    let mockElectronService: any;
    let mockConfigService: jasmine.SpyObj<ConfigService>;
    let mockValuesWrittenService: jasmine.SpyObj<ValuesWrittenService>;

    beforeEach(waitForAsync(() => {
        trackSubject = new BehaviorSubject<Track[]>([]);
        metadataSubject = new BehaviorSubject<MetadataObj>({});
        valuesWrittenSubject = new BehaviorSubject<boolean>(true);

        mockTrackService = jasmine.createSpyObj('TrackService', [
            'getTracks',
            'getMetadata',
            'getCurrentTracks',
            'fixCapitalization',
            'guessTitles',
            'renumberTracks',
        ]);
        mockTrackService.getTracks.and.returnValue(trackSubject.asObservable());
        mockTrackService.getMetadata.and.returnValue(metadataSubject.asObservable());
        mockTrackService.getCurrentTracks.and.returnValue([]);
        (mockTrackService as any).pathDelimiter = '\\';

        mockElectronService = {
            isElectron: true,
            remote: {
                dialog: {
                    showMessageBoxSync: jasmine.createSpy('showMessageBoxSync').and.returnValue(0),
                },
            },
            main: {
                getFiles: jasmine.createSpy('getFiles'),
                loadFiles: jasmine.createSpy('loadFiles'),
            },
        };

        mockConfigService = jasmine.createSpyObj('ConfigService', ['getCurrentConfig']);
        mockConfigService.getCurrentConfig.and.returnValue({
            homeDir: 'C:\\Music',
        } as ConfigSettingsObject);

        mockValuesWrittenService = jasmine.createSpyObj('ValuesWrittenService', ['get']);
        mockValuesWrittenService.get.and.returnValue(valuesWrittenSubject.asObservable());

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [UpperButtonBarComponent],
            providers: [
                { provide: TrackService, useValue: mockTrackService },
                { provide: ElectronService, useValue: mockElectronService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: TitleCaseService, useClass: TitleCaseService },
                { provide: ValuesWrittenService, useValue: mockValuesWrittenService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UpperButtonBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('filesLoaded', () => {
        it('is false when no tracks are loaded', () => {
            expect(component.filesLoaded).toBeFalse();
        });

        it('is true when tracks are emitted', () => {
            trackSubject.next([{ meta: { filename: 'a.mp3', folder: 'C:\\' } } as Track]);
            expect(component.filesLoaded).toBeTrue();
        });

        it('goes back to false when tracks are cleared', () => {
            trackSubject.next([{ meta: { filename: 'a.mp3', folder: 'C:\\' } } as Track]);
            trackSubject.next([]);
            expect(component.filesLoaded).toBeFalse();
        });
    });

    describe('capitalizationBad', () => {
        it('is false when metadata is empty', () => {
            expect(component.capitalizationBad).toBeFalse();
        });

        it('is false when titles have correct capitalization', () => {
            metadataSubject.next(makeMetadata(['The First of the Month']));
            expect(component.capitalizationBad).toBeFalse();
        });

        it('is true when a title has a word that should be lowercase', () => {
            metadataSubject.next(makeMetadata(['The First Of the Month']));
            expect(component.capitalizationBad).toBeTrue();
        });

        it('is true when the album name has a word that should be lowercase', () => {
            metadataSubject.next(makeMetadata(['Good Title'], 'Songs Of the Summer'));
            expect(component.capitalizationBad).toBeTrue();
        });

        it('is false when both title and album are correctly cased', () => {
            metadataSubject.next(makeMetadata(['Songs of the Summer'], 'Songs of the Summer'));
            expect(component.capitalizationBad).toBeFalse();
        });
    });

    describe('requestFiles()', () => {
        it('calls getFiles with homeDir when no files are loaded', () => {
            component.requestFiles();
            expect(mockElectronService.main.getFiles).toHaveBeenCalledWith('C:\\Music');
        });

        it('does not show confirmation dialog when values are written (clean state)', () => {
            trackSubject.next([
                { meta: { filename: 'a.mp3', folder: 'C:\\Music\\Album\\' } } as Track,
            ]);
            mockTrackService.getCurrentTracks.and.returnValue([
                { meta: { filename: 'a.mp3', folder: 'C:\\Music\\Album\\' } } as Track,
            ]);
            valuesWrittenSubject.next(true);

            component.requestFiles();

            expect(mockElectronService.remote.dialog.showMessageBoxSync).not.toHaveBeenCalled();
            expect(mockElectronService.main.getFiles).toHaveBeenCalled();
        });

        it('shows confirmation dialog when files are loaded and values are dirty', () => {
            trackSubject.next([
                { meta: { filename: 'a.mp3', folder: 'C:\\Music\\Album\\' } } as Track,
            ]);
            valuesWrittenSubject.next(false);

            component.requestFiles();

            expect(mockElectronService.remote.dialog.showMessageBoxSync).toHaveBeenCalled();
        });

        it('proceeds when user confirms the discard dialog', () => {
            trackSubject.next([
                { meta: { filename: 'a.mp3', folder: 'C:\\Music\\Album\\' } } as Track,
            ]);
            mockTrackService.getCurrentTracks.and.returnValue([
                { meta: { filename: 'a.mp3', folder: 'C:\\Music\\Album\\' } } as Track,
            ]);
            valuesWrittenSubject.next(false);
            mockElectronService.remote.dialog.showMessageBoxSync.and.returnValue(0);

            component.requestFiles();

            expect(mockElectronService.main.getFiles).toHaveBeenCalled();
        });

        it('aborts when user cancels the discard dialog', () => {
            trackSubject.next([{ meta: { filename: 'a.mp3', folder: 'C:\\' } } as Track]);
            valuesWrittenSubject.next(false);
            mockElectronService.remote.dialog.showMessageBoxSync.and.returnValue(1);

            component.requestFiles();

            expect(mockElectronService.main.getFiles).not.toHaveBeenCalled();
        });
    });

    describe('inputClick()', () => {
        it('stops event propagation', () => {
            const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);
            component.inputClick(event);
            expect(event.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('delegation methods', () => {
        it('fixCapitalization() delegates to TrackService', () => {
            component.fixCapitalization();
            expect(mockTrackService.fixCapitalization).toHaveBeenCalled();
        });

        it('guessTitles() delegates to TrackService', () => {
            component.guessTitles();
            expect(mockTrackService.guessTitles).toHaveBeenCalled();
        });

        it('renumberTracks() passes startNumber to TrackService', () => {
            component.startNumber = 5;
            component.renumberTracks();
            expect(mockTrackService.renumberTracks).toHaveBeenCalledWith(5);
        });
    });
});
