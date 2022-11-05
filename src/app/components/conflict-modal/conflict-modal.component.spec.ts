import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MetadataObj, MetadataProperty } from '@classes/track.classes';
import { ClarityModule } from '@clr/angular';

import { ConflictModalComponent } from './conflict-modal.component';

describe('ConflictModalComponent', () => {
    let component: ConflictModalComponent;
    let fixture: ComponentFixture<ConflictModalComponent>;
    const metadata = new MetadataObj();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClarityModule, FormsModule],
            declarations: [ConflictModalComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConflictModalComponent);
        component = fixture.componentInstance;

        component.field = new MetadataProperty(metadata);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
