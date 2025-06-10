CREATE TABLE "bus_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"route" text NOT NULL,
	"destination" text NOT NULL,
	"passenger_load" text NOT NULL,
	"distance_miles" numeric NOT NULL,
	"internal_trip_number" text NOT NULL,
	"scheduled_departure" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
