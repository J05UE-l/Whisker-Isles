export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Carregar os recursos necessários
        this.load.image('background', 'assets/Background.jpg');
        this.load.spritesheet('cat', 'assets/BurmeseCatAnimationSheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('charging', 'assets/Charging.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('Reviving', 'assets/Revive.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('merchant', 'assets/merchant.png', { frameWidth: 94, frameHeight: 91 });
        this.load.tilemapTiledJSON('map', 'assets/Rogue_cat_v3.json');
        this.load.image('tiles', 'assets/Ground_tiles.png');
        this.load.image('props', 'assets/Props.png');
        this.load.image('sardine', 'assets/sardine.png');
        this.load.image('Title frame', 'assets/Title_frame.png');
    }

    create() {
        // Configurar a cena inicial
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.add.image(1600, 320, 'background');
        this.add.image(120, 80, 'Title frame').setScrollFactor(0).setScale(2);
        this.add.image(80, 55, 'sardine').setScale(0.24).setScrollFactor(0).setDepth(11);
        this.cat = this.physics.add.sprite(200, 288, 'cat').setScale(2).setDepth(6);//personagem principal
        const sardine = this.physics.add.image(1220, 240, 'sardine').setScale(0.15).setDepth(10);
        sardine.body.setAllowGravity(false);//gravidade
        let points = 0;
        const score = this.add.text(140, 30, points, { fontSize: '60px', fill: '#000000' }).setScrollFactor(0);//adicionar score
        //adicionar mapa do tiled
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("Ground_tiles", "tiles");
        const props = map.addTilesetImage("Props", "props");
        const layer1 = map.createLayer("Islands", tileset, 0, 0).setDepth(1);
        const layer2 = map.createLayer("Back portion of the island", props, 0, 0).setDepth(2);
        const layer3 = map.createLayer("main structures", props, 0, 0).setDepth(3);
        const layer4 = map.createLayer("details", props, 0, 0).setDepth(4);

        layer1.setCollisionByExclusion(-1);//colisão do gato com o mapa
        this.physics.add.collider(this.cat, layer1);
        
        this.physics.add.overlap(this.cat, sardine, () => {
            sardine.setVisible(false);
            const posSardine_X = Phaser.Math.RND.between(650, 1800);
            sardine.setPosition(posSardine_X, 100);
            points += 1;
            score.setText(points);
            sardine.setVisible(true);
        });
        //camera seguir o gato
        this.cameras.main.startFollow(this.cat);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.chargingSprite = this.add.sprite(this.cat.x, this.cat.y, 'charging').setVisible(false).setScale(3).setDepth(9);
        this.chargingSprite.setAlpha(0.7);
        this.Rev = this.add.sprite(this.cat.x, this.cat.y, 'Reviving').setVisible(false).setScale(2).setDepth(10);
        this.teclado = this.input.keyboard.createCursorKeys();
        //criar animações
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('cat', { start: 8, end: 20 }),
            frameRate: 19,
            repeat: -1
        });
        this.anims.create({
            key: 'rise',
            frames: this.anims.generateFrameNumbers('cat', { start: 48, end: 50 }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('cat', { start: 51, end: 52 }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({
            key: 'crouch',
            frames: this.anims.generateFrameNumbers('cat', { start: 32, end: 43 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'landing',
            frames: this.anims.generateFrameNumbers('cat', { start: 56, end: 60 }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({
            key: 'charge',
            frames: this.anims.generateFrameNumbers('charging', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'revive',
            frames: this.anims.generateFrameNumbers('Reviving', { start: 0, end: 14 }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({
            key: 'merchant',
            frames: this.anims.generateFrameNumbers('merchant', { start: 0, end: 5 }),
            frameRate: 4,
            repeat: -1
        });

        const merchant = this.add.sprite(300, 288, 'merchant').setDepth(1);
        merchant.anims.play('merchant', true);
    }

    update() {
        //controles do gato
        if (this.teclado.left.isDown) {
            this.cat.setVelocityX(-150);
            this.cat.anims.play('walk', true);
            this.cat.flipX = false;
        } else if (this.teclado.right.isDown) {
            this.cat.setVelocityX(150);
            this.cat.anims.play('walk', true);
            this.cat.flipX = true;
        } else {
            this.cat.setVelocityX(0);
            this.cat.anims.play('idle', true);
            this.power = 2;
        }

        if (this.teclado.down.isDown && this.cat.body.blocked.down) {
            this.cat.anims.play('crouch', true);
            this.cat.setVelocityX(0);
            this.charge();
            this.power = setInterval(this.increasePower.bind(this), 1200);
            if (this.power === 5) {
                clearInterval(this.power);
            }
            if (this.power > 5) {
                this.power = 5;
            }
        } else {
            this.chargingSprite.setVisible(false);
            clearInterval(this.power);
        }

        if (this.teclado.up.isDown && this.cat.body.blocked.down) {
            this.cat.setVelocityY(-150 * this.power / 3);
            this.power = 2;
        }

        if (this.cat.body.velocity.y < 0) {
            this.cat.anims.play('rise', true);
        } else if (this.cat.body.velocity.y > 0) {
            this.cat.anims.play('fall', true);
        }
        //reset do gato caso caia do mapa
        if (this.cat.y > 640) {
            this.revive();
        }
        this.Rev.setPosition(this.cat.x, this.cat.y);
        this.chargingSprite.setPosition(this.cat.x, this.cat.y + 10);
    }

    increasePower() {
        this.power += 0.5;
    }

    charge() {//carregar pulo
        this.chargingSprite.setVisible(true);
        this.chargingSprite.anims.play('charge', true);
    }

    revive() {//reset do gato caso caia do mapa
        this.cat.setPosition(200, 288);
        this.cat.setVelocity(0, 0);
        this.Rev.setVisible(true);
        this.Rev.anims.play('revive', true);
        setTimeout(() => {
            this.Rev.setVisible(false);
        }, 1000);
    }
}
