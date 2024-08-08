import Phaser from 'phaser';

class BattleScene extends Phaser.Scene {
  constructor(battleId, player1, player2, onBattleEnd) {
    super('BattleScene');
    this.battleId = battleId;
    this.player1 = { ...player1, health: 100, mana: 0, specialCooldown: 0 };
    this.player2 = { ...player2, health: 100, mana: 0, specialCooldown: 0 };
    this.onBattleEnd = onBattleEnd;
    this.currentTurn = 0;
    this.isComputerOpponent = player2.address === 'Computer';
    this.maxMana = 10;
    this.specialManaRequired = 5;
    this.specialCooldownTurns = 3;
  }

  preload() {
    this.load.image('background', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/background.jpg');
    this.load.image(`character_${this.player1.tokenId}`, this.player1.image);
    const player2TokenId = this.isComputerOpponent ? Math.floor(Math.random() * 1000) + 1 : this.player2.tokenId;
    this.load.image(`character_${player2TokenId}`, this.player2.image);
    
    // Load UI elements
    this.load.image('card', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/card.png');
    this.load.image('mana_orb', 'https://raw.githubusercontent.com/Ash20pk/CardGame/main/client/src/assets/mana_orb.png');
  }

  create() {
    this.add.image(400, 300, 'background');

    this.createCharacterSprites();
    this.createHealthBars();
    this.createManaDisplay();
    this.createActionCards();

    if (this.isComputerOpponent) {
      this.time.addEvent({
        delay: 2000,
        callback: this.computerTurn,
        callbackScope: this,
        loop: true
      });
    }
  }

  createCharacterSprites() {
    this.player1Sprite = this.add.image(200, 300, `character_${this.player1.tokenId}`).setScale(0.5);
    const player2TokenId = this.isComputerOpponent ? Math.floor(Math.random() * 1000) + 1 : this.player2.tokenId;
    this.player2Sprite = this.add.image(600, 300, `character_${player2TokenId}`).setScale(0.5);
  }

  createHealthBars() {
    this.createHealthBar(this.player1, 50, 50);
    this.createHealthBar(this.player2, 550, 50);
  }

  createHealthBar(player, x, y) {
    const width = 200;
    const height = 20;
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(x, y, width, height);

    const bar = this.add.graphics();
    bar.fillStyle(0x00ff00, 1);
    bar.fillRect(x, y, width, height);

    const text = this.add.text(x + width / 2, y + height / 2, `${player.health}HP`, {
      fontSize: '14px',
      fill: '#000'
    }).setOrigin(0.5);

    player.healthBar = { border, bar, text };
  }

  createManaDisplay() {
    this.player1ManaOrbs = this.createManaOrbs(this.player1, 50, 80);
    this.player2ManaOrbs = this.createManaOrbs(this.player2, 550, 80);
  }

  createManaOrbs(player, x, y) {
    const orbs = [];
    for (let i = 0; i < this.maxMana; i++) {
      const orb = this.add.image(x + i * 25, y, 'mana_orb').setScale(0.5);
      orb.setTint(0x888888);
      orbs.push(orb);
    }
    return orbs;
  }

  createActionCards() {
    const cardStyle = { fontSize: '14px', fill: '#000', wordWrap: { width: 80 } };
    const y = 500;

    this.actions = [
      { name: 'Attack', description: 'Deal 10 damage', manaCost: 1, damage: 10, type: 'attack' },
      { name: 'Defend', description: 'Gain 5 shield', manaCost: 1, shield: 5, type: 'defend' },
      { name: 'Special', description: 'Deal 20 damage\nCooldown: 3 turns', manaCost: 5, damage: 20, type: 'special' }
    ];

    this.actionCards = this.actions.map((action, index) => {
      const card = this.add.image(100 + index * 150, y, 'card').setScale(0.5).setInteractive();
      const text = this.add.text(100 + index * 150, y - 30, action.name, cardStyle).setOrigin(0.5);
      const description = this.add.text(100 + index * 150, y + 10, action.description, cardStyle).setOrigin(0.5);
      const manaCost = this.add.text(100 + index * 150 - 30, y - 60, action.manaCost, { fontSize: '18px', fill: '#0000ff' }).setOrigin(0.5);

      card.on('pointerdown', () => this.useAction(index));

      return { card, text, description, manaCost };
    });

    this.updateCardsVisibility();
  }

  updateCardsVisibility() {
    const isPlayerTurn = this.currentTurn % 2 === 0;
    this.actionCards.forEach((cardObj, index) => {
      const action = this.actions[index];
      const isSpecialReady = action.type === 'special' ? this.player1.specialCooldown === 0 : true;
      const hasMana = this.player1.mana >= action.manaCost;
      cardObj.card.setAlpha(isPlayerTurn && isSpecialReady && hasMana ? 1 : 0.5);
      cardObj.card.setInteractive(isPlayerTurn && isSpecialReady && hasMana);
    });
  }

  useAction(actionIndex) {
    if (this.currentTurn % 2 !== 0) return; // Not player's turn

    const action = this.actions[actionIndex];
    if (this.player1.mana < action.manaCost) return; // Not enough mana

    this.player1.mana -= action.manaCost;
    this.updateManaDisplay(this.player1, this.player1ManaOrbs);

    if (action.type === 'attack' || action.type === 'special') {
      this.applyDamage(this.player2, action.damage);
    } else if (action.type === 'defend') {
      this.applyShield(this.player1, action.shield);
    }

    if (action.type === 'special') {
      this.player1.specialCooldown = this.specialCooldownTurns;
    }

    this.currentTurn++;
    this.updateCardsVisibility();

    if (this.player2.health <= 0) {
      this.endBattle(this.player1);
    } else {
      this.startNextTurn();
    }
  }

  computerTurn() {
    if (this.currentTurn % 2 === 0 || this.player1.health <= 0 || this.player2.health <= 0) return;

    const availableActions = this.actions.filter(action => 
      this.player2.mana >= action.manaCost && 
      (action.type !== 'special' || this.player2.specialCooldown === 0)
    );

    if (availableActions.length === 0) {
      this.currentTurn++;
      this.startNextTurn();
      return;
    }

    const randomAction = Phaser.Math.RND.pick(availableActions);
    this.player2.mana -= randomAction.manaCost;
    this.updateManaDisplay(this.player2, this.player2ManaOrbs);

    if (randomAction.type === 'attack' || randomAction.type === 'special') {
      this.applyDamage(this.player1, randomAction.damage);
    } else if (randomAction.type === 'defend') {
      this.applyShield(this.player2, randomAction.shield);
    }

    if (randomAction.type === 'special') {
      this.player2.specialCooldown = this.specialCooldownTurns;
    }

    this.currentTurn++;

    if (this.player1.health <= 0) {
      this.endBattle(this.player2);
    } else {
      this.startNextTurn();
    }
  }

  applyDamage(target, damage) {
    target.health = Math.max(0, target.health - damage);
    this.updateHealthBar(target);
  }

  applyShield(target, shield) {
    target.health = Math.min(100, target.health + shield);
    this.updateHealthBar(target);
  }

  updateHealthBar(player) {
    const { healthBar } = player;
    const width = 200 * (player.health / 100);
    healthBar.bar.clear();
    healthBar.bar.fillStyle(0x00ff00, 1);
    healthBar.bar.fillRect(healthBar.border.x, healthBar.border.y, width, 20);
    healthBar.text.setText(`${player.health}HP`);
  }

  updateManaDisplay(player, manaOrbs) {
    manaOrbs.forEach((orb, index) => {
      orb.setTint(index < player.mana ? 0x0000ff : 0x888888);
    });
  }

  startNextTurn() {
    const currentPlayer = this.currentTurn % 2 === 0 ? this.player1 : this.player2;
    currentPlayer.mana = Math.min(this.maxMana, currentPlayer.mana + 1);
    this.updateManaDisplay(this.player1, this.player1ManaOrbs);
    this.updateManaDisplay(this.player2, this.player2ManaOrbs);

    [this.player1, this.player2].forEach(player => {
      if (player.specialCooldown > 0) player.specialCooldown--;
    });

    this.updateCardsVisibility();

    if (this.isComputerOpponent && this.currentTurn % 2 !== 0) {
      this.time.delayedCall(1000, this.computerTurn, [], this);
    }
  }

  endBattle(winner) {
    const expGained = Phaser.Math.Between(50, 100);
    this.onBattleEnd(winner.address, expGained);
  }
}

export default BattleScene;