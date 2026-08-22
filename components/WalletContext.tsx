"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface WalletContextType {
  connector: any | null;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  networkName: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>("Midnight Network");

  const connect = async () => {
    try {
      setError(null);
      // @ts-ignore
      if (typeof window.midnight === 'undefined') {
        throw new Error("Midnight wallet extension not found. Please install Lace wallet.");
      }
      // @ts-ignore
      const midnightWallets = window.midnight || {};
      const midnightObj = midnightWallets['1am'] || midnightWallets.mnLace || Object.values(midnightWallets)[0];

      if (!midnightObj) {
         throw new Error("No Midnight wallet extension detected.");
      }

      let api;
      if (typeof midnightObj.connect === 'function') api = await midnightObj.connect();
      else if (typeof midnightObj.enable === 'function') api = await midnightObj.enable();
      else api = midnightObj;

      setConnector(api);

      let addressStr = '';
      if (typeof api.getUsedAddresses === 'function') {
        const used = await api.getUsedAddresses();
        if (Array.isArray(used) && used.length > 0) addressStr = used[0];
      } else if (typeof api.getRewardAddresses === 'function') {
        const rewards = await api.getRewardAddresses();
        if (Array.isArray(rewards) && rewards.length > 0) addressStr = rewards[0];
      } else if (typeof api.getChangeAddress === 'function') {
        addressStr = await api.getChangeAddress();
      }

      if (!addressStr) {
        let addrs: any = {};
        if (typeof api.getShieldedAddresses === 'function') addrs = await api.getShieldedAddresses();
        else if (typeof api.state === 'function') addrs = (await api.state()) || {};
        
        if (addrs && (addrs.shieldedCoinPublicKey || addrs.coinPublicKey)) {
          const pubkey = addrs.shieldedCoinPublicKey || addrs.coinPublicKey;
          addressStr = `mn_shield_${pubkey.slice(0, 10)}...${pubkey.slice(-8)}`;
        } else if (addrs && addrs.address) {
          addressStr = addrs.address;
        }
      }

      setAddress(addressStr || "Connected Wallet");
      setIsConnected(true);
      toast.success(`Connected to 1AM Wallet (${networkName})`);

      // Try to determine network from API configuration or state
      let detectedNetwork = "Midnight Preprod"; // default fallback
      try {
        if (typeof api.getConfiguration === 'function') {
           const config = await api.getConfiguration();
           if (config?.indexerUri?.includes('preview')) detectedNetwork = "Midnight Preview";
           else if (config?.indexerUri?.includes('preprod')) detectedNetwork = "Midnight Preprod";
        }
      } catch (e) {}
      setNetworkName(detectedNetwork);

    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      setError(err.message || "Failed to connect to wallet");
    }
  };

  const disconnect = () => {
    setConnector(null);
    setIsConnected(false);
    setAddress(null);
    setNetworkName("Midnight Network");
  };

  return (
    <WalletContext.Provider value={{ connector, isConnected, address, connect, disconnect, error, networkName } as any}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
