import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestFilesComponent } from './request-files.component';

describe('RequestFilesComponent', () => {
	let component: RequestFilesComponent;
	let fixture: ComponentFixture<RequestFilesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ RequestFilesComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RequestFilesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
