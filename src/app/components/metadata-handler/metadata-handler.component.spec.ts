import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MetadataHandlerComponent } from './metadata-handler.component';
import { TrackService } from '@services/track.service';
import { ValuesWrittenService } from '@services/values-written.service';
import { MetadataObj, MetadataProperty } from '@classes/track.classes';

function makeProp(defaultVal: string, different = false): MetadataProperty {
    const p = new MetadataProperty();
    p.default = defaultVal;
    p.different = different;
    return p;
}

function makeMetadata(overrides: Partial<MetadataObj> = {}): MetadataObj {
    return {
        albumSortOrder: makeProp(''),
        date: makeProp(''),
        originalReleaseDate: makeProp(''),
        ...overrides,
    };
}

describe('MetadataHandlerComponent', () => {
    let component: MetadataHandlerComponent;
    let fixture: ComponentFixture<MetadataHandlerComponent>;
    let metadataSubject: BehaviorSubject<MetadataObj>;
    let valuesWrittenSubject: BehaviorSubject<boolean>;
    let mockTrackService: jasmine.SpyObj<TrackService>;
    let mockValuesWrittenService: jasmine.SpyObj<ValuesWrittenService>;

    beforeEach(waitForAsync(() => {
        metadataSubject = new BehaviorSubject<MetadataObj>({});
        valuesWrittenSubject = new BehaviorSubject<boolean>(true);

        mockTrackService = jasmine.createSpyObj('TrackService', [
            'getMetadata',
            'resetTrackData',
            'getCurrentMetadata',
            'setMetadata',
            'setTagData',
        ]);
        mockTrackService.getMetadata.and.returnValue(metadataSubject.asObservable());

        mockValuesWrittenService = jasmine.createSpyObj('ValuesWrittenService', ['get']);
        mockValuesWrittenService.get.and.returnValue(valuesWrittenSubject.asObservable());

        TestBed.configureTestingModule({
            imports: [RouterLink],
            declarations: [MetadataHandlerComponent],
            providers: [
                provideRouter([]),
                { provide: TrackService, useValue: mockTrackService },
                { provide: ValuesWrittenService, useValue: mockValuesWrittenService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MetadataHandlerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // ── ngOnInit subscriptions ──────────────────────────────────────────────

    describe('ngOnInit()', () => {
        it('initializes valuesWritten as true from the BehaviorSubject', () => {
            expect(component.valuesWritten).toBeTrue();
        });

        it('updates metadata when TrackService emits a new value', () => {
            const m = makeMetadata({ date: makeProp('2020') });
            metadataSubject.next(m);
            expect(component.metadata).toBe(m);
        });

        it('updates valuesWritten when ValuesWrittenService emits false', () => {
            valuesWrittenSubject.next(false);
            expect(component.valuesWritten).toBeFalse();
        });

        it('updates valuesWritten back to true when ValuesWrittenService emits true', () => {
            valuesWrittenSubject.next(false);
            valuesWrittenSubject.next(true);
            expect(component.valuesWritten).toBeTrue();
        });
    });

    // ── ngOnDestroy ─────────────────────────────────────────────────────────

    describe('ngOnDestroy()', () => {
        it('stops updating metadata after destroy', () => {
            component.ngOnDestroy();
            const m = makeMetadata({ date: makeProp('2020') });
            metadataSubject.next(m);
            expect(component.metadata).not.toBe(m);
        });

        it('stops updating valuesWritten after destroy', () => {
            component.ngOnDestroy();
            valuesWrittenSubject.next(false);
            expect(component.valuesWritten).toBeTrue();
        });
    });

    // ── resetTags ───────────────────────────────────────────────────────────

    describe('resetTags()', () => {
        it('delegates to TrackService.resetTrackData()', () => {
            component.resetTags();
            expect(mockTrackService.resetTrackData).toHaveBeenCalled();
        });
    });

    // ── setTags ─────────────────────────────────────────────────────────────

    describe('setTags()', () => {
        it('calls setTagData() after 100ms', fakeAsync(() => {
            mockTrackService.getCurrentMetadata.and.returnValue(makeMetadata());
            component.setTags();
            expect(mockTrackService.setTagData).not.toHaveBeenCalled();
            tick(100);
            expect(mockTrackService.setTagData).toHaveBeenCalled();
        }));

        it('uses originalReleaseDate as val when it is >= 4 chars', fakeAsync(() => {
            const metadata = makeMetadata({
                albumSortOrder: makeProp('Short'),
                date: makeProp('2000'),
                originalReleaseDate: makeProp('1990'),
            });
            mockTrackService.getCurrentMetadata.and.returnValue(metadata);
            component.setTags();
            tick(100);
            expect(metadata.albumSortOrder!.default).toBe('1990');
        }));

        it('falls back to date when originalReleaseDate is fewer than 4 chars', fakeAsync(() => {
            const metadata = makeMetadata({
                albumSortOrder: makeProp('Short'),
                date: makeProp('2000'),
                originalReleaseDate: makeProp('199'),
            });
            mockTrackService.getCurrentMetadata.and.returnValue(metadata);
            component.setTags();
            tick(100);
            expect(metadata.albumSortOrder!.default).toBe('2000');
        }));

        it('sets albumSortOrder.default and clears different flag when sortOrder <= 7 chars and val >= 4 chars', fakeAsync(() => {
            const metadata = makeMetadata({
                albumSortOrder: makeProp('Short', true),
                date: makeProp('2000'),
                originalReleaseDate: makeProp('1990'),
            });
            mockTrackService.getCurrentMetadata.and.returnValue(metadata);
            component.setTags();
            tick(100);
            expect(metadata.albumSortOrder!.default).toBe('1990');
            expect(metadata.albumSortOrder!.different).toBeFalse();
            expect(mockTrackService.setMetadata).toHaveBeenCalledWith(metadata);
        }));

        it('skips albumSortOrder update when sortOrder is longer than 7 chars', fakeAsync(() => {
            const metadata = makeMetadata({
                albumSortOrder: makeProp('LongSortOrder'),
                date: makeProp('2000'),
                originalReleaseDate: makeProp('1990'),
            });
            mockTrackService.getCurrentMetadata.and.returnValue(metadata);
            component.setTags();
            tick(100);
            expect(metadata.albumSortOrder!.default).toBe('LongSortOrder');
            expect(mockTrackService.setMetadata).not.toHaveBeenCalled();
        }));

        it('skips albumSortOrder update when val is fewer than 4 chars', fakeAsync(() => {
            const metadata = makeMetadata({
                albumSortOrder: makeProp('Short'),
                date: makeProp('200'),
                originalReleaseDate: makeProp('199'),
            });
            mockTrackService.getCurrentMetadata.and.returnValue(metadata);
            component.setTags();
            tick(100);
            expect(metadata.albumSortOrder!.default).toBe('Short');
            expect(mockTrackService.setMetadata).not.toHaveBeenCalled();
        }));
    });

    // ── template ─────────────────────────────────────────────────────────────

    describe('Set Tags button styling', () => {
        it('has btn-primary class when values are dirty (not written)', () => {
            valuesWrittenSubject.next(false);
            fixture.detectChanges();
            const btn: HTMLElement = fixture.nativeElement.querySelector('.set-tags');
            expect(btn.classList).toContain('btn-primary');
            expect(btn.classList).not.toContain('btn-outline');
        });

        it('has btn-outline class when values are clean (written)', () => {
            valuesWrittenSubject.next(true);
            fixture.detectChanges();
            const btn: HTMLElement = fixture.nativeElement.querySelector('.set-tags');
            expect(btn.classList).toContain('btn-outline');
            expect(btn.classList).not.toContain('btn-primary');
        });
    });
});
