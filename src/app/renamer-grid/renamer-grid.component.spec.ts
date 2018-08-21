import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenamerGridComponent } from './renamer-grid.component';

describe('RenamerGridComponent', () => {
	let component: RenamerGridComponent;
	let fixture: ComponentFixture<RenamerGridComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ RenamerGridComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RenamerGridComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
