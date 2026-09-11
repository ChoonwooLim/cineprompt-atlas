# Orbitron deployment

Orbitron uses `orbitron.yaml` → `build.dockerfile: Dockerfile`, matching the other Docker projects on the server. Without this declaration Orbitron replaces Dockerfile with a Node 20 template, which is incompatible with this app's build tools and previously ran the build before copying the source.

The Node 22 build stage runs `npm ci --include=dev` and `npm run build:orbitron`. The nginx runtime serves the compiled React app and preview images. No Node packages, build tools or credentials are copied into the runtime image. The existing Sites/Workers build remains available through `npm run build`.

Orbitron project: `cineprompt-atlas`, GitHub branch: `main`, automatic deployment enabled. Leave the dashboard build/start command overrides empty; Dockerfile controls both. The image listens on the runtime `PORT` (default 3000), including Orbitron's automatic port reassignment. `/healthz` is the health endpoint.

The catalog is bundled at build time. Favorites and project variables retain the app's existing browser-local behavior. This deployment does not add a database or change access settings.

Validation: `npm run build:orbitron`; then verify the Orbitron Docker build, container health, HTTPS page, JS/CSS/image responses, search, category filters, prompt details and favorites in the deployed browser. The repository-wide lint command currently reports pre-existing shared component and app warnings/errors; these are separate from the deployment fix.
