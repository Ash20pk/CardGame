import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Box } from '@chakra-ui/react';
import BattleScene from './BattleScene';

const BattleGame = ({ battleId, player1, player2, onBattleEnd }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 600,
      scene: [new BattleScene(battleId, player1, player2, onBattleEnd)]
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, [battleId, player1, player2, onBattleEnd]);

  return <Box ref={gameRef} width="800px" height="600px" />;
};

export default BattleGame;