import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../metamask/ContractInfo';

export const MetaMaskContext = createContext();

export const useMetaMaskContext = () => {
  return useContext(MetaMaskContext);
};

export const MetaMaskProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [accounts, setAccounts] = useState('');
  
  const [provider, setProvider] = useState();
  
  useEffect(() => {
    async function loadMetaMaskData() {
      try {
        if (window.ethereum) {
          const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
          const signer = providerInstance.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

          setProvider(providerInstance);
          setContract(contractInstance);
          
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          setAccounts(accounts);
          window.ethereum.on('accountsChanged', (newAccounts) => {
            setAccount(newAccounts[0]);
            setAccounts(newAccounts);
          });
        }
      } catch (error) {
        console.error('Error loading MetaMask data:', error);
      }
    }

    loadMetaMaskData();
  }, []);

  return (
    <MetaMaskContext.Provider value={{ contract, accounts,account,setAccount,provider }}>
      {children}
    </MetaMaskContext.Provider>
  );
};
