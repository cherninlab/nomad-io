# Nomad-io

Nomad-io is a multiplayer survival io game.

## Setup

1. Clone the repository
    ```
    git clone https://github.com/cherninlab/nomad-io.git
    cd nomad-io
    ```
2. Install dependencies
   ```
   npm install
   ```
3. Run the development server
   ```
   npm run dev
   ```
4. In a separate terminal, run the worker development server
   ```
   npm run worker:dev
   ```
5. Open your browser and navigate to `http://localhost:5173` (or the port Vite is using).

## Building and Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Deploy the frontend to Cloudflare Pages:
   ```
   npm run deploy
   ```

3. Deploy the worker to Cloudflare Workers:
   ```
   npm run worker:deploy
   ```

## Development

- `npm run dev`: Starts the Vite development server
- `npm run worker:dev`: Starts the Wrangler development server for the worker
- `npm run build`: Builds the project for production
- `npm run preview`: Locally preview production build
- `npm run deploy`: Deploys the frontend to Cloudflare Pages
- `npm run worker:deploy`: Deploys the worker to Cloudflare Workers

## Project Structure

- `src/`: Contains the main game code
- `workers/`: Contains Cloudflare Workers scripts
- `public/`: Static assets

## License

TBD
