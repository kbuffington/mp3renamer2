import { inject, TestBed } from '@angular/core/testing';
import { TitleCaseService } from './title-case.service';

describe('TitleCaseService', () => {
    let tc: TitleCaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TitleCaseService],
        });
    });

    beforeEach(() => {
        tc = new TitleCaseService();
    });

    it('should title case correctly', () => {
        expect(tc.titleCaseString('the first of the month')).toEqual('The First of the Month');
        expect(tc.titleCaseString('the the the the the')).toEqual('The the the the The');
        expect(tc.titleCaseString('The The The The The')).toEqual('The the the the The');
        expect(tc.titleCaseString('the the the the the!')).toEqual('The the the the The!');
        expect(tc.titleCaseString('the the the (the the the)!')).toEqual(
            'The the The (The the The)!',
        );
        expect(tc.titleCaseString('(Do The Thing) that you do (so well)!!')).toEqual(
            '(Do the Thing) That You Do (So Well)!!',
        );
    });

    it('should handle acronyms correctly', () => {
        expect(tc.titleCaseString('You Are doa')).toEqual('You Are DOA');
        expect(tc.titleCaseString('lol wtf')).toEqual('LOL WTF');
    });

    it('should fix words that should be lowercase', () => {
        expect(tc.titleCaseString('Kevin Feat. Larry')).toEqual('Kevin feat. Larry');
        expect(tc.titleCaseString('Rihanna X Fenty')).toEqual('Rihanna x Fenty');
    });
});
