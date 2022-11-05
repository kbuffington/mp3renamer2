import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';

import { RenamerGridComponent } from './renamer-grid.component';

describe('RenamerGridComponent', () => {
    let component: RenamerGridComponent;
    let fixture: ComponentFixture<RenamerGridComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ClarityModule],
            declarations: [RenamerGridComponent],
        }).compileComponents();
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
