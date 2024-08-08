import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const BattleGame = ({ battleId, player1, player2, isComputerOpponent, onBattleEnd }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 1024,
      height: 768,
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    const game = new Phaser.Game(config);

    let gameState;
    let player1Card, player2Card;
    let actionButtons;
    let turnText, actionLogText;
    let animationLayer;

    function preload() {
      this.load.image('background', 'path/to/your/mythical_background.jpg');
      this.load.image('card_frame', 'path/to/your/card_frame.png');
      this.load.image('player1', player1.image);
      this.load.image('player2', player2.image);
// Load the attack sprite sheet
this.load.spritesheet('attack_effect', 'path/to/your/attack_spritesheet.png', {
  frameWidth: 64,  
  frameHeight: 128 
});      this.load.image('defend_effect', 'path/to/your/defend_effect.png');
      this.load.image('special_effect', 'path/to/your/special_effect.png');
      // Load other necessary assets (fonts, button textures, etc.)
    }

    function create() {
      this.add.image(512, 384, 'background');

      // Create attack animations
      this.anims.create({
        key: 'attack_top',
        frames: this.anims.generateFrameNumbers('attack_effect', { 
          start: 0, 
          end: 3,  // Adjust based on your sprite sheet
          first: 0
        }),
        frameRate: 10,
        repeat: 0
      });

      this.anims.create({
        key: 'attack_bottom',
        frames: this.anims.generateFrameNumbers('attack_effect', { 
          start: 4, 
          end: 7,  // Adjust based on your sprite sheet
          first: 4
        }),
        frameRate: 10,
        repeat: 0
      });

      gameState = {
        player1: { ...player1, health: 100, mana: 100, shield: 0 },
        player2: { ...player2, health: 100, mana: 100, shield: 0 },
        currentTurn: 0,
        turnPlayer: 'player1',
        actionLog: [],
        actions: [
          { name: 'Attack', description: 'Deal 10-15 damage', manaCost: 1, minDamage: 10, maxDamage: 15, type: 'attack' },
          { name: 'Defend', description: 'Gain 5-10 shield', manaCost: 1, minShield: 5, maxShield: 10, type: 'defend' },
          { name: 'Special', description: 'Deal 20-30 damage\nCooldown: 3 turns', manaCost: 5, minDamage: 20, maxDamage: 30, type: 'special', cooldown: 0 }
        ]
      };

      player1Card = createPlayerCard(this, 200, 384, gameState.player1, 'left');
      player2Card = createPlayerCard(this, 824, 384, gameState.player2, 'right');

      turnText = this.add.text(512, 50, `${gameState.turnPlayer}'s Turn`, { 
        fontSize: '48px', 
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5);

      actionLogText = this.add.text(512, 700, '', { 
        fontSize: '24px', 
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);

      actionButtons = gameState.actions.map((action, index) => {
        const button = this.add.text(512 + (index - 1) * 200, 600, action.name, { 
          fontSize: '28px', 
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 4,
          backgroundColor: '#00f',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        button.on('pointerdown', () => handleAction(index));
        return button;
      });

      animationLayer = this.add.container(0, 0);

      updateUI();
    }

    function update() {
      // Add any per-frame update logic here
    }

    function createPlayerCard(scene, x, y, player, side) {
      const card = scene.add.container(x, y);
      const frame = scene.add.image(0, 0, 'card_frame').setScale(0.5);
      const portrait = scene.add.image(0, -50, player.name.toLowerCase()).setScale(0.4);
      const nameText = scene.add.text(0, 70, player.name, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
      const healthText = scene.add.text(side === 'left' ? 70 : -70, -70, '', { fontSize: '20px', fill: '#ff0' }).setOrigin(0.5);
      const manaText = scene.add.text(side === 'left' ? 70 : -70, -40, '', { fontSize: '20px', fill: '#0ff' }).setOrigin(0.5);
      const shieldText = scene.add.text(side === 'left' ? 70 : -70, -10, '', { fontSize: '20px', fill: '#f0f' }).setOrigin(0.5);

      card.add([frame, portrait, nameText, healthText, manaText, shieldText]);
      card.healthText = healthText;
      card.manaText = manaText;
      card.shieldText = shieldText;

      return card;
    }

    function handleAction(actionIndex) {
      if (gameState.turnPlayer === 'player1') {
        executeAction(gameState.actions[actionIndex], gameState.player1, gameState.player2);
      }
    }

    function executeAction(action, attacker, defender) {
      if (attacker.mana < action.manaCost) return;

      attacker.mana -= action.manaCost;
      let actionResult = '';

      switch (action.type) {
        case 'attack':
          const damage = Phaser.Math.Between(action.minDamage, action.maxDamage);
          const actualDamage = Math.max(0, damage - defender.shield);
          defender.health = Math.max(0, defender.health - actualDamage);
          defender.shield = Math.max(0, defender.shield - damage);
          actionResult = `${attacker.name} attacks for ${actualDamage} damage!`;
          playAttackAnimation(attacker === gameState.player1 ? player1Card : player2Card);
          break;
        case 'defend':
          const shield = Phaser.Math.Between(action.minShield, action.maxShield);
          attacker.shield += shield;
          actionResult = `${attacker.name} gains ${shield} shield!`;
          playAnimation('defend_effect', attacker === gameState.player1 ? player1Card : player2Card);
          break;
        case 'special':
          if (action.cooldown === 0) {
            const damage = Phaser.Math.Between(action.minDamage, action.maxDamage);
            const actualDamage = Math.max(0, damage - defender.shield);
            defender.health = Math.max(0, defender.health - actualDamage);
            defender.shield = Math.max(0, defender.shield - damage);
            actionResult = `${attacker.name} uses special attack for ${actualDamage} damage!`;
            playAnimation('special_effect', attacker === gameState.player1 ? player1Card : player2Card);
          } else {
            return; // Special still on cooldown
          }
          break;
      }

      gameState.currentTurn++;
      gameState.turnPlayer = attacker === gameState.player1 ? 'player2' : 'player1';
      gameState.actionLog.unshift(actionResult);
      if (gameState.actionLog.length > 3) gameState.actionLog.pop();

      gameState.actions = gameState.actions.map(a => ({
        ...a,
        cooldown: a.name === action.name ? (a.type === 'special' ? 3 : 0) : Math.max(0, a.cooldown - 1)
      }));

      if (defender.health <= 0) {
        onBattleEnd(battleId, attacker === gameState.player1 ? player1.address : player2.address, 100);
      }

      updateUI();

      if (gameState.turnPlayer === 'player2' && isComputerOpponent) {
        setTimeout(computerTurn, 1500);
      }
    }

    function playAnimation(effectKey, targetCard) {
      const effect = animationLayer.scene.add.image(targetCard.x, targetCard.y, effectKey).setScale(0);
      animationLayer.add(effect);

      animationLayer.scene.tweens.add({
        targets: effect,
        scale: 1,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          effect.destroy();
        }
      });
    }

    function playAttackAnimation(sourceCard) {
      const targetCard = sourceCard === player1Card ? player2Card : player1Card;

      // Create attacker's part of the animation
      const attackerSprite = animationLayer.scene.add.sprite(sourceCard.x, sourceCard.y, 'attack_effect')
        .setOrigin(0.5, 1)
        .setScale(2);
      
      // Create defender's part of the animation (flipped vertically)
      const defenderSprite = animationLayer.scene.add.sprite(targetCard.x, targetCard.y, 'attack_effect')
        .setOrigin(0.5, 0)
        .setScale(2)
        .setFlipY(true);

      animationLayer.add(attackerSprite);
      animationLayer.add(defenderSprite);

      // Play animations
      attackerSprite.play('attack_top');
      defenderSprite.play('attack_bottom');

      // Tween the sprites towards each other
      animationLayer.scene.tweens.add({
        targets: attackerSprite,
        x: (sourceCard.x + targetCard.x) / 2,
        duration: 500,
        ease: 'Power2'
      });

      animationLayer.scene.tweens.add({
        targets: defenderSprite,
        x: (sourceCard.x + targetCard.x) / 2,
        duration: 500,
        ease: 'Power2'
      });

      // Destroy sprites after animation completes
      attackerSprite.on('animationcomplete', () => {
        attackerSprite.destroy();
      });

      defenderSprite.on('animationcomplete', () => {
        defenderSprite.destroy();
      });
    }

    function computerTurn() {
      const availableActions = gameState.actions.filter(action => 
        gameState.player2.mana >= action.manaCost && action.cooldown === 0
      );

      if (availableActions.length === 0) {
        gameState.turnPlayer = 'player1';
        gameState.currentTurn++;
        gameState.player1.mana = Math.min(100, gameState.player1.mana + 1);
        gameState.player2.mana = Math.min(100, gameState.player2.mana + 1);
        updateUI();
        return;
      }

      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      executeAction(randomAction, gameState.player2, gameState.player1);
    }

    function updateUI() {
      updatePlayerCard(player1Card, gameState.player1);
      updatePlayerCard(player2Card, gameState.player2);

      turnText.setText(`${gameState.turnPlayer}'s Turn`);
      actionLogText.setText(gameState.actionLog.join('\n'));

      actionButtons.forEach((button, index) => {
        const action = gameState.actions[index];
        button.setColor(gameState.turnPlayer === 'player1' && gameState.player1.mana >= action.manaCost && action.cooldown === 0 ? '#fff' : '#888');
      });
    }

    function updatePlayerCard(card, player) {
      card.healthText.setText(`HP: ${player.health}`);
      card.manaText.setText(`MP: ${player.mana}`);
      card.shieldText.setText(`Shield: ${player.shield}`);
    }

    return () => {
      game.destroy(true);
    };
  }, [battleId, player1, player2, isComputerOpponent, onBattleEnd]);

  return <div ref={gameRef} style={{ width: '1024px', height: '768px' }} />;
};

export default BattleGame;