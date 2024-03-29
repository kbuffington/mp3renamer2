// taken from https://github.com/maximegris/angular-electron/blob/master/src/app/core/services/electron/electron.service.ts
// based on a discussion found here: https://github.com/ThorstenHans/ngx-electron/issues/70
import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as remote from '@electron/remote';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

@Injectable({
    providedIn: 'root',
})
export class ElectronService {
    ipcRenderer: typeof ipcRenderer;
    path: typeof path;
    webFrame: typeof webFrame;
    remote: typeof remote;
    childProcess: typeof childProcess;
    fs: typeof fs;
    util: typeof util;

    main: {
        getFiles: Function,
        loadFiles: Function,
        loadFilesFromFolder: Function,
        loadHardCoded: Function,
        quitApp: Function,
        writeTags: Function,
        os: NodeJS.Platform,
        electronPath: string,
        cliArguments: string[]
        [key: string]: any
    };

    get isElectron(): boolean {
        return !!(window && window.process && window.process.type);
    }

    constructor() {
        // Conditional imports
        if (this.isElectron) {
            this.ipcRenderer = window.require('electron').ipcRenderer;
            this.webFrame = window.require('electron').webFrame;

            this.childProcess = window.require('child_process');
            this.fs = window.require('fs');
            this.path = window.require('path');
            this.util = window.require('util');

            // If you want to use a NodeJS 3rd party deps in Renderer process (like @electron/remote),
            // it must be declared in dependencies of both package.json (in root and app folders)
            // If you want to use remote object in renderer process, please set enableRemoteModule to true in main.ts
            this.remote = window.require('@electron/remote');

            this.main = this.remote.require('./main');
        }
    }
}
