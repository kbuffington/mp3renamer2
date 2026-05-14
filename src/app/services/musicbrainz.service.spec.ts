import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MusicbrainzService } from './musicbrainz.service';

const MB_BASE = 'https://musicbrainz.org/ws/2/';

function makeAreaJson(opts: { id?: string; name?: string; type?: string; relationList?: any[] }) {
    const json: any = {
        id: opts.id ?? 'area-id',
        name: opts.name ?? 'Some Area',
        type: opts.type ?? 'Country',
    };
    if (opts.relationList !== undefined) {
        json['relation-list'] = opts.relationList;
    }
    return json;
}

describe('MusicbrainzService', () => {
    let service: MusicbrainzService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MusicbrainzService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(MusicbrainzService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    // ── searchReleases ──────────────────────────────────────────────────────

    describe('searchReleases()', () => {
        it('uses release-group URI when releaseGroup param is provided', async () => {
            const rgId = 'ffb094d1-1a16-4348-a8dd-beb69cbd9a66';
            const p = service.searchReleases({ releaseGroup: rgId });
            const req = httpMock.expectOne(r => r.url.includes(`release-group=${rgId}`));
            expect(req.request.url).toContain(`${MB_BASE}release?release-group=${rgId}`);
            req.flush({ releases: [] });
            await p;
        });

        it('builds a fuzzy query for a single field by default', async () => {
            const p = service.searchReleases({ artist: 'Beatles' });
            const req = httpMock.expectOne(r => r.url.includes('query='));
            expect(req.request.url).toContain('artist:(Beatles*)');
            req.flush({});
            await p;
        });

        it('builds a non-fuzzy query when fuzzy=false', async () => {
            const p = service.searchReleases({ artist: 'Beatles' }, false);
            const req = httpMock.expectOne(r => r.url.includes('query='));
            expect(req.request.url).toContain('artist:Beatles');
            expect(req.request.url).not.toContain('(Beatles');
            req.flush({});
            await p;
        });

        it('forces non-fuzzy when a date field is present', async () => {
            const p = service.searchReleases({ date: '1969' }, true);
            const req = httpMock.expectOne(r => r.url.includes('query='));
            expect(req.request.url).toContain('date:1969');
            expect(req.request.url).not.toContain('(1969');
            req.flush({});
            await p;
        });

        it('AND-joins multiple non-empty fields', async () => {
            const p = service.searchReleases({ artist: 'Beatles', release: 'Abbey Road' });
            const req = httpMock.expectOne(r => r.url.includes('query='));
            expect(req.request.url).toContain('artist:');
            expect(req.request.url).toContain(' AND ');
            expect(req.request.url).toContain('release:');
            req.flush({});
            await p;
        });

        it('skips fields with empty values', async () => {
            const p = service.searchReleases({ artist: 'Beatles', release: '' });
            const req = httpMock.expectOne(r => r.url.includes('query='));
            expect(req.request.url).not.toContain('release:');
            expect(req.request.url).not.toContain('AND');
            req.flush({});
            await p;
        });

        it('URL-encodes values that contain spaces', async () => {
            const p = service.searchReleases({ release: 'Abbey Road' });
            const req = httpMock.expectOne(r => r.url.includes('query='));
            expect(req.request.url).toContain('Abbey%20Road');
            req.flush({});
            await p;
        });
    });

    // ── getReleaseInfo ──────────────────────────────────────────────────────

    describe('getReleaseInfo()', () => {
        it('builds URI with release MBID and all standard includes', done => {
            const mbid = 'abc-123';
            service.getReleaseInfo(mbid).subscribe(() => done());
            const req = httpMock.expectOne(r => r.url.includes(`release/${mbid}`));
            expect(req.request.url).toBe(
                `${MB_BASE}release/${mbid}?inc=artist-credits+labels+discids+recordings+release-groups+recording-level-rels+work-rels+work-level-rels`,
            );
            req.flush({});
        });
    });

    // ── getArtists ──────────────────────────────────────────────────────────

    describe('getArtists()', () => {
        it('builds a query for a single artist MBID', async () => {
            const mbid = 'artist-mbid-1';
            const p = service.getArtists([mbid]);
            const req = httpMock.expectOne(r => r.url.includes('artist'));
            expect(req.request.url).toBe(`${MB_BASE}artist/?query=arid:${mbid}`);
            req.flush({});
            await p;
        });

        it('OR-joins multiple artist MBIDs', async () => {
            const p = service.getArtists(['mbid-1', 'mbid-2']);
            const req = httpMock.expectOne(r => r.url.includes('artist'));
            expect(req.request.url).toContain('arid:mbid-1 OR arid:mbid-2');
            req.flush({});
            await p;
        });

        it('trims whitespace from MBIDs', async () => {
            const p = service.getArtists([' mbid-1 ']);
            const req = httpMock.expectOne(r => r.url.includes('artist'));
            expect(req.request.url).toContain('arid:mbid-1');
            expect(req.request.url).not.toMatch(/arid:\s/);
            req.flush({});
            await p;
        });
    });

    // ── getArea ─────────────────────────────────────────────────────────────

    describe('getArea()', () => {
        it('requests area by MBID', async () => {
            const mbid = 'area-mbid-1';
            const p = service.getArea(mbid);
            const req = httpMock.expectOne(r => r.url.includes('area'));
            expect(req.request.url).toBe(`${MB_BASE}area/?query=aid:${mbid}`);
            req.flush({ areas: [] });
            await p;
        });
    });

    // ── getWork ─────────────────────────────────────────────────────────────

    describe('getWork()', () => {
        it('requests work by ID with recording-rels, artist-credits, and work-rels includes', async () => {
            const workId = 'work-id-1';
            const p = service.getWork(workId);
            const req = httpMock.expectOne(r => r.url.includes(`work/${workId}`));
            expect(req.request.url).toBe(
                `${MB_BASE}work/${workId}?inc=recording-rels+artist-credits+work-rels`,
            );
            req.flush({});
            await p;
        });
    });

    // ── getWorks ─────────────────────────────────────────────────────────────

    describe('getWorks()', () => {
        it('returns an empty array for an empty work ID list', async () => {
            const results = await service.getWorks([]);
            expect(results).toEqual([]);
        });

        it('fires one request per work ID and returns all results', async () => {
            const p = service.getWorks(['work-1', 'work-2']);
            const reqs = httpMock.match(r => r.url.includes('/work/'));
            expect(reqs.length).toBe(2);
            reqs.find(r => r.request.url.includes('work-1'))!.flush({ id: 'work-1' });
            reqs.find(r => r.request.url.includes('work-2'))!.flush({ id: 'work-2' });
            const results = await p;
            expect(results.length).toBe(2);
        });
    });

    // ── getCountry ───────────────────────────────────────────────────────────

    describe('getCountry()', () => {
        it('returns the area name when the area type is Country', async () => {
            const p = service.getCountry('country-id');
            const req = httpMock.expectOne(r => r.url.includes('aid:country-id'));
            req.flush({
                areas: [makeAreaJson({ id: 'country-id', name: 'United States', type: 'Country' })],
            });
            expect(await p).toBe('United States');
        });

        it('returns empty string when the area has no relation-list', async () => {
            const p = service.getCountry('area-id');
            const req = httpMock.expectOne(r => r.url.includes('aid:area-id'));
            req.flush({
                areas: [makeAreaJson({ id: 'area-id', name: 'Region X', type: 'Region' })],
            });
            expect(await p).toBe('');
        });

        it('returns empty string when the area has an empty relation-list', async () => {
            const p = service.getCountry('area-id');
            const req = httpMock.expectOne(r => r.url.includes('aid:area-id'));
            req.flush({
                areas: [
                    makeAreaJson({
                        id: 'area-id',
                        name: 'Region X',
                        type: 'Region',
                        relationList: [],
                    }),
                ],
            });
            expect(await p).toBe('');
        });

        it('returns empty string when the area has only forward relations', async () => {
            const p = service.getCountry('area-id');
            const req = httpMock.expectOne(r => r.url.includes('aid:area-id'));
            req.flush({
                areas: [
                    makeAreaJson({
                        id: 'area-id',
                        name: 'Subdivision',
                        type: 'Subdivision',
                        relationList: [
                            {
                                relations: [
                                    {
                                        direction: 'forward',
                                        type: 'part of',
                                        area: makeAreaJson({
                                            id: 'parent-id',
                                            name: 'Parent',
                                            type: 'Country',
                                        }),
                                    },
                                ],
                            },
                        ],
                    }),
                ],
            });
            expect(await p).toBe('');
        });

        it('recurses through a backward relation to find the parent country', async () => {
            const p = service.getCountry('city-id');

            const req1 = httpMock.expectOne(r => r.url.includes('aid:city-id'));
            req1.flush({
                areas: [
                    makeAreaJson({
                        id: 'city-id',
                        name: 'New York City',
                        type: 'City',
                        relationList: [
                            {
                                relations: [
                                    {
                                        direction: 'backward',
                                        type: 'part of',
                                        area: makeAreaJson({
                                            id: 'country-id',
                                            name: 'United States',
                                            type: 'Country',
                                        }),
                                    },
                                ],
                            },
                        ],
                    }),
                ],
            });

            // Allow the awaited getArea promise to resolve so the recursive call fires
            await Promise.resolve();

            const req2 = httpMock.expectOne(r => r.url.includes('aid:country-id'));
            req2.flush({
                areas: [makeAreaJson({ id: 'country-id', name: 'United States', type: 'Country' })],
            });

            expect(await p).toBe('United States');
        });
    });
});
