import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { NgxElectronModule } from 'ngx-electron';

/* Components */
import { AppComponent } from './app.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { EditableCellComponent } from './editable-cell/editable-cell.component';
import { InputFieldComponent } from './input-field/input-field.component';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { MetadataHandlerComponent } from './metadata-handler/metadata-handler.component';
import { RenamerGridComponent } from './renamer-grid/renamer-grid.component';
import { RequestFilesComponent } from './request-files/request-files.component';

/* Services */
import { MusicbrainzService } from './services/musicbrainz.service';
import { TrackService } from './services/track.service';

@NgModule({
	declarations: [
		AppComponent,
		RenamerGridComponent,
		AutoFocusDirective,
		MetadataHandlerComponent,
		RequestFilesComponent,
		EditableCellComponent,
		LeftPanelComponent,
		InputFieldComponent,
	],
	imports: [
		BrowserModule,
		HttpModule,
		FormsModule,
		NgxElectronModule,
		ClarityModule.forRoot(),
	],
	providers: [
		MusicbrainzService,
		TrackService,
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
