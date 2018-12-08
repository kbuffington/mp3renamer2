// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const NodeID3 = require('../node-id3');
// const taglib = require('../node-taglib');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1400, height: 1024 });

    // and load the index.html of the app.
    // mainWindow.loadFile('dist/mp3renamer2/index.html')
    mainWindow.loadURL('http://localhost:4200');

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

function getFiles() {
    dialog.showOpenDialog({
            defaultPath: '~/Desktop/Ghost - 2013 - If You Have Ghost/',
            properties: ['openFile', 'multiSelections']
        },
        (filePaths, bookmarks) => {
            console.log(filePaths);
            const tracks = processFiles(filePaths);
            mainWindow.webContents.send('files', tracks);
        });
}

function processFiles(files) {
    let imageWritten = false;
    const tracks = [];

    files.forEach(f => {
        tags = NodeID3.read(f);
        tags.meta = {
            filename: f.replace(/^.*[\\\/]/, '')
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
        console.log(tags);
        // tags.title = tags.title + 's';
        // tags.userDefined.ARTISTFILTER.push('Esq.');
        // delete(tags.userDefined.genre);
        // tags = { date: '2019' };
        // NodeID3.write(tags, f);
    });
    return tracks;
}

function openHardCoded() {
    // const filePaths = ['../../../Desktop/Ghost - 2013 - If You Have Ghost/Ghost [If You Have Ghost 01] - If You Have Ghosts.mp3'];
    const filePaths = ['../../../Desktop/Ghost - 2013 - If You Have Ghost/Multi Value Test copy.mp3'];
    // const filePaths = ['../../../Desktop/Ghost - 2013 - If You Have Ghost/id3v2.4 image.mp3'];

    processFiles(filePaths);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', openHardCoded);
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        // createWindow()
    }
})

exports.getFiles = getFiles;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.