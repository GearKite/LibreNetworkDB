-- Poor person's trilateration
WITH center_points AS (
  SELECT
    "networkId",
    (MIN(ST_X(position)) + MAX(ST_X(position))) / 2 AS center_x,
    (MIN(ST_Y(position)) + MAX(ST_Y(position))) / 2 AS center_y
  FROM observations
  GROUP BY "networkId"
)
UPDATE networks
SET location = ST_MakePoint(center_x, center_y)
FROM center_points
WHERE networks.id = center_points."networkId"