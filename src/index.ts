import NJTransitBusData from './api/njtransit';
import { createClient } from './db/client';
import { busLocations } from './db/schema';
import 'dotenv/config';

async function main() {
  console.log('Environment variables:', {
    username: process.env.NJTRANSIT_USERNAME,
    password: process.env.NJTRANSIT_PASSWORD ? '****' : undefined,
    supabaseUrl: process.env.SUPABASE_URL_NONPROD?.replace(/:([^@]+)@/, ':****@'),
  });

  const njTransit = new NJTransitBusData(
    process.env.NJTRANSIT_USERNAME || '',
    process.env.NJTRANSIT_PASSWORD || '',
    true // Use Production API
  );
  const db = createClient('nonprod');

  // Test getLocations endpoint
  console.log('Testing getLocations endpoint...');
  const locationsList = await njTransit.getLocations('ALL');
  console.log('Locations retrieved:', locationsList.length);

  // Test getVehicleLocations with Ocean City
  console.log('Fetching buses near Ocean City...');
  let locations = await njTransit.getVehicleLocations(39.2776, -74.5750, 5000, 'ALL');

  // Filter for routes 507 and 509
  let filteredLocations = locations.filter(loc => ['507', '509'].includes(loc.VehicleRoute));

  // Deduplicate by VehicleID and VehicleInternalTripNumber
  let uniqueLocations = Array.from(
    new Map(
      filteredLocations.map((loc) => [`${loc.VehicleID}-${loc.VehicleInternalTripNumber}`, loc])
    ).values()
  );

  if (uniqueLocations.length === 0) {
    console.log('No buses found near Ocean City for routes 507/509, trying Newark...');
    locations = await njTransit.getVehicleLocations(40.736431, -74.167305, 5000, 'ALL');
    filteredLocations = locations.filter(loc => ['507', '509'].includes(loc.VehicleRoute));
    uniqueLocations = Array.from(
      new Map(
        filteredLocations.map((loc) => [`${loc.VehicleID}-${loc.VehicleInternalTripNumber}`, loc])
      ).values()
    );
  }

  console.log('Unique locations to insert for routes 507/509:', uniqueLocations.length);

  if (uniqueLocations.length > 0) {
    await db.insert(busLocations).values(
      uniqueLocations.map((loc) => ({
        vehicleId: loc.VehicleID,
        latitude: loc.VehicleLat,
        longitude: loc.VehicleLong,
        route: loc.VehicleRoute,
        destination: loc.VehicleDestination,
        passengerLoad: loc.VehiclePassengerLoad,
        distanceMiles: loc.VehicleDistanceMiles,
        internalTripNumber: loc.VehicleInternalTripNumber,
        scheduledDeparture: new Date(loc.VehicleScheduledDeparture),
      }))
    );
    console.log('Inserted', uniqueLocations.length, 'bus locations for routes 507/509');
  } else {
    console.log('No bus locations to insert for routes 507/509');
  }
}

main().catch(console.error);