// import { builtinModules } from "node:module";

const hre = require("hardhat");
const path = require("node:path");
const fs = require("fs").promises;

const testJson = (tJson) => {
  try {
    JSON.parse(tJson);
  } catch (e) {
    return false;
  }
  return true;
};

const getPathABI = async (name) => {
  var networkinfo = await hre.ethers.provider.getNetwork();
  var savePath = path.join(
    __dirname,
    "..",
    "contractMetadata",
    "ABI-" + String(networkinfo["name"]) + "-" + String(name) + ".json"
  );
  return savePath;
};

async function readData(path) {
  try {
    const Newdata = await fs.readFile(path, "utf8");
    return Newdata;
  } catch (e) {
    console.log("e", e);
  }
}

const getPathAddress = async (name) => {
  var networkinfo = await hre.ethers.provider.getNetwork();
  var savePath = path.join(
    __dirname,
    "..",
    "contractMetadata",
    String(networkinfo["name"]) + "-" + String(name) + ".json"
  );
  return savePath;
};

const initContracts = async () => {
  const [owner] = await hre.ethers.getSigners();

  const addressEZM = JSON.parse(await readData(await getPathAddress("EZM")))["address"];
  const ABIEZM = JSON.parse(await readData(await getPathABI("EZM")))["abi"];
  let ezm = new ethers.Contract(addressEZM, ABIEZM, owner);

  return { ezm };
};


const decodeUri = (decodedJson) => {
  const metaWithoutDataURL = decodedJson.substring(decodedJson.indexOf(",") + 1);
  let buff = Buffer.from(metaWithoutDataURL, "base64");
  let text = buff.toString("ascii");
  return text;
};




const deployContracts = async () => {
  var networkinfo = await hre.ethers.provider.getNetwork();
  const blocksToWaitBeforeVerify = 5;

  const [owner] = await hre.ethers.getSigners();
  console.log({ deployer: owner.address })

  // deploy EZM
  const EZM = await hre.ethers.getContractFactory("EZM");
  const ezm = await EZM.deploy("0x0000000000000000000000000000000000000000000000000000000000000000");
  await ezm.deployed();
  var ezmAddress = ezm.address;
  log("EZM Deployed at " + String(ezmAddress));


  // verify contract if network ID is goerli or sepolia
  if (networkinfo["chainId"] == 5 || networkinfo["chainId"] == 1 || networkinfo["chainId"] == 11155111) {
    if (blocksToWaitBeforeVerify > 0) {
      log(`Waiting for ${blocksToWaitBeforeVerify} blocks before verifying`)
      await ezm.deployTransaction.wait(blocksToWaitBeforeVerify);
    }

    log("Verifying EZM Contract");
    try {
      await hre.run("verify:verify", {
        address: ezmAddress,
        constructorArguments: [],
      });
    } catch (e) {
      log({ e })
    }
  }

  return { ezm };
};

const log = (message) => {
  const printLogs = process.env.npm_lifecycle_event !== "test"
  printLogs && console.log(message)
}

module.exports = {
  decodeUri,
  initContracts,
  deployContracts,
  getPathABI,
  getPathAddress,
  readData,
  testJson
};
