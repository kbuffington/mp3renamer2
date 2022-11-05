import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';
import { LeftPanelComponent } from '@components/left-panel/left-panel.component';
import { MetadataHandlerComponent } from '@components/metadata-handler/metadata-handler.component';
import { RenamerGridComponent } from '@components/renamer-grid/renamer-grid.component';
import { RightPanelComponent } from '@components/right-panel/right-panel.component';
import { UpperButtonBarComponent } from '@components/upper-button-bar/upper-button-bar.component';
import { InputFieldComponent } from 'app/input-field/input-field.component';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                ClarityModule,
                FormsModule,
                RouterTestingModule,
            ],
            declarations: [
                InputFieldComponent,
                LeftPanelComponent,
                MainComponent,
                MetadataHandlerComponent,
                RenamerGridComponent,
                RightPanelComponent,
                UpperButtonBarComponent,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
