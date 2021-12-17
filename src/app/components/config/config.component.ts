import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '@services/electron.service';
import { ConfigSettingsObject, ConfigService } from '@services/config.service';
import { Subscription } from 'rxjs';
import { CacheService } from '@services/cache.service';


@Component({
    selector: 'config-view',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit, OnDestroy {
    public config: ConfigSettingsObject;
    public doubleQuotes = '"'; // needed for template so we can use " in a template variable

    private configSubscription: Subscription;
    private mainWindow: Electron.BrowserWindow;
    private configBackup: ConfigSettingsObject;

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private cacheService: CacheService,
                private router: Router,
                private zone: NgZone) {
        this.configSubscription = configService.getConfig().subscribe((config) => {
            this.config = config;
            this.backupConfig();
            this.zone.run(() => {});
        });
    }

    ngOnInit() {
        this.mainWindow = this.electronService.remote.getCurrentWindow();
    }

    ngOnDestroy() {
        this.configSubscription.unsubscribe();
    }

    private backupConfig() {
        this.configBackup = JSON.parse(JSON.stringify(this.config));
    }

    public async browseDirectory(prop: string) {
        const dir = this.config[prop];
        const result = await this.electronService.remote.dialog.showOpenDialog(this.mainWindow, {
            defaultPath: dir ? dir : this.electronService.remote.app.getPath('downloads'),
            properties: ['openDirectory'],
        });
        // if canceled just ignore
        if (!result.canceled) {
            this.config[prop] = result.filePaths[0];
        }
    }

    public async browseFile(prop: string) {
        const result = await this.electronService.remote.dialog.showOpenDialog(this.mainWindow, {
            defaultPath: this.electronService.remote.app.getPath('downloads'),
            properties: ['openFile', 'dontAddToRecent'],
        });
        if (!result.canceled) {
            this.config[prop] = result.filePaths[0];
        }
    }

    public suggestValue(prop: string) {
        const defaultConfig = this.configService.defaultConfig();
        if (defaultConfig.hasOwnProperty(prop)) {
            this.config[prop] = defaultConfig[prop];
        }
    }

    public saveConfig() {
        this.configService.saveConfig(this.config);
        this.backupConfig();
    }

    public saveDisabled() {
        const props = Object.keys(this.config).filter(key => key !== 'replacementFileNameChars');
        const charProps = this.config.replacementFileNameChars ? Object.keys(this.config.replacementFileNameChars) : [];
        return !props.some(prop => this.config[prop] !== this.configBackup[prop]) &&
            !charProps.some(prop => {
                return this.config.replacementFileNameChars[prop] !== this.configBackup.replacementFileNameChars[prop];
            });
    }

    public clearCaches() {
        console.log('Clearing caches due to config changes');
        this.cacheService.clearAll();
    }

    public reloadConfig() {
        this.config = JSON.parse(JSON.stringify(this.configBackup));
    }
}
