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
  unique
} from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("type", ["W", "B", "E"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 32 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    createdAt: timestamp("createdAt", { precision: 0, withTimezone: false })
  },
  (table) => {
    return {
      name_idx: uniqueIndex().on(table.name),
      email_idx: uniqueIndex().on(table.email)
    };
  }
);

export const networks = pgTable(
  "networks",
  {
    id: integer("id").primaryKey(),
    bssid: macaddr("bssid").notNull(),
    type: typeEnum("type").notNull()
  },
  (table) => {
    return {
      unique: unique().on(table.bssid, table.type),
      bssid_idx: index().on(table.bssid),
      type_idx: index().on(table.type)
    };
  }
);

export const observations = pgTable(
  "observations",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    networkId: integer("networkId")
      .notNull()
      .references(() => networks.id),
    ssid: varchar("ssid", { length: 248 }), // max Bluetooth ssid length
    time: timestamp("time", { precision: 0, withTimezone: false }).notNull(),
    position: geometry("position", { type: "point", mode: "xy" }).notNull(),
    altitude: smallint("altitude"),
    accuracy: real("accuracy"),
    signal: smallint("signal").notNull(),
    rcois: text("rcois"),
    mfgrid: smallint("mfgrid"),
    service: text("service")
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
