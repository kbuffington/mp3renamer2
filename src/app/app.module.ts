import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { NgxElectronModule } from 'ngx-electron';
import { AppRoutingModule } from './app-routing.module';

/* Components */
import { GetMetadataComponent } from '@components/get-metadata/get-metadata.component';
import { MainComponent } from '@components/main/main.component';
import { UnknownPropertiesComponent } from '@components/unknown-properties/unknown-properties.component';
import { AutoFocusDirective } from '@directives/auto-focus.directive';
import { AppComponent } from './app.component';
import { EditableCellComponent } from './editable-cell/editable-cell.component';
import { InputFieldComponent } from './input-field/input-field.component';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { MetadataHandlerComponent } from './metadata-handler/metadata-handler.component';
import { RenamerGridComponent } from './renamer-grid/renamer-grid.component';
import { RightPanelComponent } from './right-panel/right-panel.component';
import { UpperButtonBarComponent } from './upper-button-bar/upper-button-bar.component';

/* Services */
import { MusicbrainzService } from '@services/musicbrainz.service';
import { TrackService } from '@services/track.service';
import { DontAllowOnReload } from './dont-allow-on-reload.guard';

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
		MainComponent,
		GetMetadataComponent,
	],
	imports: [
		AppRoutingModule,
		BrowserAnimationsModule,
		BrowserModule,
		ClarityModule,
		FormsModule,
		HttpClientModule,
		NgxElectronModule,
	],
	providers: [
		DontAllowOnReload,
		MusicbrainzService,
		TrackService,
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
