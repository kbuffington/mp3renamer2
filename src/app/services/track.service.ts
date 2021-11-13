import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { knownProperties } from './known-properties';
import {
    alwaysLowerCaseWords,
    CommentStruct,
    lowerCaseWords,
    MetadataObj,
    MetadataProperty,
    Track,
    TrackOptions,
    UnknownPropertiesObj,
    upperCaseWords,
} from '../classes/track.classes';

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
        this.trackMetaData.next(metaData);
        this.trackOptions.next(trackOptions);
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
        console.log(this.unknownProperties);
        // TODO: Also write undefined properties
        Object.entries(metadata).forEach(([key, obj]) => {
            if (obj.write) {
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
            }
        });
        console.log(trackTagFields);
    }

    public getSelectedTracks(): Track[] {
        return this.trackList.getValue().filter((t, index) => this.selectedTracks.includes(index));
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

    /**
     * Given a word which is just alpha-numeric characters, capitalize the first letter (if required)
     * and lowercase the rest. Also test if the word is an Acronym and ensure each letter is capitalized.
     * @param {string} word
     * @param {boolean} capitalizeFirstLetter
     * @return {string}
     */
    private titleCaseWord(word: string, capitalizeFirstLetter: boolean): string {
        let capWord = '';
        if (word.length) {
            const isAcronym = /^([a-zA-Z]\.)+(s)?$/;
            if (isAcronym.test(word)) {
                capWord = word.toLocaleUpperCase();
                if (capWord[capWord.length - 1] === 's') {
                    // plural acronyms like 'M.O.A.B.s'
                    capWord = capWord.slice(0, -1) + 's';
                }
            } else if (upperCaseWords.includes(word.toLocaleUpperCase())) {
                // acronyms like 'DOA'
                capWord = word.toLocaleUpperCase();
            } else if (alwaysLowerCaseWords.includes(word.toLocaleLowerCase())) {
                // words like 'remix'
                capWord = word.toLocaleLowerCase();
            } else if (capitalizeFirstLetter) {
                capWord = word[0].toUpperCase() + word.substr(1).toLocaleLowerCase();
            } else {
                capWord = word.toLocaleLowerCase();
            }
        }
        return capWord;
    }

    private titleCaseString(str: string): string {
        let title = str;
        const hyphenIndexes = [];
        let blankStart = false;
        let blankEnd = false;
        title.split('').forEach((c, i) => {
            if (c === '-') {
                hyphenIndexes.push(i);
            }
        });
        const words = title.split(/[ -]/);
        if (words[0] === '') {
            blankStart = true;
            words.shift();
        }
        if (words[words.length - 1] === '') {
            blankEnd = true;
            words.pop();
        }
        const titleCaseWords = words.map((word, index) => {
            const wordStart = word.match(/^[^a-zA-Z\d.]*/)[0];
            const wordEnd = word.match(/[^a-zA-Z\d.]*$/)[0];
            word = word.slice(wordStart.length, wordEnd.length ? 0 - wordEnd.length : undefined); // strip non alphanum chars
            if (index === 0 || index === words.length - 1 || wordStart === '(' || wordEnd === ')' ||
                !lowerCaseWords.includes(word.toLocaleLowerCase())) {
                return wordStart + this.titleCaseWord(word, true) + wordEnd;
            }
            return wordStart + this.titleCaseWord(word, false) + wordEnd;
        });
        title = titleCaseWords.join(' ');
        hyphenIndexes.forEach(i => {
            title = title.slice(0, i) + '-' + title.slice(i+1);
        });
        return (blankStart ? ' ' : '') + title + (blankEnd ? ' ' : '');
    }

    public guessTitles() {
        let tracks = this.getCurrentTracks();
        const selectedCopy = [...this.selectedTracks];
        tracks = tracks.map((track, index) => {
            if (this.selectedTracks.includes(index)) {
                const parensRegex = /\((.*?)\)/g;
                const matches = track.title.matchAll(parensRegex);
                let offset = 0;
                const titleSections = [];
                for (const match of matches) {
                    if (match.index > offset) {
                        titleSections.push(track.title.substring(offset, match.index));
                    }
                    titleSections.push(match[0]);
                    offset = match.index + match[0].length;
                }
                if (offset < track.title.length) {
                    titleSections.push(track.title.substring(offset));
                }
                console.log(titleSections);
                track.title = titleSections.map((section) => {
                    return this.titleCaseString(section);
                }).join('');
                // track.title = this.titleCaseString(track.title);
                console.log(track.title);
            }
            return track;
        });
        this.setTracks(tracks);
        this.selectedTracks = selectedCopy;
    }
}
