import fs from 'node:fs/promises';
import path from 'node:path';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const ATLAS = path.resolve(ROOT, '../node_modules/us-atlas/states-10m.json');
const OUT = path.resolve(ROOT, '../src/data/us-states.json');

const topology = JSON.parse(await fs.readFile(ATLAS, 'utf8'));
const states = feature(topology, topology.objects.states);

const WIDTH = 960;
const HEIGHT = 600;

const projection = geoAlbersUsa()
  .scale(1200)
  .translate([WIDTH / 2, HEIGHT / 2]);

const pathGen = geoPath(projection);

// Round coordinates to integers to cut bytes (visually indistinguishable at
// this scale since the map renders at 960×600).
function roundPath(d) {
  return d.replace(/(-?\d+\.\d+)/g, (m) => String(Math.round(Number(m))));
}

// USPS abbreviation lookup keyed by FIPS code.
const FIPS_TO_USPS = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
  '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
  '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
  '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY',
};

const out = [];
for (const f of states.features) {
  const fips = String(f.id).padStart(2, '0');
  const code = FIPS_TO_USPS[fips];
  if (!code) continue;
  const d = pathGen(f);
  if (!d) continue;
  out.push({
    code,
    name: f.properties.name,
    d: roundPath(d),
  });
}

out.sort((a, b) => a.code.localeCompare(b.code));

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(
  OUT,
  JSON.stringify({ width: WIDTH, height: HEIGHT, states: out }, null, 0)
);
console.log(`wrote ${out.length} states to ${OUT}`);
