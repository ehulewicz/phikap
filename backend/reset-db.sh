rm -rf ./.wrangler/state/v3/d1 &&
wrangler d1 execute phikap-db --local --file=./schema.sql &&
wrangler d1 execute phikap-db --local --file=./seed.sql &&
npm run dev -- --local &
cd ../frontend && npm run dev
