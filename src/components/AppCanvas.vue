<script setup lang="ts">
// @ts-nocheck
import platformImgPath from '/img/platform.png';
import backgroundImgPath from '/img/background.png';
import hillsImgPath from '/img/hills.png';
import platformSmallTallImgPath from '/img/platformSmallTall.png';
import spriteRunLeftImgPath from '/img/spriteRunLeft.png';
import spriteRunRightImgPath from '/img/spriteRunRight.png';
import spriteStandLeftImgPath from '/img/spriteStandLeft.png';
import spriteStandRightImgPath from '/img/spriteStandRight.png';
import { onMounted } from 'vue';

const init = () => {
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  const platformWidth = 580;
  const platformTallWidth = 291;

  canvas.width = 1024;
  canvas.height = 576;

  const gravity = 1.5;
  let lastKey;

  class Player {
    constructor() {
      this.position = {
        x: 100,
        y: 100,
      };
      this.velocity = {
        x: 0,
        y: 0,
      };
      this.width = 66;
      this.height = 150;
      this.speed = 10;
      this.frames = 0;
      this.image = createImage(spriteStandRightImgPath);
      this.sprites = {
        stand: {
          right: createImage(spriteStandRightImgPath),
          left: createImage(spriteStandLeftImgPath),
          cropWidth: 177,
          width: 66,
        },
        run: {
          right: createImage(spriteRunRightImgPath),
          left: createImage(spriteRunLeftImgPath),
          cropWidth: 341,
          width: 127.875,
        },
      };
      this.currentSprite = this.sprites.stand.right;
      this.currentCropWidth = this.sprites.stand.cropWidth;
    }

    draw() {
      c.drawImage(
        this.currentSprite,
        this.currentCropWidth * this.frames,
        0,
        this.currentCropWidth,
        400,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    update() {
      this.frames++;

      if (
        this.frames > 59 &&
        (this.currentSprite === this.sprites.stand.right ||
          this.currentSprite === this.sprites.stand.left)
      )
        this.frames = 0;
      else if (
        this.frames > 29 &&
        (this.currentSprite === this.sprites.run.right ||
          this.currentSprite === this.sprites.run.left)
      )
        this.frames = 0;

      this.draw();

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.position.y + this.height + this.velocity.y <= canvas.height)
        this.velocity.y += gravity;
    }
  }

  class Platform {
    constructor({ x, y, width, height, image }) {
      this.position = {
        x,
        y,
      };
      this.image = image;
      this.width = width;
      this.height = height;
    }

    draw() {
      c.drawImage(this.image, this.position.x, this.position.y);
    }
  }

  class GenericObject {
    constructor({ x, y, width, height, image }) {
      this.position = {
        x,
        y,
      };
      this.image = image;
      this.width = width;
      this.height = height;
    }

    draw() {
      c.drawImage(this.image, this.position.x, this.position.y);
    }
  }

  class Goomba {
    constructor({ position }) {
      this.position = {
        x: position.x,
        y: position.y,
      };
    }
  }

  function createImage(imagePath) {
    const image = new Image();
    image.src = imagePath;

    return image;
  }

  function createImageAsync(imagePath) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        resolve(image);
      };
      image.src = imagePath;
    });
  }

  let player = new Player();
  let platforms = [];
  let genericObjects = [];

  const keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };

  let scrollOffset = 0;

  async function reloadGame() {
    const platformImage = await createImageAsync(platformImgPath);

    player = new Player();
    platforms = [
      new Platform({
        x: platformWidth * 4 + 587,
        y: 270,
        width: platformTallWidth,
        height: 20,
        image: createImage(platformSmallTallImgPath),
      }),
      new Platform({
        x: -1,
        y: 470,
        width: platformWidth,
        height: 20,
        image: platformImage,
      }),
      new Platform({
        x: platformWidth - 3,
        y: 470,
        width: platformWidth,
        height: 20,
        image: platformImage,
      }),
      new Platform({
        x: platformWidth * 2 + 100,
        y: 470,
        width: platformWidth,
        height: 20,
        image: platformImage,
      }),
      new Platform({
        x: platformWidth * 3 + 300,
        y: 470,
        width: platformWidth,
        height: 20,
        image: platformImage,
      }),
      new Platform({
        x: platformWidth * 4 + 298,
        y: 470,
        width: platformWidth,
        height: 20,
        image: platformImage,
      }),
      new Platform({
        x: platformWidth * 5 + 698,
        y: 470,
        width: platformWidth,
        height: 20,
        image: platformImage,
      }),
    ];
    genericObjects = [
      new GenericObject({
        x: -1,
        y: -1,
        width: 11643,
        height: 732,
        image: createImage(backgroundImgPath),
      }),
      new GenericObject({
        x: 0,
        y: 0,
        width: 7545,
        height: 400,
        image: createImage(hillsImgPath),
      }),
    ];

    scrollOffset = 0;
  }

  function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    genericObjects.forEach((genericObject) => {
      genericObject.draw();
    });

    platforms.forEach((platform) => {
      platform.draw();
    });

    player.update();

    if (keys.right.pressed && player.position.x < 400) {
      player.velocity.x = player.speed;
    } else if (
      (keys.left.pressed && player.position.x > 100) ||
      (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
    ) {
      player.velocity.x = -player.speed;
    } else {
      player.velocity.x = 0;

      if (keys.right.pressed) {
        scrollOffset += player.speed;
        platforms.forEach((platform) => {
          platform.position.x -= player.speed;
        });
        genericObjects.forEach((genericObject) => {
          genericObject.position.x -= player.speed * 0.66;
        });
      } else if (keys.left.pressed && scrollOffset > 0) {
        scrollOffset -= player.speed;
        platforms.forEach((platform) => {
          platform.position.x += player.speed;
        });
        genericObjects.forEach((genericObject) => {
          genericObject.position.x += player.speed * 0.66;
        });
      }
    }

    // platform collision detection
    platforms.forEach((platform) => {
      if (
        player.position.y + player.height <= platform.position.y &&
        player.position.y + player.height + player.velocity.y >=
          platform.position.y &&
        player.position.x + player.width >= platform.position.x &&
        player.position.x <= platform.position.x + platform.width
      ) {
        player.velocity.y = 0;
      }
    });

    // sprite switching condition
    if (
      keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.run.right
    ) {
      player.frames = 1;
      player.currentSprite = player.sprites.run.right;
      player.currentSprite = player.sprites.run.right;
      player.currentCropWidth = player.sprites.run.cropWidth;
      player.width = player.sprites.run.width;
    } else if (
      keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.run.left
    ) {
      player.currentSprite = player.sprites.run.left;
      player.currentCropWidth = player.sprites.run.cropWidth;
      player.width = player.sprites.run.width;
    } else if (
      !keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.stand.left
    ) {
      player.currentSprite = player.sprites.stand.left;
      player.currentCropWidth = player.sprites.stand.cropWidth;
      player.width = player.sprites.stand.width;
    } else if (
      !keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.stand.right
    ) {
      player.currentSprite = player.sprites.stand.right;
      player.currentCropWidth = player.sprites.stand.cropWidth;
      player.width = player.sprites.stand.width;
    }

    // win scenario
    if (scrollOffset >= platformWidth * 5 + 400) {
      console.log('win');
    }

    // lose scenario
    if (player.position.y > canvas.height) {
      reloadGame();
    }
  }

  reloadGame();
  animate();

  addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
      case 65:
      case 37:
        keys.left.pressed = true;
        lastKey = 'left';
        break;
      case 83:
      case 40:
        break;
      case 68:
      case 39:
        keys.right.pressed = true;
        lastKey = 'right';
        break;
      case 87:
      case 38:
        player.velocity.y -= 25;
        break;
    }
  });

  addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
      case 65:
      case 37:
        keys.left.pressed = false;
        break;
      case 83:
      case 40:
        break;
      case 68:
      case 39:
        keys.right.pressed = false;
        break;
      case 87:
      case 38:
        break;
    }
  });
};

onMounted(init);
</script>

<template>
  <canvas></canvas>
</template>

<style scoped></style>
