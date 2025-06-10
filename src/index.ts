import NJTransitBusData from './api/njtransit';
import { createClient } from './db/client';
import { busLocations } from './db/schema';
import 'dotenv/config';

async function main() {
  const njTransit = new NJTransitBusData(
    process.env.NJTRANSIT_USERNAME || '',
    process.env.NJTRANSIT_PASSWORD || '',
    false
  );
  const db = createClient('nonprod');

  // Test getLocations endpoint
  console.log('Testing getLocations endpoint...');
  const locationsList = await njTransit.getLocations('ALL');
  console.log('Locations retrieved:', locationsList.length);

  // Test getVehicleLocations with Ocean City
  console.log('Fetching buses near Ocean City...');
  let locations = await njTransit.getVehicleLocations(39.2776, -74.5750, 5000, 'ALL');

  if (locations.length === 0) {
    console.log('No buses found near Ocean City, trying Newark...');
    locations = await njTransit.getVehicleLocations(40.736431, -74.167305, 5000, 'ALL');
  }

  await db.insert(busLocations).values(
    locations.map((loc) => ({
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

  console.log('Inserted', locations.length, 'bus locations');
}

main().catch(console.error);