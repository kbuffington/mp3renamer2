import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { NgxElectronModule } from 'ngx-electron';

/* Components */
import { AppComponent } from './app.component';
import { RenamerGridComponent } from './renamer-grid/renamer-grid.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { MetadataHandlerComponent } from './metadata-handler/metadata-handler.component';
import { RequestFilesComponent } from './request-files/request-files.component';
import { EditableCellComponent } from './editable-cell/editable-cell.component';

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
		EditableCellComponent
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
	bootstrap: [AppComponent]
})
export class AppModule { }
