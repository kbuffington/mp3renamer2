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

    constructor(private electronService: ElectronService,
                private configService: ConfigService,
                private router: Router,
                private zone: NgZone) {
        this.configSubscription = configService.getConfig().subscribe((config) => {
            this.config = config;
            this.zone.run(() => {});
        });
    }

    ngOnInit() {
        this.electronService.ipcRenderer.on('selected-dirs', (event, arg) => {
            this.zone.run(() => {
                console.log(arg);
                this.config[arg.prop] = arg.dir;
                console.log(this.config);
            });
        });
    }

    public browseDirectory(prop: string) {
        const dir = this.config[prop];
        this.electronService.ipcRenderer.send('select-dirs', {
            directory: dir,
            prop: prop,
        });
    }

    public saveConfig() {
        this.configService.saveConfig(this.config);
    }
}
