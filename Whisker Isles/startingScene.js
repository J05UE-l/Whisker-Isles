export default class StartingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartingScene' });
    }

    preload() {
        this.load.image('background', 'assets/Background.jpg');
        this.load.image('isle', 'assets/Cat_island.png');
        this.load.image('play_button', 'assets/Click_to_play.png');
        this.load.image('Title frame', 'assets/Title_frame.png');
        this.load.image('Title Whisker', 'assets/Title_whisker.png');
        this.load.image('Title isle', 'assets/Title_isle.png');
    }

    create() {
        this.add.image(400, 300, 'background').setScale(1.2);
        this.add.image(660, 350, 'isle').setScale(1.2);
        const start = this.add.image(200, 430, 'play_button').setScale(0.45).setInteractive();
        this.add.image(200, 340, 'Title frame').setScale(3.4);
        this.add.image(200, 270, 'Title Whisker').setScale(0.47);
        this.add.image(200, 310, 'Title isle').setScale(0.47);

        start.on('pointerover', () => {
            start.setTint(0x00ff00);
            start.setScale(0.65);
        });

        start.on('pointerout', () => {
            start.clearTint();
            start.setScale(0.45);
        });

        start.on('pointerdown', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
    }
}
