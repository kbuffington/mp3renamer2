import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from './electron.service';

export type ReplaceableChar = '\\' | '/' | ':' | '*' | '?' | '"' | '<' | '>' | '|';

export type ConfigSettingsObject = {
    homeDir: string;
    artistLogoDir: string;
    labelLogoDir: string;
    fanartApiKey: string;
    aadPath: string; // path to album art downloader executable
    aadParams: string; // command line parameters to pass to aad.exe
    replaceUnicodeApostrophe: boolean;
    replaceUnicodeEllipsis: boolean;
    replaceUnicodeQuotes: boolean;
    replacementFileNameChars: Record<ReplaceableChar, string>;
};

export type ConfigKey = keyof ConfigSettingsObject;
export type CharKey = keyof ConfigSettingsObject['replacementFileNameChars'];

const CONFIG_FILE_NAME = 'config.json';

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private configuration: BehaviorSubject<ConfigSettingsObject> = new BehaviorSubject(
        {} as ConfigSettingsObject,
    );
    private path: string;

    constructor(private electronService: ElectronService) {
        this.path = this.electronService.remote?.app.getAppPath();
    }

    public getConfig(): Observable<ConfigSettingsObject> {
        return this.configuration.asObservable();
    }

    public getCurrentConfig(): ConfigSettingsObject {
        return this.configuration.getValue();
    }

    public loadConfig(): void {
        this.electronService.fs?.readFile(`${this.path}/${CONFIG_FILE_NAME}`, (err, data) => {
            if (err) {
                // config file does not exist so create default
                const defaultConfig = this.defaultConfig();
                this.saveConfig(defaultConfig);
                this.configuration.next(defaultConfig);
            } else {
                const json = JSON.parse(data.toString());
                this.configuration.next(Object.assign(this.defaultConfig(), json));
            }
        });
    }

    public defaultConfig(): ConfigSettingsObject {
        return {
            homeDir: this.electronService.remote.app.getAppPath(),
            artistLogoDir: this.electronService.remote.app.getPath('downloads'),
            labelLogoDir: this.electronService.remote.app.getPath('downloads'),
            fanartApiKey: 'e98c81989fa12e8171f86068c8b9989a',
            aadPath: '',
            aadParams: '/ar "%artist%" /al "%album%" /path "%folder%folder.%extension%" /autoclose',
            replaceUnicodeApostrophe: true,
            replaceUnicodeEllipsis: true,
            replaceUnicodeQuotes: true,
            replacementFileNameChars: {
                '\\': '-',
                '/': '-',
                ':': '-',
                '*': '',
                '?': '',
                '"': "'",
                '<': '',
                '>': '_',
                '|': '',
            },
        };
    }

    public saveConfig(config: ConfigSettingsObject): void {
        this.electronService.fs.writeFile(
            `${this.path}/${CONFIG_FILE_NAME}`,
            JSON.stringify(config, null, 4),
            () => {},
        );
        this.configuration.next(config);
    }
}
