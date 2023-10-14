import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CityService } from '../../services/city.service';
import { CountryService } from '../../services/country.service';
import { City } from '../../models/city';
import { Country } from '../../models/country';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.css']
})
export class CityListComponent implements OnInit {
  cities: City[] = [];
  countries: Country[] = [];
  newCity: City = new City(0, '', 0, 0, 0, new Country(0, '', '', '', 0));
  newCountry: Country = new Country(0, '', '', '', 0);

  

  constructor(
    private cityService: CityService,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.loadCities();
    this.loadCountries();

  }

  loadCities() {
    this.cityService.getCities().subscribe({
      next: response => {
        console.log(response);
        this.cities = response.data;
      },
      error: error => {
        console.error('Error loading cities:', error);
      }
  });
  }

  loadCountries() {
    this.countryService.getCountries().subscribe({
      next: response => {
        console.log(response);
        this.countries = response.data;
      },
      error: error => {
        console.error('Error loading countries:', error);
      }
  });
  }

  getCountryName(countryId: number): string {
    const country = this.countries.find(c => c.id === countryId);
    return country ? country.name : 'Unknown';
  }
  

  editCity(city: City) {
    this.newCity = { ...city }; 
    this.newCity.country = this.countries.find(c => c.id === this.newCity.countryId) as Country;
  }

  saveCity() {
    if (this.newCity.id) {
      this.cityService.updateCity(this.newCity.id, this.newCity).subscribe({
        next: (response: any) => {
          console.log('City updated:', response);
          this.newCity = new City(0, '', 0, 0, 0, new Country(0, '', '', '', 0));
          this.loadCities();
        },
        error: (error: any) => {
          console.error('Error updating city:', error);
        }
      });
    } else {
      this.createCity();
    }
  }
  

  deleteCity(city: City) {
    if (confirm('Are you sure you want to delete this city?')) {
      this.cityService.deleteCity(city.id).subscribe({
        next: () => {
          console.log('City deleted:', city);
          this.loadCities();
        },
        error: (error: any) => {
          console.error('Error deleting city:', error);
        }
    });
    }
  }

  createCity() {
    const selectedCountryId = this.newCity.countryId;
  
    if (selectedCountryId === 0) {
      this.countryService.postCountry(this.newCountry).subscribe({
        next: (countryResponse: any) => {
          console.log('Country created:', countryResponse);
          this.newCity.country = countryResponse as Country;
          this.newCity.countryId = countryResponse.id;
  
          this.createNewCity();
        },
        error: (countryError: any) => {
          console.error('Error creating country:', countryError);
        }
      });
    } else {

      this.newCity.countryId = selectedCountryId;
      this.newCity.country = this.countries.find(c => c.id === selectedCountryId) as Country;
      this.createNewCity();
    }
  }
  
  private createNewCity() {
    this.cityService.postCity(this.newCity).subscribe({
      next: (response: any) => {
        console.log('City created:', response);
        this.newCity = new City(0, '', 0, 0, 0, new Country(0, '', '', '', 0)); 
        this.newCountry = new Country(0, '', '', '', 0);
        this.loadCities();
        this.loadCountries();
      },
      error: (error: any) => {
        console.error('Error creating city:', error);
      }
    });
  }
}