import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { OnChainWhitelistContract } from "../typechain";

export interface Signers {
  admin: SignerWithAddress;
  user: SignerWithAddress;
  all: SignerWithAddress[];
}

describe("On-chain whitelist", function () {
  before(async function () {
    this.signers = {} as Signers;
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user = signers[1];
    this.signers.all = signers.slice(2);
  });

  beforeEach(async function () {
    this.contract as OnChainWhitelistContract;
    this.contract = await ethers.deployContract("OnChainWhitelistContract");
  });

  it("Add to whitelist", async function () {
    await this.contract.addToWhitelist([
      this.signers.all[0].address,
      this.signers.all[1].address,
      this.signers.all[2].address,
    ]);

    expect(await this.contract.whitelist(this.signers.all[0].address)).to.equal(
      true
    );
    expect(await this.contract.whitelist(this.signers.all[1].address)).to.equal(
      true
    );
    expect(await this.contract.whitelist(this.signers.all[2].address)).to.equal(
      true
    );
    expect(await this.contract.whitelist(this.signers.all[3].address)).to.equal(
      false
    );
  });

  it("Remove from whitelist", async function () {
    await this.contract.addToWhitelist([
      this.signers.all[0].address,
      this.signers.all[1].address,
      this.signers.all[2].address,
    ]);

    await this.contract.removeFromWhitelist([
      this.signers.all[0].address,
      this.signers.all[2].address,
    ]);

    expect(await this.contract.whitelist(this.signers.all[0].address)).to.equal(
      false
    );
    expect(await this.contract.whitelist(this.signers.all[1].address)).to.equal(
      true
    );
    expect(await this.contract.whitelist(this.signers.all[2].address)).to.equal(
      false
    );
  });

  it("Should revert NOT_IN_WHITELIST", async function () {
    await expect(
      this.contract.connect(this.signers.user).whitelistFunc()
    ).to.be.revertedWith("NOT_IN_WHITELIST");
  });

  it("Should pass whitelist check", async function () {
    await this.contract.addToWhitelist([this.signers.user.address]);
    await expect(this.contract.connect(this.signers.user).whitelistFunc()).to.be
      .not.reverted;
  });
});
