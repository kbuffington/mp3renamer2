import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataHandlerComponent } from '../metadata-handler/metadata-handler.component';

describe('MetadataHandlerComponent', () => {
	let component: MetadataHandlerComponent;
	let fixture: ComponentFixture<MetadataHandlerComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ MetadataHandlerComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MetadataHandlerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
