import axios from 'axios';
import 'dotenv/config';

interface AuthResponse {
  Authenticated: string;
  UserToken: string;
}

async function testAuth() {
  try {
    const response = await axios.post<AuthResponse>(
      'https://testpcsdata.njtransit.com/api/BUSDV2/authenticateUser',
      {
        username: process.env.NJTRANSIT_USERNAME,
        password: process.env.NJTRANSIT_PASSWORD,
      },
      {
        headers: {
          accept: 'text/plain',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('Authentication response:', response.data);
  } catch (error) {
    console.error('Authentication error:', error);
  }
}

testAuth();