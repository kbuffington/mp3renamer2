// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const { download } = require('electron-dl');
const fs = require('fs');
const NodeID3 = require('../node-id3');
// const taglib = require('../node-taglib');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    const ses = session.fromPartition('persist:name', { cache: true });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 1024,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            backgroundThrottling: false,
            enableRemoteModule: true,
            session: ses, // not sure this is actually doing anything
            worldSafeExecuteJavaScript: true,
            contextIsolation: false, // true breaks electronService
        },
    });

    // and load the index.html of the app.
    // mainWindow.loadFile('dist/mp3renamer2/index.html')
    mainWindow.loadURL('http://localhost:4200');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

function getFiles() {
    dialog.showOpenDialog({
        defaultPath: '~/Desktop/Ghost - 2013 - If You Have Ghost/',
        properties: ['openFile', 'multiSelections'],
    }).then(resp => {
        console.log(resp.filePaths);
        const tracks = processFiles(resp.filePaths);
        mainWindow.webContents.send('files', tracks);
    });
}

function processFiles(files) {
    let imageWritten = false;
    const tracks = [];

    files.forEach(f => {
        tags = NodeID3.read(f);
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
    });
    return tracks;
}

function loadHardCoded() {
    const filePaths = [];
    const dir = '../../../Desktop/Ghost - 2013 - If You Have Ghost/';
    filePaths.push(`${dir}Ghost [If You Have Ghost 01] - If You Have Ghosts.mp3`);
    filePaths.push(`${dir}Multi Value Test copy.mp3`);
    filePaths.push(`${dir}Juarez [Juarez-Junius 01] - 01-Juarez-Old River, Dry River.mp3`);
    // filePaths.push(`${dir}id3v2.4 image.mp3`);

    const tracks = processFiles(filePaths);
    mainWindow.webContents.send('files', tracks);
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
    downloadQueue.push(info);
    // await download(info.win, info.url, info.options);
    // console.log('done with', info.options.filename);
});

exports.getFiles = getFiles;
exports.loadHardCoded = loadHardCoded; // for testing purposes open files on reload
exports.quitApp = quitApp;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
