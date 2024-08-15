import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import useSound from 'use-sound';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const [play, { stop }] = useSound('/assets/bgMusic.mp3', { 
    loop: true,
    volume: 0.5 // Adjust this value as needed
  });

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setAccount(accounts[0]);
        setSigner(signer);
        setIsConnected(true);
        setProvider(provider);
        localStorage.setItem('walletConnected', 'true');
        play(); // Start playing music when wallet is connected
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      console.log("Ethereum object not found, install MetaMask.");
    }
  }, [play]);

  const disconnectWallet = useCallback(() => {
    setAccount("");
    setSigner(null);
    setIsConnected(false);
    localStorage.setItem('walletConnected', 'false');
    stop(); // Stop playing music when wallet is disconnected
  }, [stop]);

  const checkConnection = useCallback(async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0 && localStorage.getItem('walletConnected') === 'true') {
        connectWallet();
      } else {
        disconnectWallet();
      }
    }
  }, [connectWallet, disconnectWallet]);

  useEffect(() => {
    checkConnection();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        play(); // Start playing music when account changes to a connected state
      } else {
        disconnectWallet();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('disconnect', disconnectWallet);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('disconnect', disconnectWallet);
      }
      stop(); // Ensure music stops when component unmounts
    };
  }, [checkConnection, disconnectWallet, play, stop]);

  return (
    <WalletContext.Provider value={{ connectWallet, disconnectWallet, signer, provider, account, isConnected }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Default export
const ConnectWallet = { WalletProvider, useWallet };
export default ConnectWallet;