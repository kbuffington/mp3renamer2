import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from './electron.service';

export class ConfigSettingsObject {
    homeDir: string;
    artistLogoDir: string;
    labelLogoDir: string;

    constructor(json) {
        Object.assign(this, json);
    }
}

const CONFIG_FILE_NAME = 'config.json';

@Injectable()
export class ConfigService {
    private configuration: BehaviorSubject<ConfigSettingsObject> = new BehaviorSubject(new ConfigSettingsObject({}));
    private path: string;

    constructor(private electronService: ElectronService) {
        this.path = this.electronService.remote.app.getAppPath();
    }

    public getConfig(): Observable<ConfigSettingsObject> {
        return this.configuration.asObservable();
    }

    public getCurrentConfig(): ConfigSettingsObject {
        return this.configuration.getValue();
    }

    public loadConfig(): void {
        this.electronService.fs.readFile(`${this.path}/${CONFIG_FILE_NAME}`, (err, data) => {
            if (err) {
                // config file does not exist so create default
                const defaultConfig = this.defaultConfig();
                this.saveConfig(defaultConfig);
                this.configuration.next(defaultConfig);
            } else {
                const json = JSON.parse(data.toString());
                this.configuration.next(new ConfigSettingsObject(json));
            }
        });
    }

    private defaultConfig(): ConfigSettingsObject {
        const defaultConfig = new ConfigSettingsObject({
            homeDir: this.electronService.remote.app.getAppPath(),
            artistLogoDir: this.electronService.remote.app.getPath('downloads'),
            labelLogoDir: this.electronService.remote.app.getPath('downloads'),
        });

        return defaultConfig;
    }

    public saveConfig(config: ConfigSettingsObject): void {
        this.electronService.fs.writeFile(`${this.path}/${CONFIG_FILE_NAME}`, JSON.stringify(config, null, 4), () => {});
    }
}
