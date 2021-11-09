import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '@services/electron.service';
import { ConfigSettingsObject, ConfigService } from '@services/config.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'config-view',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
    public config: ConfigSettingsObject;

    private configSubscription: Subscription;
    private mainWindow: Electron.BrowserWindow;
    private configBackup: ConfigSettingsObject;

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private router: Router,
                private zone: NgZone) {
        this.configSubscription = configService.getConfig().subscribe((config) => {
            this.config = config;
            this.configBackup = { ...this.config };
            this.zone.run(() => {});
        });
    }

    ngOnInit() {
        this.mainWindow = this.electronService.remote.getCurrentWindow();
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

    public saveConfig() {
        this.configService.saveConfig(this.config);
        this.configBackup = { ...this.config };
    }

    public saveDisabled() {
        const props = Object.keys(this.config);
        return !props.some(prop => this.config[prop] !== this.configBackup[prop]);
    }
}
