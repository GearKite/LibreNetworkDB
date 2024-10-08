// src/routes/api/search.ts
import { json, type RequestHandler, error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { and, ilike, eq, count, sql, desc, min, max } from "drizzle-orm";
import { networks, observations } from "$lib/server/db/schema";
import type { PgColumn, SQL } from "drizzle-orm/pg-core";

export const GET: RequestHandler = async ({ url }) => {
  let bssid = url.searchParams.get("bssid");
  let ssid = url.searchParams.get("ssid");
  let networkType = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") || "0", 10);
  let orderStr = url.searchParams.get("order");

  if (bssid === null || bssid === "") bssid = "%";
  if (ssid === null || ssid === "") ssid = "%";
  if (networkType === null || networkType === "") networkType = "W";

  let order: PgColumn | SQL | SQL.Aliased = networks.id;
  if (orderStr === "firstSeen") order = desc(min(observations.time));
  if (orderStr === "lastSeen") order = desc(max(observations.time));
  if (orderStr === "observationCount") order = desc(count(observations));
  if (orderStr === "bssid") order = networks.bssid;

  const query = db
    .select({
      id: networks.id,
      bssid: networks.bssid,
      type: networks.type,
      location: networks.location,
      ssid: observations.ssid,
      observationCount: count(observations),
      firstSeen: sql`date_trunc('hour', min(observations.time))`,
      lastSeen: sql`date_trunc('hour', max(observations.time))`
    })
    .from(networks)
    .innerJoin(observations, eq(networks.id, observations.networkId))
    .where(
      and(
        ilike(networks.bssid, bssid),
        ilike(observations.ssid, ssid),
        // @ts-ignore
        eq(networks.type, networkType)
      )
    )
    .groupBy(networks.id, observations.ssid)
    .orderBy(order)
    .limit(100)
    .offset(page * 100);

  try {
    // Execute the query
    const results = await query;

    return json(results);
  } catch (e) {
    console.error("Database query error:", e);
    return error(500, e);
  }
};
