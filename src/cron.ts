import cron from 'node-cron';
import NJTransitBusData from './api/njtransit';
import { createClient } from './db/client';
import { busLocations } from './db/schema';
import 'dotenv/config';

async function fetchAndStoreBusData() {
  try {
    const njTransit = new NJTransitBusData(
      process.env.NJTRANSIT_USERNAME || '',
      process.env.NJTRANSIT_PASSWORD || '',
      true
    );
    const db = createClient('nonprod');

    const locations = await njTransit.getVehicleLocations(39.2776, -74.5750, 5000, 'ALL');

    // Filter for routes 507 and 509
    const filteredLocations = locations.filter(loc => ['507', '509'].includes(loc.VehicleRoute));

    // Deduplicate by VehicleID and VehicleInternalTripNumber
    const uniqueLocations = Array.from(
      new Map(
        filteredLocations.map((loc) => [`${loc.VehicleID}-${loc.VehicleInternalTripNumber}`, loc])
      ).values()
    );

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
      console.log(`[${new Date().toISOString()}] Inserted ${uniqueLocations.length} bus locations for routes 507/509`);
    } else {
      console.log(`[${new Date().toISOString()}] No bus locations found for routes 507/509`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching/storing bus data:`, error);
  }
}

// Schedule to run every 5 minutes
cron.schedule('*/5 * * * *', fetchAndStoreBusData, {
  timezone: 'America/New_York',
});

console.log('Cron job started, fetching bus data for routes 507/509 every 5 minutes');