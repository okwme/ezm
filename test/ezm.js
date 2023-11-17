const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../scripts/utils.js");

describe("EZM Tests", function () {
  this.timeout(50000000);

  it("", async () => {
    const { ezm } = await deployContracts();

    const migrationCompleted = await ezm.migrationCompleted();
    expect(migrationCompleted).to.equal(true);
  })

});
