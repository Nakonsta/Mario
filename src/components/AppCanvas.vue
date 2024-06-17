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

import spriteMarioRunLeftImgPath from '/img/spriteMarioRunLeft.png';
import spriteMarioRunRightImgPath from '/img/spriteMarioRunRight.png';
import spriteMarioStandLeftImgPath from '/img/spriteMarioStandLeft.png';
import spriteMarioStandRightImgPath from '/img/spriteMarioStandRight.png';
import spriteMarioJumpLeftImgPath from '/img/spriteMarioJumpLeft.png';
import spriteMarioJumpRightImgPath from '/img/spriteMarioJumpRight.png';

import spriteGoombaImgPath from '/img/spriteGoomba.png';
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
      this.scale = 0.3;
      this.width = 398 * this.scale;
      this.height = 353 * this.scale;
      this.speed = 10;
      this.frames = 0;
      this.image = createImage(spriteMarioStandRightImgPath);
      this.sprites = {
        stand: {
          right: createImage(spriteMarioStandRightImgPath),
          left: createImage(spriteMarioStandLeftImgPath),
          cropWidth: 398,
          width: 398 * this.scale,
        },
        run: {
          right: createImage(spriteMarioRunRightImgPath),
          left: createImage(spriteMarioRunLeftImgPath),
          cropWidth: 398,
          width: 398 * this.scale,
        },
        jump: {
          right: createImage(spriteMarioJumpRightImgPath),
          left: createImage(spriteMarioJumpLeftImgPath),
          cropWidth: 398,
          width: 398 * this.scale,
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
        353,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    update() {
      this.frames++;

      if (
        this.frames > 58 &&
        (this.currentSprite === this.sprites.stand.right ||
          this.currentSprite === this.sprites.stand.left)
      )
        this.frames = 0;
      else if (
        this.frames > 28 &&
        (this.currentSprite === this.sprites.run.right ||
          this.currentSprite === this.sprites.run.left)
      )
        this.frames = 0;
      else if (
        this.currentSprite === this.sprites.jump.right ||
        this.currentSprite === this.sprites.jump.left
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
    constructor({ position, velocity, distance = { limit: 50, traveled: 0 } }) {
      this.position = {
        x: position.x,
        y: position.y,
      };
      this.velocity = {
        x: velocity.x,
        y: velocity.y,
      };
      this.width = 43.33;
      this.height = 50;
      this.image = createImage(spriteGoombaImgPath);
      this.frames = 0;
      this.oneFrameWidth = 130;
      this.distance = distance;
    }

    draw() {
      // c.fillStyle = 'crimson';
      // c.fillRect(this.position.x, this.position.y, this.width, this.height);

      c.drawImage(
        this.image,
        this.oneFrameWidth * this.frames,
        0,
        this.oneFrameWidth,
        150,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    update() {
      this.frames++;

      if (this.frames >= 58) {
        this.frames = 0;
      }

      this.draw();

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.position.y + this.height + this.velocity.y <= canvas.height)
        this.velocity.y += gravity;

      // walk the goomba back and forth
      this.distance.traveled += Math.abs(this.velocity.x);

      if (this.distance.traveled > this.distance.limit) {
        this.distance.traveled = 0;
        this.velocity.x = -this.velocity.x;
      }
    }
  }

  function getParticleColor() {
    const r = Math.floor(Math.random() * 75) + 150;
    const g = Math.floor(Math.random() * 70) + 30;
    const b = Math.floor(Math.random() * 10) + 10;

    return `rgb(${r}, ${g}, ${b})`;
  }

  class Particle {
    constructor({ position, velocity, radius }) {
      this.position = {
        x: position.x,
        y: position.y,
      };
      this.velocity = {
        x: velocity.x,
        y: velocity.y,
      };
      this.radius = radius;
      this.ttl = 500;
      this.color = getParticleColor();
    }

    draw() {
      c.beginPath();
      c.arc(
        this.position.x,
        this.position.y,
        this.radius,
        0,
        Math.PI * 2,
        false
      );
      c.fillStyle = this.color;
      c.fill();
      c.closePath();
    }

    update() {
      this.ttl--;
      this.draw();

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.position.y + this.radius + this.velocity.y <= canvas.height)
        this.velocity.y += gravity * 0.4;
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
  let goombas = [];
  let particles = [];

  const keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };

  let scrollOffset = 0;

  function isOnTopOfPlatform({ object, platform }) {
    return (
      object.position.y + object.height <= platform.position.y &&
      object.position.y + object.height + object.velocity.y >=
        platform.position.y &&
      object.position.x + object.width >= platform.position.x &&
      object.position.x <= platform.position.x + platform.width
    );
  }

  function collisionTop({ object1, object2 }) {
    return (
      object1.position.y + object1.height <= object2.position.y &&
      object1.position.y + object1.height + object1.velocity.y >=
        object2.position.y &&
      object1.position.x + object1.width >= object2.position.x &&
      object1.position.x <= object2.position.x + object2.width
    );
  }

  function isOnTopOfPlatformCircle({ object, platform }) {
    return (
      object.position.y + object.radius <= platform.position.y &&
      object.position.y + object.radius + object.velocity.y >=
        platform.position.y &&
      object.position.x + object.radius >= platform.position.x &&
      object.position.x <= platform.position.x + platform.width
    );
  }

  async function reloadGame() {
    const platformImage = await createImageAsync(platformImgPath);

    player = new Player();
    goombas = [
      new Goomba({
        position: {
          x: 800,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 200,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x: 1400,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
      }),
    ];
    particles = [];
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

    goombas.forEach((goomba, index) => {
      goomba.update();

      // goomba stomp squish
      if (collisionTop({ object1: player, object2: goomba })) {
        for (let i = 0; i < 50; i++) {
          particles.push(
            new Particle({
              position: {
                x: goomba.position.x + goomba.width / 2 + Math.random() * 120,
                y: goomba.position.y + goomba.height / 2 + Math.random() * 120,
              },
              velocity: {
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50,
              },
              radius: Math.random() * 7,
            })
          );
        }
        player.velocity.y -= 40;
        setTimeout(() => {
          goombas.splice(index, 1);
        }, 0);
      } else if (
        player.position.x + player.width >= goomba.position.x &&
        player.position.y + player.height >= goomba.position.y &&
        player.position.x + player.width >= goomba.position.x &&
        player.position.x <= goomba.position.x + goomba.width
      ) {
        reloadGame();
      }
    });

    particles.forEach((particle) => {
      particle.update();
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

      // scrolling code
      if (keys.right.pressed) {
        scrollOffset += player.speed;
        platforms.forEach((platform) => {
          platform.position.x -= player.speed;
        });
        genericObjects.forEach((genericObject) => {
          genericObject.position.x -= player.speed * 0.66;
        });
        goombas.forEach((goomba) => {
          goomba.position.x -= player.speed;
        });
        particles.forEach((particle) => {
          particle.position.x -= player.speed;
        });
      } else if (keys.left.pressed && scrollOffset > 0) {
        scrollOffset -= player.speed;
        platforms.forEach((platform) => {
          platform.position.x += player.speed;
        });
        genericObjects.forEach((genericObject) => {
          genericObject.position.x += player.speed * 0.66;
        });
        goombas.forEach((goomba) => {
          goomba.position.x += player.speed;
        });
        particles.forEach((particle) => {
          particle.position.x += player.speed;
        });
      }
    }

    // platform collision detection
    platforms.forEach((platform) => {
      if (isOnTopOfPlatform({ object: player, platform })) {
        player.velocity.y = 0;
      }

      // partivles bouncing
      particles.forEach((particle, index) => {
        if (isOnTopOfPlatformCircle({ object: particle, platform })) {
          particle.velocity.y = -particle.velocity.y * 0.9;
          if (particle.radius - 0.4 < 0) particles.splice(index, 1);
          else particle.radius -= 0.4;
        }

        if (particle.ttl < 0) particles.splice(index, 1);
      });

      goombas.forEach((goomba) => {
        if (isOnTopOfPlatform({ object: goomba, platform })) {
          goomba.velocity.y = 0;
        }
      });
    });

    // sprite switching condition
    if (player.velocity.y === 0) {
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
      } else if (
        !keys.right.pressed &&
        !keys.left.pressed &&
        !lastKey &&
        player.currentSprite !== player.sprites.stand.right
      ) {
        player.currentSprite = player.sprites.stand.right;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
      }
    }

    // win scenario
    if (scrollOffset >= platformWidth * 5 + 400) {
      console.log('win');
    }

    // lose scenario
    if (player.position.y > canvas.height) {
      reloadGame();
      //location.reload()
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
        if (lastKey === 'right')
          player.currentSprite = player.sprites.jump.right;
        else if (lastKey === 'left')
          player.currentSprite = player.sprites.jump.left;
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
