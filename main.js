// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const fs = require('fs');
require('@electron/remote/main').initialize();

let NodeID3tag;
if (app.isPackaged || process.platform === 'win32') {
    NodeID3tag = require('node-id3tag');
} else {
    NodeID3tag = require('../node-id3tag');
}
// NodeID3tag = require('node-id3');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const ses = session.fromPartition('persist:name', { cache: true });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: app.isPackaged ? 920 : 1400,
        height: 1024,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            backgroundThrottling: false,
            enableRemoteModule: true,
            session: ses, // not sure this is actually doing anything
            worldSafeExecuteJavaScript: true,
            contextIsolation: false, // true breaks electronService
            webSecurity: false, // TODO: disabling this for dev so can load from file:// disable when using a prod build
        },
    });
    mainWindow.setMenu(null);

    if (app.isPackaged) {
        mainWindow.loadFile('dist/mp3renamer2/index.html');
    } else {
        mainWindow.loadURL('http://localhost:4200');
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

function getFiles(directory) {
    dialog.showOpenDialog({
        defaultPath: directory,
        properties: ['openFile', 'multiSelections'],
    }).then(resp => {
        mainWindow.webContents.send('loadingFiles', true);
        console.log('getFiles:', resp.filePaths);
        const tracks = processFiles(resp.filePaths);
        mainWindow.webContents.send('files', tracks);
        mainWindow.webContents.send('loadingFiles', false);
    });
}

function processFiles(files) {
    let imageWritten = false;
    const tracks = [];

    files.forEach(f => {
        if (f.match(/.mp3$/)) {
            tags = NodeID3tag.read(f);
            tags.meta = {
                filename: f.replace(/^.*[\\/]/, ''),
                folder: f.replace(/[^\\/]*$/, ''),
            };
            tracks.push(tags);
            if (tags.image && !imageWritten) {
                if (tags.image.imageBuffer.length === 0) {
                    delete tags.image;
                } else {
                    console.log('writing image');
                    imageWritten = true;
                    fs.writeFileSync('./temp/embeddedArtwork.jpg', tags.image.imageBuffer, 'binary');
                }
            }
            // tags.title = tags.title + 's';
            // tags.userDefined.ARTISTFILTER.push('Esq.');
            // delete(tags.userDefined.genre);
            // tags = { date: '2019' };
            // NodeID3.write(tags, f);
        }
    });
    console.log('processFiles:', tracks[0]);
    return tracks;
}

function writeTags(files, tags) {
    console.log(files[0], tags[0]);
    const start = Date.now();
    files.forEach((f, index) => {
        NodeID3tag.write(tags[index], f);
    });
    console.log(`write took ${Date.now() - start}ms`);
}

function loadFiles(filePaths) {
    const tracks = processFiles(filePaths);
    mainWindow.webContents.send('files', tracks);
}

function loadHardCoded() {
    const filePaths = [];
    // const dir = app.getPath('desktop')+ '/mp3-test/music/Graveyard - 2018 - Peace/';
    // const dir = app.getPath('desktop')+ '/mp3-test/music/Ozzy Osbourne - 1987 - Tribute/';
    const dir = app.getPath('desktop') + '/mp3-test/music/Benante, Charlie - 2021 - Silver Linings/';
    const stats = fs.statSync(dir);
    if (stats) {
        // folder exists
        fs.readdirSync(dir).forEach(file => {
            if (file.match(/\.mp3$/)) {
                filePaths.push(path.join(dir, file));
            }
        });
    }
    // console.log(filePaths);
    // const dir = '../../../Desktop/Ghost - 2013 - If You Have Ghost/';
    // filePaths.push(`${dir}Ghost [If You Have Ghost 01] - If You Have Ghosts.mp3`);
    // filePaths.push(`${dir}Ghost [If You Have Ghost 03] - Crucified.mp3`);
    // filePaths.push(`${dir}Multi Value Test copy.mp3`);
    // filePaths.push(`${dir}Juarez [Juarez-Junius 01] - 01-Juarez-Old River, Dry River.mp3`);
    // filePaths.push(`${dir}id3v2.4 image.mp3`);

    if (filePaths.length) {
        const tracks = processFiles(filePaths);
        mainWindow.webContents.send('files', tracks);
    }
}

function quitApp() {
    app.quit();
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        // createWindow()
    }
});

class DownloadQueue extends Array {
    constructor(...args) {
        super(...args);
    }
    push(item) {
        const len = super.push(item);
        if (this.length === 1) {
            this.download(item);
        }
        return len;
    }
    shift() {
        const item = super.shift();
        if (this.length > 0) {
            this.download(this[0]);
        }
        return item;
    }
    download(item) {
        item.options.onCompleted = () => {
            this.shift();
        };
        download(item.win, item.url, item.options);
    }
}

const downloadQueue = new DownloadQueue();

ipcMain.on('download', (event, info) => {
    info.win = BrowserWindow.getFocusedWindow();
    if (info.options.directory) {
        info.options.directory = path.resolve(info.options.directory);
    }
    downloadQueue.push(info);
    // await download(info.win, info.url, info.options);
    // console.log('done with', info.options.filename);
});

exports.getFiles = getFiles;
exports.loadFiles = loadFiles;
exports.loadHardCoded = loadHardCoded; // for testing purposes open files on reload
exports.quitApp = quitApp;
exports.writeTags = writeTags;
exports.os = process.platform;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
