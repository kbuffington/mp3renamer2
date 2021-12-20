import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from './electron.service';

export class ConfigSettingsObject {
    homeDir: string;
    artistLogoDir: string;
    labelLogoDir: string;
    fanartApiKey: string;
    aadPath: string; // path to album art downloader executable
    aadParams: string; // command line paramaters to pass to aad.exe
    replaceUnicodeApostrophe: boolean;
    replaceUnicodeEllipsis: boolean;
    replaceUnicodeQuotes: boolean;
    replacementFileNameChars: {
        '\\': '-',
        '/': '-',
        ':': '-',
        '*': '',
        '?': '',
        '"': '\'',
        '<': '',
        '>': '_',
        '|': '',
    }

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
                this.configuration.next(new ConfigSettingsObject(Object.assign(this.defaultConfig(), json)));
            }
        });
    }

    public defaultConfig(): ConfigSettingsObject {
        const defaultConfig = new ConfigSettingsObject({
            homeDir: this.electronService.remote.app.getAppPath(),
            artistLogoDir: this.electronService.remote.app.getPath('downloads'),
            labelLogoDir: this.electronService.remote.app.getPath('downloads'),
            fanartApiKey: 'e98c81989fa12e8171f86068c8b9989a',
            aadPath: '',
            aadParams: '/ar "%artist%" /al "%album%" /path "%folder%\\folder.%extension%" /autoclose',
            replaceUnicodeApostrophe: true,
            replaceUnicodeEllipsis: true,
            replaceUnicodeQuotes: true,
            replacementFileNameChars: {
                '\\': '-',
                '/': '-',
                ':': '-',
                '*': '',
                '?': '',
                '"': '\'',
                '<': '',
                '>': '_',
                '|': '',
            },
        });

        return defaultConfig;
    }

    public saveConfig(config: ConfigSettingsObject): void {
        this.electronService.fs.writeFile(`${this.path}/${CONFIG_FILE_NAME}`, JSON.stringify(config, null, 4), () => {});
        this.configuration.next(config);
    }
}
