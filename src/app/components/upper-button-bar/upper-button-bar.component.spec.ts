import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { UpperButtonBarComponent } from './upper-button-bar.component';

describe('UpperButtonBarComponent', () => {
    let component: UpperButtonBarComponent;
    let fixture: ComponentFixture<UpperButtonBarComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [UpperButtonBarComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UpperButtonBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
