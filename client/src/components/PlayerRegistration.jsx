import React, { useState, useEffect, useCallback } from 'react';
import useWallet from '../components/ConnectWallet';
import { Box, Button, Select, Input, VStack, HStack, Image, Text, Heading, CardBody, Card, Progress, Tooltip } from '@chakra-ui/react';
import NFT from '../artifacts/CoreNFT.json';
import { ethers } from 'ethers'
import { useFetchCharacterStats } from './CharacterStats';
import CardBattleGame from '../artifacts/CardBattleGame.json';
import { useNavigate } from 'react-router-dom';

const gameContractAddress = process.env.VITE_GAME_CONTRACT;
const nftContractAddress = process.env.VITE_NFT_CONTRACT;

const saveToLocalStorage = (data, LOCAL_STORAGE_KEY) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const getFromLocalStorage = (LOCAL_STORAGE_KEY) => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

const CLASS_TO_ENUM = {
  "BARBARIAN": 0,
  "KNIGHT": 1,
  "RANGER": 2,
  "ROGUE": 3,
  "WIZARD": 4,
  "CLERIC": 5
};

function PlayerRegistration() {
  const [playerName, setPlayerName] = useState('');
  const [playerNFTs, setPlayerNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [characterStats, setCharacterStats] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [playerCharacter, setPlayerCharacter] = useState(null);
  const { signer, account } = useWallet();
  const fetchCharacterStats = useFetchCharacterStats();
  const navigate = useNavigate();

  const isWalletConnected = getFromLocalStorage('walletConnected');
  const gameContract = new ethers.Contract(gameContractAddress, CardBattleGame.abi, signer);
  const nftContract = new ethers.Contract(nftContractAddress, NFT, signer);

  const handleEnterBattle = () => {
    navigate('/home');
  };

  const tokenIDtoMetadata = async (tokenID) => {
    try {
      const data = await nftContract.tokenURI(tokenID);
      const response = await fetch(data);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      return null;
    }
  };

  const fetchPlayerNFTs = useCallback(async () => {
    setIsLoading(true);
    try {
      const isPlayer = await gameContract.isPlayer(account);
      console.log('Fetching player', isPlayer);
      setIsRegistered(isPlayer);

      if (isPlayer) {
        handleEnterBattle();
      } else {
        const balance = await nftContract.balanceOf(account);
        const storedData = getFromLocalStorage('playerNFTs');
        if (storedData && storedData.balance === balance.toString() && storedData.account === account) {
          setPlayerNFTs(storedData.nfts);
        } else {
          const nfts = [];
          for (let i = 0; i < balance; i++) {
            const tokenId = Number(await nftContract.tokenOfOwnerByIndex(account, i)) + 1;
            const metadata = await tokenIDtoMetadata(tokenId);
            if (metadata) {
              nfts.push({ tokenId: tokenId.toString(), name: metadata.name, class: metadata.attributes[1].value, image: metadata.image });
            }
          }
          setPlayerNFTs(nfts);
          saveToLocalStorage({ nfts, balance: balance.toString(), account }, 'playerNFTs');
        }
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account, gameContract, nftContract]);

  useEffect(() => {
    if (isWalletConnected) {
      fetchPlayerNFTs();
    }
  }, [isWalletConnected, account]);

  useEffect(() => {
    if (selectedNFT) {
      fetchCharacterStats(selectedNFT.class).then(stats => {
        if (stats) {
          setCharacterStats(stats);
        }
      });
    }
  }, [selectedNFT]);

  const registerPlayer = async () => {
    if (!selectedNFT) return;
    try {
      const classEnum = CLASS_TO_ENUM[selectedNFT.class.toUpperCase()];
      if (classEnum === undefined) {
        console.error("Invalid character class:", selectedNFT.class);
        return;
      }
      const tx = await gameContract.registerPlayer(playerName);
      await tx.wait();
      console.log("Player registered successfully");
      fetchPlayerNFTs(); // Refresh player data after registration
    } catch (error) {
      console.error("Error registering player:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isRegistered) {
    return (
      <VStack spacing={4} align="stretch" width="100%" maxWidth="400px" margin="auto">
        <Heading size="lg">Welcome, {playerName}!</Heading>
        {selectedNFT && (
          <Box borderWidth={1} borderRadius="lg" p={4}>
            <Image src={selectedNFT.image} alt={selectedNFT.name} borderRadius="lg" />
            <Text mt={2}>Character Class: {selectedNFT.class}</Text>
          </Box>
        )}
        {playerCharacter && characterStats && (
          <Card>
            <CardBody>
              <Heading size="md">Character Stats</Heading>
              <Text>Level: {playerCharacter.level}</Text>
              <Text>EXP: {playerCharacter.exp}</Text>
              <Text>Health: <Progress value={(Number(playerCharacter.health) / characterStats.baseHealth) * 100} size='lg' colorScheme='green' /></Text>
              <Text>Mana: <Progress value={(Number(playerCharacter.mana) / characterStats.baseMana) * 100} size='lg' colorScheme='blue' /></Text>
              <Text>Attack: <Progress value={(Number(playerCharacter.attack) / characterStats.baseAttack) * 100} size='lg' colorScheme='red' /></Text>
              <Text>Defense: <Progress value={(Number(playerCharacter.defense) / characterStats.baseDefense) * 100} size='lg' colorScheme='yellow' /></Text>
            </CardBody>
          </Card>
        )}
        <Button colorScheme="blue" onClick={handleEnterBattle}>Create Battle</Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch" width="100%" maxWidth="400px" margin="auto">
      <Heading size="lg">Register as a Player</Heading>
      <Input 
        type="text" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)} 
        placeholder="Enter player name" 
      />
      
      <Select 
        placeholder="Select an NFT" 
        onChange={(e) => setSelectedNFT(playerNFTs[e.target.value])}
      >
        {playerNFTs.map((nft, index) => (
          <option key={nft.tokenId} value={index}>
            {nft.name}
          </option>
        ))}
      </Select>
      
      {selectedNFT && (
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Image src={selectedNFT.image} alt={selectedNFT.name} borderRadius="lg" />
          <Text mt={2}>Selected Class: {selectedNFT.class}</Text>
        </Box>
      )}
      {characterStats && (
        <Card>
          <CardBody>
            <Heading size="md">Character Stats ({characterStats.class})</Heading>
            <Text>Health: <Progress value={characterStats.baseHealth} max={150} size='lg' colorScheme='green' /></Text>
            <Text>Mana: <Progress value={characterStats.baseMana} max={100} size='lg' colorScheme='blue' /></Text>
            <Text>Attack: <Progress value={characterStats.baseAttack} max={90} size='lg' colorScheme='red' /></Text>
            <Text>Defense: <Progress value={characterStats.baseDefense} max={80} size='lg' colorScheme='yellow' /></Text>
          </CardBody>
        </Card>
      )}
      
      <Button onClick={registerPlayer} colorScheme="blue">
        Register
      </Button>
    </VStack>
  );
}

export default PlayerRegistration;