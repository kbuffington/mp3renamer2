import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HttpStreamerComponent } from './http-streamer/http-streamer.component';
import { RenamerGridComponent } from './renamer-grid/renamer-grid.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { XmlHandlerComponent } from './xml-handler/xml-handler.component';
import { RequestFilesComponent } from './request-files/request-files.component';
import { MusicbrainzService } from './services/musicbrainz.service';
import { TrackService } from './services/track.service';
// import { AuthenticatedHttpService } from './services/connection-backend.service';

@NgModule({
	declarations: [
		AppComponent,
		HttpStreamerComponent,
		RenamerGridComponent,
		AutoFocusDirective,
		XmlHandlerComponent,
		RequestFilesComponent
	],
	imports: [
		BrowserModule,
		HttpModule,
		FormsModule,
		ClarityModule.forRoot()
	],
	providers: [
		MusicbrainzService,
		TrackService,
		// Http
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
