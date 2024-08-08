import React from 'react';
import { VStack, Heading, Text, Button, Flex, Box, Spacer } from '@chakra-ui/react';
import PlayerRegistration from '../components/PlayerRegistration';
import useWallet from '../components/ConnectWallet';

function MainLP() {
    const {connectWallet, disconnectWallet, account, signer, isConnected} = useWallet();

    return (
        <Box>
          <Flex alignItems="center" justifyContent="space-between" p={4} bg="gray.100">
            <Heading size="lg">Card Battle Game</Heading>
            <Box>
              {signer ? (
                <Flex alignItems="center">
                  <Text mr={4} fontWeight="bold">Connected: {account.slice(0, 6)}...{account.slice(-4)}</Text>
                  <Button onClick={disconnectWallet} colorScheme="red" size="sm">Disconnect</Button>
                </Flex>
              ) : (
                <Button onClick={connectWallet} colorScheme="blue" size="sm">Connect Wallet</Button>
              )}
            </Box>
          </Flex>
      
          <VStack spacing={8} align="stretch" p={8}>
            <PlayerRegistration />
          </VStack>
        </Box>
      );
    }

export default MainLP;