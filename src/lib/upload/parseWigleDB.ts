import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { TEMP_FILE_DIR, UPLOAD_PAGE_SIZE } from "$env/static/private";
import { v4 as uuid } from "uuid";
import { db } from "$lib/server/db";
import { networks, observations } from "$lib/server/db/schema.js";
import { and, eq, sql } from "drizzle-orm";

export async function parseWigleDB(file: File) {
  console.log("Parsing database...");

  // Save the file to the temporary path
  const id: string = uuid();
  const tempFilePath = path.join(TEMP_FILE_DIR, id + ".sqlite");

  const buffer = await file.arrayBuffer();
  fs.writeFileSync(tempFilePath, Buffer.from(buffer));

  // Open the SQLite database from the temporary file
  const uploadedDatabase = new sqlite3.Database(tempFilePath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    }
  });

  let offset: number = 0;

  async function processBatch(offset: number) {
    return new Promise((resolve, reject) => {
      uploadedDatabase.all(
        "SELECT level, lat, lon, altitude, accuracy, time, location.mfgrid, network.bssid, ssid, frequency, capabilities, type, rcois, service, capabilities FROM location INNER JOIN network ON network.bssid = location.bssid WHERE network.type IN ('W', 'B', 'E') LIMIT ? OFFSET ?",
        [UPLOAD_PAGE_SIZE, offset],
        async (err, rows) => {
          if (err) {
            console.error("Error querying the database:", err.message);
            return reject(err);
          }

          if (rows.length === 0) {
            console.log("Nothing");
            return resolve(false); // No more data to process
          }

          try {
            const insertPromises = rows.map(async (row: any) => {
              const networkData = {
                bssid: row.bssid,
                type: row.type
              };

              let lData = {
                userId: "00000000-00000000-00000000-00000000",
                networkId: 1,
                ssid: removeNullBytes(row.ssid),
                time: new Date(row.time),
                // possibly https://github.com/drizzle-team/drizzle-orm/issues/2675
                //position: { x: row.lon, y: row.lat, srid: 4326 },
                position: sql`ST_SetSRID(ST_MakePoint(${row.lon.toFixed(7)}, ${row.lat.toFixed(7)}), 4326)`,
                altitude: Number(row.altitude).toFixed(0),
                accuracy: Number(row.accuracy).toFixed(4),
                signal: Number(row.level).toFixed(0),
                service: row.service,
                capabilities: row.capabilities
              };

              return (async () => {
                let insertedNetwork = await db
                  .insert(networks)
                  .values(networkData)
                  .onConflictDoNothing()
                  .returning({ id: networks.id });
                if (insertedNetwork[0] === undefined) {
                  insertedNetwork = await db
                    .select({ id: networks.id })
                    .from(networks)
                    .where(
                      and(
                        eq(networks.bssid, networkData.bssid),
                        eq(networks.type, networkData.type)
                      )
                    );
                }
                lData.networkId = insertedNetwork[0].id;
                await db.insert(observations).values(lData).onConflictDoNothing();
              })();
            });

            // Execute all insertions
            await Promise.all(insertPromises);
            console.log(
              `Inserted ${insertPromises.length} records successfully into the new database.`
            );

            resolve(true);
          } catch (insertError) {
            console.error("Error inserting data into the new database:", insertError.message);
            reject(insertError);
          }
        }
      );
    });
  }

  async function processAllData() {
    let hasMoreData = true;

    while (hasMoreData) {
      hasMoreData = await processBatch(offset);
      offset += Number(UPLOAD_PAGE_SIZE);
    }

    console.log("All data processed successfully.");
  }

  processAllData()
    .then(() => {
      uploadedDatabase.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        }
        fs.unlinkSync(tempFilePath);
      });
    })
    .catch((error) => {
      console.error("Error processing data:", error);
      uploadedDatabase.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
        }
        fs.unlinkSync(tempFilePath);
      });
    });
}

function removeNullBytes(str: string) {
  return str
    .split("")
    .filter((char) => char.codePointAt(0))
    .join("");
}
