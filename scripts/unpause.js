const { initContracts } = require("./utils");

//npx hardhat node
//npx hardhat run --network localhost scripts/Unpause.js

async function main() {
  const { ezm } = await initContracts();
  await ezm.setPause(false);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
