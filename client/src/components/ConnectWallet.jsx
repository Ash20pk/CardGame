import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

export default function useWallet() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);

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
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      console.log("Ethereum object not found, install MetaMask.");
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount("");
    setSigner(null);
    setIsConnected(false);
    localStorage.setItem('walletConnected', 'false');
  }, []);

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
    };
  }, [checkConnection, disconnectWallet]);

  return { connectWallet, disconnectWallet, signer, provider, account, isConnected };
}