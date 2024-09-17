// pages/index.js
"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { getERC20Contract } from "../lib/erc";
import styles from './style.module.css';

export default function Index() {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);

      // Load the ERC-20 contract
      const contract = getERC20Contract("YOUR_ERC20_CONTRACT_ADDRESS", signer);
      setContract(contract);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const signPermit = async () => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const spender = "SPENDER_ADDRESS";
    const value = ethers.utils.parseUnits("100", 18); // e.g., 100 tokens

    // Get the token's nonce
    const nonce = await contract.nonces(address);

    // Domain data
    const domain = {
      name: await contract.name(),
      version: "1",
      chainId: await signer.getChainId(),
      verifyingContract: contract.address,
    };

    // Permit message
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const message = {
      owner: address,
      spender: spender,
      value: value.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toString(),
    };

    // Sign the permit
    const signature = await signer._signTypedData(domain, types, message);
    const { r, s, v } = ethers.utils.splitSignature(signature);

    // Now you can call the permit function with the signed data
    await contract.permit(address, spender, value, deadline, v, r, s);
  };

  return (
    <div className={styles.div}>
      <button onClick={connectWallet} className={styles.connect}>Connect Wallet</button>
      <button onClick={signPermit} className={styles.disabled} disabled={!contract}>
        Sign Permit
      </button>
    </div>
  );
}
