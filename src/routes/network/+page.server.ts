import type { Load } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { eq, sql, desc } from "drizzle-orm";
import { networks, observations } from "$lib/server/db/schema";

export interface Network {
  id: number;
  bssid: string;
  type: string;
  location: { x: number; y: number } | null;
  ssid: string | null;
}

export interface Observation {
  ssid: string | null;
  time: string;
  position: { x: number; y: number };
  altitude: number | string;
  accuracy: number | string;
  signal: number | string;
  service: string;
  capabilities: string;
}

export const load: Load = async ({ url }) => {
  const networkId = Number(url.searchParams.get("i"));

  let networkData: Network | null = null;
  let observationData: Observation[] | null = null;

  if (networkId) {
    const networkQuery = db
      .select({
        id: networks.id,
        bssid: networks.bssid,
        type: networks.type,
        location: networks.location,
        ssid: observations.ssid
      })
      .from(networks)
      .innerJoin(observations, eq(networks.id, observations.networkId))
      .where(eq(networks.id, networkId))
      .groupBy(networks.id, observations.ssid)
      .limit(1);

    const observationsQuery = db
      .select({
        ssid: observations.ssid,
        time: sql`to_char(time, 'YYYY-MM') as time`,
        position: observations.position,
        altitude: observations.altitude,
        accuracy: observations.accuracy,
        signal: observations.signal,
        service: observations.service,
        capabilities: observations.capabilities
      })
      .from(observations)
      .where(eq(observations.networkId, networkId))
      .orderBy(desc(observations.signal))
      .limit(1000);

    try {
      // Execute the queries
      const networkResults = await networkQuery;
      networkData = networkResults[0] || null;

      const observationResults = await observationsQuery;
      // @ts-ignore
      observationData = observationResults || null;
    } catch (e) {
      console.error("Database query error:", e);
    }
  }

  // Return the data to the component
  return {
    networkData,
    observationData
  };
};
