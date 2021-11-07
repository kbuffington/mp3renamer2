import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { knownProperties } from './known-properties';

export interface Track {
    artist: string;
    album: string;
    title: string;
    trackNumber: string;
    userDefined: any;
    meta: {
        originalFilename: string;
        filename: string;
        folder: string;
        extension: string;
    };
}

export class MetadataProperty {
    default = '';
    different = false; // whether not all values are the same
    multiValue = false;
    origValue = '';
    overwrite = true;
    userDefined = false;
    useDefault = false; // if true, the default value will be used instead of individual values for each track
    defaultChanged = false; // has initial value of useDefault changed, or has default value changed?
    values: string[] = [];
    origValues: string[] = []; // copy of values used for resetting
    write = false; // whether to write this property to the file
}

export class MetadataObj {
    [key: string]: MetadataProperty;
}

export class TrackOptions {
    showArtwork?: boolean;
}

export class UnknownPropertiesObj {
    [key: string]: string | string[];
}

export class CommentStruct {
    language: string;
    shortText: string;
    text: string;
}

@Injectable()
export class TrackService {
    private trackList: BehaviorSubject<Track[]> = new BehaviorSubject([]);
    private trackMetaData: BehaviorSubject<MetadataObj> = new BehaviorSubject({});
    private trackOptions: BehaviorSubject<TrackOptions> = new BehaviorSubject({});
    private unknownProperties: UnknownPropertiesObj = {};
    private trackDataBackup: any;
    private trackCount: number;
    private selectedTracks: number[];

    constructor() { }

    getTracks(): Observable<Track[]> {
        return this.trackList.asObservable();
    }

    getMetadata(): Observable<MetadataObj> {
        return this.trackMetaData.asObservable();
    }

    getTrackOptions(): Observable<TrackOptions> {
        return this.trackOptions.asObservable();
    }

    setTracks(tracks: any) {
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

    resetTrackData() {
        this.setTracks(this.trackDataBackup);
    }

    clearTracks() {
        this.trackList.next([]);
    }

    getCurrentTracks(): Track[] {
        return this.trackList.getValue();
    }

    public getCurrentFolder(): string {
        return this.trackList.getValue()[0].meta.folder;
    }

    getNumTracks(): number {
        return this.trackList.getValue().length;
    }

    getCurrentMetadata(): MetadataObj {
        return this.trackMetaData.getValue();
    }

    private processTracks(tracks: any) {
        const metaData: MetadataObj = {};
        const trackOptions: TrackOptions = {};
        let imageLoaded = false;

        this.unknownProperties = {};
        knownProperties.forEach((prop, name) => {
            this.processField(metaData, tracks, name, prop.userDefined,
                prop.multiValue, prop.useDefault, prop.alias);
            metaData[name].write = prop.write;
        });
        tracks.forEach(t => {
            if (t.userDefined) {
                Object.keys(t.userDefined).forEach(prop => {
                    if (!knownProperties.has(prop) && !this.unknownProperties[prop]) {
                        this.processField(metaData, tracks, prop, true, true);
                        this.unknownProperties[prop] = t.userDefined[prop];
                    }
                });
            }
            if (!imageLoaded && t.image) {
                imageLoaded = true;
                trackOptions.showArtwork = true;
            }
        });
        this.trackMetaData.next(metaData);
        this.trackOptions.next(trackOptions);
    }

    setMetadata(updatedMetadata: MetadataObj) {
        this.trackMetaData.next(updatedMetadata);
    }

    getUnknownProperties(): UnknownPropertiesObj {
        return this.unknownProperties;
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
        if (!metaProp.default) {
            metaProp.default = value.hasOwnProperty('text') ? value['text'] : value;
        }
        metaProp.values.push(value.hasOwnProperty('text') ? value['text'] : value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previewFilenames(pattern: string) {
        const trackList = this.trackList.getValue();
        const metadata = this.trackMetaData.getValue();
        const artist = metadata.artist.default.trim();
        trackList.map(t => {
            t.meta.filename =
                `${artist} [${metadata.album.default.trim()} ${t.trackNumber.trim()}] - ${t.title.trim()}${t.meta.extension}`;
        });
        this.trackList.next(trackList);
    }

    revertFilenames() {
        const trackList = this.trackList.getValue();
        trackList.map(t => {
            t.meta.filename = t.meta.originalFilename;
        });
        this.trackList.next(trackList);
    }

    setTagData() {
        const trackList = this.trackList.getValue();
        const metadata = this.trackMetaData.getValue();
        const trackTagFields = [];
        for (let i=0; i < this.trackCount; i++) {
            const t: any = trackTagFields[i] = {};
            t.artist = trackList[i].artist;
            t.title = trackList[i].title;
            t.trackNumber = trackList[i].trackNumber;
        }
        Object.entries(metadata).forEach(([key, obj]) => {
            if (!obj.write) return;
            let value: any;

            for (let i = 0; i < this.trackCount; i++) {
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
                        trackTagFields[i][key] = value;
                    } else {
                        trackTagFields[i].userDefined = Object.assign({}, trackTagFields[i].userDefined);
                        trackTagFields[i].userDefined[key] = value;
                    }
                }
            }
        });
        console.log(trackTagFields);
    }

    renumberTracks(startNumber: number) {
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
}
