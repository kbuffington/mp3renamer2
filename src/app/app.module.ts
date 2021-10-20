import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { CountrySelectComponent } from './right-panel/country-select/country-select.component';
import { GenreSelectComponent } from './right-panel/genre-select/genre-select.component';

/* Services */
import { MusicbrainzService } from '@services/musicbrainz.service';
import { TrackService } from '@services/track.service';
import { DontAllowOnReload } from './dont-allow-on-reload.guard';
import { PreloadFactory, PreloadService } from './app-preload.service';
import { CacheService } from '@services/cache.service';
import { CacheInterceptor } from '@services/http-interceptor.service';
import { FanartComponent } from '@components/fanart/fanart.component';
import { FanartService } from '@services/fanart.service';

@NgModule({
    declarations: [
        AppComponent,
        RenamerGridComponent,
        AutoFocusDirective,
        CountrySelectComponent,
        EditableCellComponent,
        FanartComponent,
        GenreSelectComponent,
        InputFieldComponent,
        LeftPanelComponent,
        MetadataHandlerComponent,
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
        CacheService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CacheInterceptor,
            multi: true,
        },
        DontAllowOnReload,
        FanartService,
        MusicbrainzService,
        PreloadService,
        TrackService,
        {
            provide: APP_INITIALIZER,
            useFactory: PreloadFactory,
            deps: [PreloadService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
