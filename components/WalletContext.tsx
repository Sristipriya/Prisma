"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
      setIsConnected(true);
      
      let state = null;
      if (typeof api.state === 'function') state = await api.state();
      else if (typeof api.getState === 'function') state = await api.getState();
      
      if (state && state.address) {
         setAddress(state.address);
      } else {
         setAddress("Connected Wallet");
      }

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
