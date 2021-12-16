import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
import { ConfigService } from './config.service';
import { TitleCaseService } from './title-case.service';

@Injectable()
export class TrackService {
    private trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
    private trackMetaData: BehaviorSubject<MetadataObj> = new BehaviorSubject({});
    private trackOptions: BehaviorSubject<TrackOptions> = new BehaviorSubject({});
    private unknownProperties: UnknownPropertiesObj = {};
    private trackDataBackup: any;
    private trackCount: number;
    private selectedTracks: number[];
    private pathDelimiter = '/';

    public deleteString = '';
    public doTitleCase = true;

    constructor(private electronService: ElectronService,
                private titleCaseService: TitleCaseService,
                private configService: ConfigService) {
        const platform = this.electronService.remote.require('./main.js').os;
        if (platform === 'win32') {
            this.pathDelimiter = '\\';
        }
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

    setTracks(tracks: Track[]) {
        this.trackDataBackup = JSON.parse(JSON.stringify(tracks));
        const trackList = tracks.map((t: Track) => {
            t.meta.originalFilename = t.meta.filename;
            t.meta.extension = t.meta.filename.substring(t.meta.filename.lastIndexOf('.'));
            return t;
        });
        this.trackCount = trackList.length;
        this.processTracks(tracks);
        this.trackList.next(trackList);
    }

    public resetTrackData() {
        this.setTracks(this.trackDataBackup);
    }

    clearTracks() {
        this.trackList.next([]);
    }

    getCurrentTracks(): Track[] {
        return this.trackList.getValue();
    }

    public getCurrentPath(): string {
        return this.trackList.getValue()[0].meta.folder;
    }

    /**
     * @return {string} just the current directory without the full path and without trailing slash
     */
    public getCurrentDirectory(): string {
        const path = this.getCurrentPath();
        // full path without current folder, but with trailing slash
        const folder = path.substr(path.substr(0, path.length - 2).lastIndexOf(this.pathDelimiter) + 1);
        return folder.substr(0, folder.length - 1);
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
                return t.replace(/\/\d+/, '');
            });
            metadata.trackNumber.origValues = [...metadata.trackNumber.values];
        }
    }

    setMetadata(updatedMetadata: MetadataObj) {
        this.trackMetaData.next(updatedMetadata);
    }

    public getUnknownProperties(): UnknownPropertiesObj {
        return this.unknownProperties;
    }

    public setUnknownProperties(unknownProperties: UnknownPropertiesObj) {
        this.unknownProperties = unknownProperties;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public previewFilenames(pattern: string) {
        const trackList = this.getCurrentTracks();
        const metadata = this.trackMetaData.getValue();
        const artist = metadata.artist.default.trim();
        const config = this.configService.getCurrentConfig();
        const replaceCharsStr = Object.keys(config.replacementFileNameChars).join();
        const regex = new RegExp('[' + replaceCharsStr.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') + ']', 'g');
        trackList.forEach((t: Track, index: number) => {
            if (this.selectedTracks.includes(index)) {
                const title = metadata.title.values[index].trim();
                const filename =
                    `${artist} [${metadata.album.default.trim()} ${t.trackNumber.trim()}] - ${title}${t.meta.extension}`;
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
    public setFilenames() {
        this.getCurrentTracks().forEach((t: Track, index: number) => {
            if (this.selectedTracks.includes(index) && t.meta.filename !== t.meta.originalFilename) {
                const path = t.meta.folder;
                // check if we are using mocked files
                if (path) {
                    this.electronService.fs.stat(path + t.meta.filename, (err, stats) => {
                        if (err) {
                            this.electronService.fs.rename(path + t.meta.originalFilename, path + t.meta.filename,
                                () => {});
                            t.meta.originalFilename = t.meta.filename;
                        } else {
                            console.log(stats);
                            console.warn(`File already exists: "${path}${t.meta.filename}"`);
                        }
                    });
                }
            }
        });
    }

    public revertFilenames() {
        const trackList = this.getCurrentTracks();
        trackList.map(t => {
            t.meta.filename = t.meta.originalFilename;
        });
        this.trackList.next(trackList);
    }

    public renameFolder() {
        const metadata = this.getCurrentMetadata();
        const path = this.getCurrentPath();
        // full path without current folder, but with trailing slash
        const basePath = path.substr(0, path.substr(0, path.length - 2).lastIndexOf(this.pathDelimiter) + 1);
        const year = metadata.date.default.substr(0, 4);
        const newDir = `${metadata.artist.default.trim()} - ${year ? year + ' - ' : ''}` +
                `${metadata.album.default.trim()}${this.pathDelimiter}`;
        const newPath = basePath + newDir;
        this.electronService.fs.stat(newPath, (err, stats) => {
            if (err) {
                this.electronService.fs.rename(path, newPath, (err) => {
                    if (!err) {
                        console.log(`Renamed directory ${this.getCurrentDirectory()} to ${newDir}`);
                        this.getCurrentTracks().map(t => t.meta.folder = newPath);
                    } else {
                        console.error(err);
                    }
                });
            } else {
                console.log(stats);
                console.warn(`Directory already exists: "${newDir}"`);
            }
        });
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

        const mainProcess = this.electronService.remote.require('./main.js');
        mainProcess.writeTags(files, trackTagFields);
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
