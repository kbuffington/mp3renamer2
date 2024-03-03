import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { AppRoutingModule } from './app-routing.module';
import { DontAllowOnReload } from './dont-allow-on-reload.guard';

/* Components */
import { AutoFocusDirective } from '@directives/auto-focus.directive';
import { AppComponent } from './app.component';
import { ConfigComponent } from '@components/config/config.component';
import { ConflictModalComponent } from '@components/conflict-modal/conflict-modal.component';
import { CountrySelectComponent } from '@components/right-panel/country-select/country-select.component';
import { EditableCellComponent } from './editable-cell/editable-cell.component';
import { FanartComponent } from '@components/fanart/fanart.component';
import { GenreSelectComponent } from '@components/right-panel/genre-select/genre-select.component';
import { GetMetadataComponent } from '@components/get-metadata/get-metadata.component';
import { ImageHandlerComponent } from '@components/right-panel/image-handler/image-handler.component';
import { InputFieldComponent } from './input-field/input-field.component';
import { LeftPanelComponent } from '@components/left-panel/left-panel.component';
import { MainComponent } from '@components/main/main.component';
import { MetadataHandlerComponent } from '@components/metadata-handler/metadata-handler.component';
import { RenamerGridComponent } from '@components/renamer-grid/renamer-grid.component';
import { RightPanelComponent } from '@components/right-panel/right-panel.component';
import { UpperButtonBarComponent } from '@components/upper-button-bar/upper-button-bar.component';
import { UnknownPropertiesComponent } from '@components/unknown-properties/unknown-properties.component';

/* Services */
import { ArtistCacheService } from '@services/artist-cache.service';
import { CacheInterceptor } from '@services/http-interceptor.service';
import { CacheService } from '@services/cache.service';
import { ConfigService } from '@services/config.service';
import { FanartService } from '@services/fanart.service';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { ThrottleService } from '@services/throttle.service';
import { TitleCaseService } from '@services/title-case.service';
import { TitleFormatService } from '@services/title-format.service';
import { TrackService } from '@services/track.service';

/* Icons */
import { ClarityIcons, libraryIcon, checkIcon, cogIcon, switchIcon } from '@cds/core/icon';
import '@cds/core/icon/register.js';

ClarityIcons.addIcons(libraryIcon, checkIcon, cogIcon, switchIcon);

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
        ImageHandlerComponent,
        LeftPanelComponent,
        MetadataHandlerComponent,
        ConfigComponent,
        RightPanelComponent,
        UnknownPropertiesComponent,
        UpperButtonBarComponent,
        MainComponent,
        GetMetadataComponent,
        ConflictModalComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ClarityModule,
        FormsModule,
        HttpClientModule,
    ],
    providers: [
        ArtistCacheService,
        CacheService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CacheInterceptor,
            multi: true,
        },
        ConfigService,
        DontAllowOnReload,
        FanartService,
        MusicbrainzService,
        ThrottleService,
        TitleCaseService,
        TitleFormatService,
        TrackService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
