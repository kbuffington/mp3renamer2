import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { knownProperties } from './known-properties';
import {
    CommentStruct,
    MetadataObj,
    MetadataProperty,
    Track,
    TrackOptions,
    UnknownPropertiesObj,
} from '../classes/track.classes';
import { ElectronService } from './electron.service';
import { ConfigService, ConfigSettingsObject } from './config.service';
import { TitleCaseService } from './title-case.service';

@Injectable()
export class TrackService implements OnDestroy {
    private config: ConfigSettingsObject;
    private configSub: Subscription;
    private currentFolder: BehaviorSubject<string> = new BehaviorSubject('');
    private trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
    private trackMetaData: BehaviorSubject<MetadataObj> = new BehaviorSubject({});
    private trackOptions: BehaviorSubject<TrackOptions> = new BehaviorSubject({});
    private unknownProperties: UnknownPropertiesObj = {};
    private trackDataBackup: any;
    private trackCount: number;
    private selectedTracks: number[];
    private pathDelimiter = '/';
    private rename: Function;

    public deleteString = '';
    public doTitleCase = true;

    constructor(private electronService: ElectronService,
                private titleCaseService: TitleCaseService,
                private configService: ConfigService) {
        const platform = this.electronService.main.os;
        if (platform === 'win32') {
            this.pathDelimiter = '\\';
        }
        this.rename = electronService.util.promisify(electronService.fs.rename);
        this.configSub = configService.getConfig().subscribe(config => this.config = config);
    }

    ngOnDestroy(): void {
        this.configSub.unsubscribe();
    }

    getTracks(): Observable<Track[]> {
        return this.trackList.asObservable();
    }

    getMetadata(): Observable<MetadataObj> {
        return this.trackMetaData.asObservable();
    }

    getTrackOptions(): Observable<TrackOptions> {
        return this.trackOptions.asObservable();
    }

    setTrackOptions(trackOptions: TrackOptions) {
        this.trackOptions.next(trackOptions);
    }

    getFolder(): Observable<string> {
        return this.currentFolder.asObservable();
    }

    public setTracks(tracks: Track[]) {
        this.trackDataBackup = JSON.parse(JSON.stringify(tracks));
        const trackList = tracks.map((t: Track) => {
            t.meta.originalFilename = t.meta.filename;
            t.meta.extension = t.meta.filename.substring(t.meta.filename.lastIndexOf('.'));
            return t;
        });
        this.trackCount = trackList.length;
        this.processTracks(tracks);
        this.trackList.next(trackList);
        this.currentFolder.next(this.getCurrentDirectory());
    }

    public resetTrackData() {
        this.setTracks(this.trackDataBackup);
    }

    clearTracks() {
        this.trackList.next([]);
    }

    public getCurrentTracks(): Track[] {
        return this.trackList.getValue();
    }

    /**
     * Returns the full path of the first loaded file
     * @return {string}
     */
    public getCurrentPath(): string {
        const trackList = this.trackList.getValue();
        if (trackList.length) {
            return trackList[0].meta.folder;
        } else {
            return '';
        }
    }

    /**
     * @return {string} just the current directory without the full path and without trailing slash
     */
    public getCurrentDirectory(): string {
        const path = this.getCurrentPath();
        // full path without current folder, but with trailing slash
        const folder = path.substring(path.substring(0, path.length - 2).lastIndexOf(this.pathDelimiter) + 1);
        return folder.substring(0, folder.length - 1);
    }

    getNumTracks(): number {
        return this.trackList.getValue().length;
    }

    getCurrentMetadata(): MetadataObj {
        return this.trackMetaData.getValue();
    }

    private processTracks(tracks: Track[]) {
        const metaData: MetadataObj = {};
        const trackOptions: TrackOptions = {};
        let imageLoaded = false;

        this.unknownProperties = {};
        const aliases = [];
        knownProperties.forEach((prop, name) => {
            this.processField(metaData, tracks, name, prop.userDefined,
                prop.multiValue, prop.useDefault, prop.alias);
            metaData[name].write = prop.write ?? true;
            if (prop.alias) {
                aliases.push(prop.alias); // save all aliases for filtering out of unknownProperties
            }
        });
        tracks.forEach(t => {
            if (t.userDefined) {
                Object.keys(t.userDefined).forEach(prop => {
                    if (!knownProperties.has(prop) &&
                            !aliases.includes(prop) &&
                            !this.unknownProperties[prop]) {
                        this.processField(this.unknownProperties, tracks, prop, true, true);
                    }
                });
            }
            if (!imageLoaded && t.image) {
                imageLoaded = true;
                trackOptions.showArtwork = true;
                this.processImageField(metaData, t.image);
            }
        });
        this.postProcessing(metaData);
        this.trackMetaData.next(metaData);
        this.trackOptions.next(trackOptions);
    }

    private postProcessing(metadata: MetadataObj) {
        if (metadata.trackNumber) {
            // remove total tracks from trackNumber
            metadata.trackNumber.values = metadata.trackNumber.values.map(t => {
                return t.replace(/\/\d+/, '').padStart(2, '0');
            });
            metadata.trackNumber.origValues = [...metadata.trackNumber.values];
        }
    }

    public setMetadata(updatedMetadata: MetadataObj) {
        this.trackMetaData.next(updatedMetadata);
    }

    public getUnknownProperties(): UnknownPropertiesObj {
        return this.unknownProperties;
    }

    public setUnknownProperties(unknownProperties: UnknownPropertiesObj) {
        this.unknownProperties = unknownProperties;
    }

    public processImageField(metadata: MetadataObj, image: any) {
        const metaProp = new MetadataProperty();
        metaProp.multiValue = false;
        metaProp.useDefault = true;
        metaProp.default = image;

        metadata.image = metaProp;
    }

    private processField(metadata, tracks, property: string, userDefined: boolean,
        multiValue: boolean, useDefault = false, alias?: string) {
        const metaProp = new MetadataProperty();
        metaProp.multiValue = multiValue;
        metaProp.useDefault = useDefault;
        tracks.forEach(t => {
            if (!userDefined) {
                if (t[property]) {
                    this.setMetadataValue(metaProp, t[property]);
                } else {
                    metaProp.values.push('');
                }
            } else {
                // console.log(property);
                metaProp.userDefined = true;
                if (t.userDefined && (t.userDefined[property] || t.userDefined[alias])) {
                    this.setMetadataValue(metaProp, t.userDefined[property] || t.userDefined[alias]); // short-circuit eval
                } else {
                    metaProp.values.push('');
                }
            }
            metaProp.origValue = metaProp.default;
        });
        metaProp.origValues = [...metaProp.values];
        metaProp.values.forEach(t => {
            if (t !== metaProp.default && metaProp.default !== undefined) {
                metaProp.different = true;
            }
        });
        metadata[property] = metaProp;
    }

    private setMetadataValue(metaProp: MetadataProperty, value: string | CommentStruct) {
        if (Array.isArray(value)) {
            value = value.join('; ');
        }
        const saveValue = value.hasOwnProperty('text') ? value['text'] : value;
        if (!metaProp.default) {
            metaProp.default = saveValue;
        }
        metaProp.values.push(saveValue);
    }

    /**
     * Returns a quasi-roman numeral that will always be numerically alphabetical (i.e. 4 will
     * be aphabetized before 5). 1 => 'I', 2 => 'II', 4 => 'IIII', 9 => 'VIIII', 29 => 'XXVIIII'
     * @param {number|string} num
     * @return {string}
     */
    private alphaRoman(num: number|string): string {
        if (typeof num === 'string') {
            num = parseInt(num, 10);
        }
        let tens = Math.floor(num / 10);
        num -= tens * 10;
        const five = Math.floor(num / 5);
        num -= five * 5;
        const roman = [];
        while (tens) {
            roman.push('X');
            tens--;
        }
        if (five) {
            roman.push('V');
        }
        while (num) {
            roman.push('I');
            num--;
        }
        return roman.join('');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public previewFilenames(pattern: string) {
        const trackList = this.getCurrentTracks();
        const metadata = this.trackMetaData.getValue();
        const artist = metadata.performerInfo.default ? metadata.performerInfo.default : metadata.artist.default;
        const config = this.config;
        const replaceCharsStr = Object.keys(config.replacementFileNameChars).join('');
        const regex = new RegExp('[' + replaceCharsStr.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') + ']', 'g');
        trackList.forEach((t: Track, index: number) => {
            if (this.selectedTracks.includes(index)) {
                const title = metadata.title.values[index].trim();
                const discNum = this.alphaRoman(metadata.partOfSet.values[index]);
                const trackNumber = metadata.trackNumber.values[index];
                const filename =
                        `${artist.trim()} [${metadata.album.default.trim()} ${discNum ? discNum + '-' : ''}${trackNumber}]` +
                        ` - ${title}${t.meta.extension}`;
                // https://stackoverflow.com/a/70343927/911192
                t.meta.filename = filename.replace(regex, function(m) {
                    return config.replacementFileNameChars[m];
                });
            }
        });
        this.trackList.next(trackList);
    }

    /**
     * Renames files (if needed) to the currently set filename in the metadata grid. Should be called
     * only after doing previewFilenames() at least once.
     */
    public async setFilenames() {
        const trackList = this.getCurrentTracks();
        // use standard for loop so tracklist.next happens after all renames have occured
        for (let index = 0; index < trackList.length; index++) {
            const t = trackList[index];
            if (this.selectedTracks.includes(index) && t.meta.filename !== t.meta.originalFilename) {
                const path = t.meta.folder;
                if (path) {
                    const newName = path + t.meta.filename; // meta.filename currently shows the value in the renamer grid
                    const tempPath = newName + ('' + Date.now()).substring(0, 6);
                    try {
                        await this.rename(path + t.meta.originalFilename, tempPath);
                        await this.rename(tempPath, newName);
                        t.meta.originalFilename = t.meta.filename;
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        }
        this.trackList.next(trackList);
    }

    public revertFilenames() {
        const trackList = this.getCurrentTracks();
        trackList.map(t => {
            t.meta.filename = t.meta.originalFilename;
        });
        this.trackList.next(trackList);
    }

    public getNewFolderName(): string {
        const md = this.getCurrentMetadata();
        const config = this.config;
        const year = md.albumSortOrder.default ? md.albumSortOrder.default :
            md.originalReleaseDate.default ? md.originalReleaseDate.default : md.date.default;
        const artist = md.artistSortOrder.default ? md.artistSortOrder.default :
            md.performerInfo.default ? md.performerInfo.default : md.artist.default;
        let editionYear = '';
        if (md.originalReleaseDate.default && md.originalReleaseDate.default.substring(0, 4) < md.date.default.substring(0, 4)) {
            editionYear = md.date.default.substring(0, 4) + ' ';
        }
        const edition = md.EDITION.default ? ` [${editionYear}${md.EDITION.default.trim()}]` : '';
        let newDir = `${artist.trim()} - ${year ? year.substring(0, 4) + ' - ' : ''}` +
                `${md.album.default.trim()}${edition}`;

        const replaceCharsStr = Object.keys(config.replacementFileNameChars).join('');
        const regex = new RegExp('[' + replaceCharsStr.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') + ']', 'g');
        newDir = newDir.replace(regex, function(m) {
            return config.replacementFileNameChars[m];
        });

        return newDir;
    }

    public async renameFolder() {
        const path = this.getCurrentPath();
        const currentDir = this.getCurrentDirectory();
        // full path without current folder, but with trailing slash
        const basePath = path.substring(0, path.substring(0, path.length - 2).lastIndexOf(this.pathDelimiter) + 1);
        const newDir = this.getNewFolderName();
        if (newDir !== currentDir) {
            const newPath = basePath + newDir;
            try {
                if (this.electronService.fs.statSync(newPath)) {
                    // newPath already exists, so move files into it:
                    this.getCurrentTracks().map(async t => {
                        await this.rename(t.meta.folder + t.meta.originalFilename,
                            newPath + this.pathDelimiter + t.meta.originalFilename);
                        this.getCurrentTracks().map(t => t.meta.folder = newPath + this.pathDelimiter);
                    });
                    console.log(`Moved files from "${currentDir}" to "${newDir}"`);
                    this.currentFolder.next(newDir.substring(0, newDir.length));
                    // delete empty folder if possible
                    this.electronService.fs.rmdir(path, (err) => {
                        if (err) console.error(err);
                    });
                } else {
                    const tempPath = newPath + ('' + Date.now()).substring(0, 6);
                    await this.rename(path, tempPath);
                    await this.rename(tempPath, newPath);
                    console.log(`Renamed directory "${currentDir}" to "${newDir}"`);
                    this.getCurrentTracks().map(t => t.meta.folder = newPath + this.pathDelimiter);
                    this.currentFolder.next(newDir.substring(0, newDir.length));
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    setTagData() {
        const trackList = this.trackList.getValue();
        const metadata = this.trackMetaData.getValue();
        let trackTagFields = [];
        const files = [];

        trackList.forEach((t: Track, index: number) => {
            if (this.selectedTracks.includes(index)) {
                files.push(t.meta.folder + t.meta.filename);
                trackTagFields[index] = {};
            }
        });
        // TODO: Also write undefined properties
        Object.entries(this.unknownProperties).forEach(([key, value]) => {
            metadata[key] = value;
        });
        Object.entries(metadata).forEach(([key, obj]) => {
            if (obj.write) {
                let value: any;

                for (let i = 0; i < this.trackCount; i++) {
                    if (this.selectedTracks.includes(i)) {
                        if (obj.overwrite) {
                            if (obj.useDefault) {
                                value = obj.default;
                            } else {
                                value = obj.values[i];
                            }
                        } else {
                            value = obj.origValues[i];
                        }
                        if (value) {
                            if (obj.multiValue && value.includes('; ')) {
                                value = value.split('; ');
                            }
                            if (!obj.userDefined) {
                                if (key === 'comment') {
                                    value = {
                                        language: 'eng',
                                        shortText: '',
                                        text: value,
                                    };
                                }
                                trackTagFields[i][key] = value;
                            } else {
                                trackTagFields[i].userDefined = Object.assign({}, trackTagFields[i].userDefined);
                                trackTagFields[i].userDefined[key] = value;
                            }
                        }
                    }
                }
            }
        });
        trackTagFields = trackTagFields.filter(t => t); // remove empty objects
        console.log(trackTagFields);

        this.electronService.main.writeTags(files, trackTagFields);
    }

    public getSelectedTracks(): Track[] {
        return this.trackList.getValue().filter((t, index) => this.selectedTracks.includes(index));
    }

    public renumberTracks(startNumber: number) {
        let count = 0;
        const metadata = this.getCurrentMetadata().trackNumber.values;
        this.getCurrentTracks().forEach((t: Track, index: number) => {
            if (this.selectedTracks.includes(index)) {
                t.trackNumber = (startNumber + count + '').padStart(2, '0');
                metadata[index] = (startNumber + count + '').padStart(2, '0');
                count++;
            }
        });
    }

    updateSelectedTracks(selectedTracks: number[]) {
        this.selectedTracks = selectedTracks;
    }

    public guessTitles() {
        const metadata = this.getCurrentMetadata();
        // const tracks = this.getCurrentTracks(); // used for guessing titles from filename
        const selectedCopy = [...this.selectedTracks];
        const titles = metadata.title.values.map((origTitle, index) => {
            if (this.selectedTracks.includes(index)) {
                let title = origTitle.replace(this.deleteString, ''); // TODO: Guess title from filename
                if (this.doTitleCase) {
                    title = this.titleCaseService.titleCaseString(title);
                }
                return title;
            }
            return origTitle;
        });
        metadata.title.values = titles;
        this.setMetadata(metadata);
        this.selectedTracks = selectedCopy;
    }
}
