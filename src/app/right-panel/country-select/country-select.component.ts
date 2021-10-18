import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { countryCodes, CountryEntry } from '@services/countries';

@Component({
	selector: 'country-select',
	templateUrl: './country-select.component.html',
	styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit, OnChanges {
    @Input() multiSelect: boolean = false;
    @Input() useCode: boolean = false;
    @Input() countries: string;

    @Output() countrySelected = new EventEmitter<string>();

    public countryList: CountryEntry[] = countryCodes;
    public fieldName = 'name';
    public selectedCountries: CountryEntry[] = [];
    public selection;

    ngOnInit() {
        this.fieldName = this.useCode ? 'code' : 'name';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.countries?.currentValue) {
            this.selectedCountries = this.getSelectedCountryEntries(this.countries);
        }
    }

    private getSelectedCountryEntries(countriesString: string) {
        const countryNamesOrCodes = countriesString.split(';').map(country => country.trim());
        return countryNamesOrCodes.map(country => this.countryList
            .find(c => country === (country.length === 2 ? c.code : c.name)))
            .filter(c => !!c);
    }

    public updateSelection(country: CountryEntry[]) {
        let countryStrings = "";
        if (country) {
            const countries = Array.isArray(country) ? country : [country];
            countryStrings = countries.map(c => this.useCode ? c.code : c.name).join('; ');
        }
        this.countrySelected.emit(countryStrings);
    }
}