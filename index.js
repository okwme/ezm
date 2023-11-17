
const EZMABI = require("./contractMetadata/ABI-sepolia-EZM.json");
const EZM = require("./contractMetadata/sepolia-EZM.json"); // TODO: replace with mainnet
const EZMSepolia = require("./contractMetadata/sepolia-EZM.json");


module.exports = {
  EZM: {
    abi: EZMABI.abi,
    networks: {
      '1': EZM,
      'homestead': EZM,
      'mainnet': EZM,
      '11155111': EZMSepolia,
      'sepolia': EZMSepolia,
    },
  }
}