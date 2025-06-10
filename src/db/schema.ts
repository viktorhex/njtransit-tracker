import { pgTable, serial, text, timestamp, decimal } from 'drizzle-orm/pg-core';

export const busLocations = pgTable('bus_locations', {
  id: serial('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  latitude: decimal('latitude').notNull(),
  longitude: decimal('longitude').notNull(),
  route: text('route').notNull(),
  destination: text('destination').notNull(),
  passengerLoad: text('passenger_load').notNull(),
  distanceMiles: decimal('distance_miles').notNull(),
  internalTripNumber: text('internal_trip_number').notNull(),
  scheduledDeparture: timestamp('scheduled_departure').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
