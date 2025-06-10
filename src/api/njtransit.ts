import axios from 'axios';
import FormData from 'form-data';
import 'dotenv/config';

interface AuthResponse {
  Authenticated: string;
  UserToken: string;
}

interface VehicleLocation {
  VehicleLat: string;
  VehicleLong: string;
  VehicleID: string;
  VehiclePassengerLoad: string;
  VehicleRoute: string;
  VehicleDestination: string;
  VehicleDistanceMiles: string;
  VehicleInternalTripNumber: string;
  VehicleScheduledDeparture: string;
}

interface Location {
  bus_terminal_code: string;
  description: string;
}

class NJTransitBusData {
  private testApiUrl = 'https://testpcsdata.njtransit.com/api/BUSDV2';
  private productionApiUrl = 'https://pcsdata.njtransit.com/api/BUSDV2';
  private token: string | null = null;
  private username: string;
  private password: string;
  private isProduction: boolean;

  constructor(username: string, password: string, isProduction: boolean = false) {
    this.username = username;
    this.password = password;
    this.isProduction = isProduction;
  }

  private getBaseUrl(): string {
    return this.isProduction ? this.productionApiUrl : this.testApiUrl;
  }

  async authenticate(): Promise<void> {
    console.log('Authenticating with NJTransit API...');
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);

    try {
      const response = await axios.post<AuthResponse>(
        `${this.getBaseUrl()}/authenticateUser`,
        formData,
        {
          headers: {
            accept: 'text/plain',
            ...formData.getHeaders(),
          },
        }
      );
      console.log('Authentication response:', response.data);
      if (response.data.Authenticated === 'True') {
        this.token = response.data.UserToken;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async getLocations(mode: 'BUS' | 'NLR' | 'HBLR' | 'RL' | 'ALL' = 'ALL'): Promise<Location[]> {
    if (!this.token) {
      await this.authenticate();
    }
    console.log('Fetching locations with token:', this.token);
    console.log('Request params:', { mode });

    const formData = new FormData();
    formData.append('token', this.token!);
    formData.append('mode', mode);

    try {
      const response = await axios.post<Location[]>(
        `${this.getBaseUrl()}/getLocations`,
        formData,
        {
          headers: {
            accept: 'text/plain',
            ...formData.getHeaders(),
          },
        }
      );
      console.log('Locations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get locations error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        console.log('Retrying authentication due to 500 error...');
        this.token = null;
        await this.authenticate();
        return this.getLocations(mode);
      }
      throw error;
    }
  }

  async getVehicleLocations(
    lat: number,
    lon: number,
    radius: number,
    mode: 'BUS' | 'NLR' | 'HBLR' | 'RL' | 'ALL' = 'ALL'
  ): Promise<VehicleLocation[]> {
    if (!this.token) {
      await this.authenticate();
    }
    console.log('Fetching vehicle locations with token:', this.token);
    console.log('Request params:', { lat, lon, radius, mode });

    const formData = new FormData();
    formData.append('token', this.token!);
    formData.append('lat', lat.toString());
    formData.append('lon', lon.toString());
    formData.append('radius', radius.toString());
    formData.append('mode', mode);

    try {
      const response = await axios.post<VehicleLocation[]>(
        `${this.getBaseUrl()}/getVehicleLocations`,
        formData,
        {
          headers: {
            accept: 'text/plain',
            ...formData.getHeaders(),
          },
        }
      );
      console.log('Vehicle locations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get vehicle locations error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        console.log('Retrying authentication due to 500 error...');
        this.token = null;
        await this.authenticate();
        return this.getVehicleLocations(lat, lon, radius, mode);
      }
      throw error;
    }
  }
}

export default NJTransitBusData;