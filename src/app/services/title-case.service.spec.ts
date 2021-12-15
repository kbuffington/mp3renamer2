import { inject, TestBed } from '@angular/core/testing';
import { TitleCaseService } from  './title-case.service';

describe('TitleCaseService', () => {
    let tcService: TitleCaseService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [TitleCaseService]
		});
	});

    beforeEach(() => {
        tcService = new TitleCaseService();
    });

	it('should be created', () => {
		expect(tcService).toBeTruthy();
	});

    it('should title case correctly', () => {
        expect(tcService.titleCaseString('the first of the month')).toEqual('The First of the Month');
        expect(tcService.titleCaseString('the the the the the')).toEqual('The the the the The');
        expect(tcService.titleCaseString('The The The The The')).toEqual('The the the the The');
        expect(tcService.titleCaseString('the the the the the!')).toEqual('The the the the The!');
        expect(tcService.titleCaseString('the the the (the the the)!')).toEqual('The the The (The the The)!');
        expect(tcService.titleCaseString('(Do The Thing) that you do (so well)!!!')).toEqual('(Do the Thing) That You Do (So Well)!!!');
    });
});