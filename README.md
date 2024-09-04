# LibreNetworkDB

A web app and database of wireless networks.

Built with SvelteKit, Flowbite and Tailwind.

## Running

### Prerequisites

- Postgres with Postgis (in `docker-compose.yml`)
- [Martin](https://martin.maplibre.org/) (in `docker-compose.yml`)
- [pnpm](https://pnpm.io/)

```bash
# Install dependencies
pnpm install

# Copy example config
cp src/lib/config.example.js src/lib/config.js

# Edit with your favorite text editor
$EDITOR src/lib/config.js

# Run for development
pnpm run dev
```
