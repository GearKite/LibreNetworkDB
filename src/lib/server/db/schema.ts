import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  smallint,
  geometry,
  real,
  macaddr,
  varchar,
  pgEnum,
  uuid,
  index,
  uniqueIndex,
  primaryKey,
  unique,
  bigint
} from "drizzle-orm/pg-core";

// Enum for network types
export const typeEnum = pgEnum("type", ["W", "B", "E"]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 32 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt", { precision: 0, withTimezone: false }).defaultNow()
  },
  (table) => {
    return {
      name_idx: uniqueIndex().on(table.name),
      email_idx: uniqueIndex().on(table.email)
    };
  }
);

// Networks table
export const networks = pgTable(
  "networks",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
    bssid: macaddr("bssid").notNull(),
    type: typeEnum("type").notNull()
  },
  (table) => {
    return {
      unique: unique().on(table.bssid, table.type), // there can only be 1 network for this combination
      bssid_idx: index().on(table.bssid),
      type_idx: index().on(table.type)
    };
  }
);

// Observations table
export const observations = pgTable(
  "observations",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    networkId: bigint("networkId", { mode: "number" })
      .notNull()
      .references(() => networks.id),
    ssid: varchar("ssid", { length: 248 }), // max Bluetooth ssid length
    time: timestamp("time", { precision: 0, withTimezone: false }).notNull(),
    position: geometry("position", { type: "point", mode: "xy", srid: 4326 }).notNull(),
    altitude: integer("altitude"),
    accuracy: real("accuracy"),
    signal: smallint("signal").notNull(),
    service: text("service"),
    capabilities: text("capabilities")
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.networkId, table.time, table.position]
      }),
      userId_idx: index().on(table.userId),
      networkId_idx: index().on(table.networkId),
      ssid_idx: index().on(table.ssid),
      time_idx: index().on(table.time),
      position_idx: index().using("gist", table.position)
    };
  }
);
