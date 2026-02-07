import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { MusicbrainzService } from './musicbrainz.service';

describe('MusicbrainzService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [MusicbrainzService, provideHttpClient(withInterceptorsFromDi())],
        });
    });

    it('should be created', inject([MusicbrainzService], (service: MusicbrainzService) => {
        expect(service).toBeTruthy();
    }));
});
