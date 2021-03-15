import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GetMetadataComponent } from './get-metadata.component';

describe('GetMetadataComponent', () => {
	let component: GetMetadataComponent;
	let fixture: ComponentFixture<GetMetadataComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [GetMetadataComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GetMetadataComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
