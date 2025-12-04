Step 4: Deploy to Futurenet
First, configure your identity (if not done):

bash
stellar keys generate --global alice --network futurenet
Deploy:

bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source alice \
  --network futurenet
Save the returned Contract ID - you'll need it for frontend integration.

Step 5: Test via CLI
bash
# Create a project
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network futurenet \
  -- \
  create_project \
  --client <YOUR_ADDRESS> \
  --freelancer <FREELANCER_ADDRESS> \
  --milestone_amounts '[1000, 2000]'
🌐 Test Frontend Wallet Connection
bash
cd /Users/saheelwagh/coding/polkstellar/frontend
pnpm run dev
Open http://localhost:5173
Click "Connect Stellar Wallet"
Freighter popup should appear
Approve the connection
Your address should show in the navbar
