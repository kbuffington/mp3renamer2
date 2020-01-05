import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { NgxElectronModule } from 'ngx-electron';

/* Components */
import { AppComponent } from './app.component';
import { UnknownPropertiesComponent } from './components/unknown-properties/unknown-properties.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { EditableCellComponent } from './editable-cell/editable-cell.component';
import { InputFieldComponent } from './input-field/input-field.component';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { MetadataHandlerComponent } from './metadata-handler/metadata-handler.component';
import { RenamerGridComponent } from './renamer-grid/renamer-grid.component';
import { RightPanelComponent } from './right-panel/right-panel.component';

/* Services */
import { MusicbrainzService } from './services/musicbrainz.service';
import { TrackService } from './services/track.service';
import { UpperButtonBarComponent } from './upper-button-bar/upper-button-bar.component';

@NgModule({
	declarations: [
		AppComponent,
		RenamerGridComponent,
		AutoFocusDirective,
		MetadataHandlerComponent,
		EditableCellComponent,
		LeftPanelComponent,
		InputFieldComponent,
		RightPanelComponent,
		UnknownPropertiesComponent,
		UpperButtonBarComponent,
	],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		ClarityModule,
		FormsModule,
		HttpClientModule,
		NgxElectronModule,
	],
	providers: [
		MusicbrainzService,
		TrackService,
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
