import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlHandlerComponent } from './xml-handler.component';

describe('XmlHandlerComponent', () => {
	let component: XmlHandlerComponent;
	let fixture: ComponentFixture<XmlHandlerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ XmlHandlerComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(XmlHandlerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
