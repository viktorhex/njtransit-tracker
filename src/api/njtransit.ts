import axios from 'axios';
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
    try {
      const response = await axios.post<AuthResponse>(
        `${this.getBaseUrl()}/authenticateUser`,
        {
          username: this.username,
          password: this.password,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Authentication response:', response.data);
      if (response.data.Authenticated === 'True') {
        this.token = response.data.UserToken;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (e) {
      console.error('Authentication error:', e);
      throw e;
    }
  }

  async getLocations(mode: 'BUS' | 'NLR' | 'HBLR' | 'RL' | 'ALL' = 'ALL'): Promise<Location[]> {
    if (!this.token) {
      await this.authenticate();
    }
    console.log('Fetching locations with token:', this.token);
    console.log('Request params:', { mode });

    try {
      const response = await axios.post<Location[]>(
        `${this.getBaseUrl()}/getLocations`,
        {
          token: this.token,
          mode,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'multipart/form-data',
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

    try {
      const response = await axios.post<VehicleLocation[]>(
        `${this.getBaseUrl()}/getVehicleLocations`,
        {
          token: this.token,
          lat: lat.toString(),
          lon: lon.toString(),
          radius: radius.toString(),
          mode,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'multipart/form-data',
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