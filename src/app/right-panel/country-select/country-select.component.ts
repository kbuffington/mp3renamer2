import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { countryCodes, CountryEntry } from '@services/countries';

@Component({
	selector: 'country-select',
	templateUrl: './country-select.component.html',
	styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit {
    @Input() multiSelect: boolean = false;
    @Input() useCode: boolean = false;
    @Input() countries: string;

    @Output() countrySelected = new EventEmitter<string>();

    public countryList: CountryEntry[] = countryCodes;
    public fieldName = 'name';
    public selectedCountries: CountryEntry[] = [];
    public selection;

    ngOnInit() {
        const countryNames = this.countries.split(';').map(country => country.trim());
        this.fieldName = this.useCode ? 'code' : 'name';
        this.selectedCountries = countryNames.map(country => this.countryList
            .find(c => country === (this.useCode ? c.code : c.name)))
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