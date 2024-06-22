<script setup lang="ts">
// @ts-nocheck
import { onMounted } from 'vue';
import {
  isOnTopOfPlatform,
  collisionTop,
  isOnTopOfPlatformCircle,
  createImage,
  createImageAsync,
  hitBottomOfPlatform,
  hitSideOfPlatform,
  objectsTouch,
} from '@/utils';
import platformImgPath from '/img/platform.png';
import backgroundImgPath from '/img/background.png';
import mdPlatformImgPath from '/img/mdPlatform.png';
import lgPlatformImgPath from '/img/lgPlatform.png';
import tPlatformImgPath from '/img/tPlatform.png';
import xtPlatformImgPath from '/img/xtPlatform.png';
import hillsImgPath from '/img/hills.png';
import platformSmallTallImgPath from '/img/platformSmallTall.png';
import blockImgPath from '/img/block.png';
import blockTriImgPath from '/img/blockTri.png';
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
import spriteFireFlowerRunLeftImgPath from '/img/spriteFireFlowerRunLeft.png';
import spriteFireFlowerRunRightImgPath from '/img/spriteFireFlowerRunRight.png';
import spriteFireFlowerStandLeftImgPath from '/img/spriteFireFlowerStandLeft.png';
import spriteFireFlowerStandRightImgPath from '/img/spriteFireFlowerStandRight.png';
import spriteFireFlowerJumpLeftImgPath from '/img/spriteFireFlowerJumpLeft.png';
import spriteFireFlowerJumpRightImgPath from '/img/spriteFireFlowerJumpRight.png';
import spriteGoombaImgPath from '/img/spriteGoomba.png';
import spriteFireFlowerImgPath from '/img/spriteFireFlower.png';

const init = () => {
  const canvas = document.querySelector('canvas');
  const c = canvas.getContext('2d');
  const platformWidth = 580;
  const platformTallWidth = 291;
  const platformLgWidth = 910;
  const platformTWidth = 228;
  const platformXtWidth = 229;
  const blockWidth = 51;
  const blockTriWidth = 152;

  canvas.width = 1024;
  canvas.height = 576;

  const gravity = 1.5;
  const goombaWidth = 43.33;
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
          fireFlower: {
            right: createImage(spriteFireFlowerStandRightImgPath),
            left: createImage(spriteFireFlowerStandLeftImgPath),
          },
        },
        run: {
          right: createImage(spriteMarioRunRightImgPath),
          left: createImage(spriteMarioRunLeftImgPath),
          fireFlower: {
            right: createImage(spriteFireFlowerRunRightImgPath),
            left: createImage(spriteFireFlowerRunLeftImgPath),
          },
        },
        jump: {
          right: createImage(spriteMarioJumpRightImgPath),
          left: createImage(spriteMarioJumpLeftImgPath),
          fireFlower: {
            right: createImage(spriteFireFlowerJumpRightImgPath),
            left: createImage(spriteFireFlowerJumpLeftImgPath),
          },
        },
      };
      this.currentSprite = this.sprites.stand.right;
      this.currentCropWidth = 398;
      this.powerUps = {
        fireFlower: false,
      };
      this.invincible = false;
      this.opacity = 1;
    }

    draw() {
      c.save();
      c.globalAlpha = this.opacity;
      // c.fillStyle = 'rgba(255, 255, 255, 0.5)';
      // c.fillRect(this.position.x, this.position.y, this.width, this.height);
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
      c.restore();
    }

    update() {
      this.frames++;
      const { currentSprite, sprites } = this;

      if (
        this.frames > 58 &&
        (currentSprite === sprites.stand.right ||
          currentSprite === sprites.stand.left ||
          currentSprite === sprites.stand.fireFlower.right ||
          currentSprite === sprites.stand.fireFlower.left)
      )
        this.frames = 0;
      else if (
        this.frames > 28 &&
        (currentSprite === sprites.run.right ||
          currentSprite === sprites.run.left ||
          currentSprite === sprites.run.fireFlower.right ||
          currentSprite === sprites.run.fireFlower.left)
      )
        this.frames = 0;
      else if (
        currentSprite === sprites.jump.right ||
        currentSprite === sprites.jump.left ||
        currentSprite === sprites.jump.fireFlower.right ||
        currentSprite === sprites.jump.fireFlower.left
      )
        this.frames = 0;

      this.draw();

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.position.y + this.height + this.velocity.y <= canvas.height)
        this.velocity.y += gravity;

      if (this.invincible) {
        if (this.opacity === 1) this.opacity = 0;
        else this.opacity = 1;
      } else this.opacity = 1;
    }
  }

  class Platform {
    constructor({ x, y, width, height, image, block, text }) {
      this.position = {
        x,
        y,
      };
      this.velocity = {
        x: 0,
      };
      this.image = image;
      this.width = width;
      this.height = height;
      this.block = block;
      this.text = text;
    }

    draw() {
      c.drawImage(this.image, this.position.x, this.position.y);
      if (this.text) {
        c.fillStyle = 'red';
        c.fillText(this.text, this.position.x, this.position.y);
      }
    }

    update() {
      this.draw();

      this.position.x += this.velocity.x;
    }
  }

  class GenericObject {
    constructor({ x, y, width, height, image }) {
      this.position = {
        x,
        y,
      };
      this.velocity = {
        x: 0,
      };
      this.image = image;
      this.width = width;
      this.height = height;
    }

    draw() {
      c.drawImage(this.image, this.position.x, this.position.y);
    }

    update() {
      this.draw();

      this.position.x += this.velocity.x;
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
      this.width = goombaWidth;
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

  class Particle {
    constructor({ position, velocity, radius, color, fireball = false }) {
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
      this.color = color || getParticleColor();
      this.fireball = fireball;
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

  class FireFlower {
    constructor({ position, velocity }) {
      this.position = {
        x: position.x,
        y: position.y,
      };
      this.velocity = {
        x: velocity.x,
        y: velocity.y,
      };
      this.width = 56;
      this.height = 60;
      this.image = createImage(spriteFireFlowerImgPath);
      this.frames = 0;
      this.oneFrameWidth = 56;
    }

    draw() {
      // c.fillStyle = 'crimson';
      // c.fillRect(this.position.x, this.position.y, this.width, this.height);

      c.drawImage(
        this.image,
        this.oneFrameWidth * this.frames,
        0,
        this.oneFrameWidth,
        60,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    update() {
      this.frames++;

      if (this.frames >= 75) {
        this.frames = 0;
      }

      this.draw();

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.position.y + this.height + this.velocity.y <= canvas.height)
        this.velocity.y += gravity;
    }
  }

  function getParticleColor() {
    const r = Math.floor(Math.random() * 75) + 150;
    const g = Math.floor(Math.random() * 70) + 30;
    const b = Math.floor(Math.random() * 10) + 10;

    return `rgb(${r}, ${g}, ${b})`;
  }

  let platformImage;
  let blockTriImage;
  let blockImage;
  let lgPlatformImage;
  let tPlatformImage;
  let xtPlatformImage;
  let player = new Player();
  let platforms = [];
  let genericObjects = [];
  let goombas = [];
  let particles = [];
  let fireFlowers = [];

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
    platformImage = await createImageAsync(platformImgPath);
    blockTriImage = await createImageAsync(blockTriImgPath);
    blockImage = await createImageAsync(blockImgPath);
    lgPlatformImage = await createImageAsync(lgPlatformImgPath);
    tPlatformImage = await createImageAsync(tPlatformImgPath);
    xtPlatformImage = await createImageAsync(xtPlatformImgPath);

    fireFlowers = [
      new FireFlower({
        position: {
          x: 400,
          y: 100,
        },
        velocity: {
          x: 0,
          y: 0,
        },
      }),
    ];
    player = new Player();
    goombas = [
      new Goomba({
        position: {
          x: 908 + lgPlatformImage.width - goombaWidth,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 400,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x: 3249 + lgPlatformImage.width - 43.33,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 400,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x: 3249 + lgPlatformImage.width - goombaWidth - goombaWidth,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 400,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x:
            3249 +
            lgPlatformImage.width -
            goombaWidth -
            goombaWidth -
            goombaWidth,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 400,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x:
            3249 +
            lgPlatformImage.width -
            goombaWidth -
            goombaWidth -
            goombaWidth -
            goombaWidth,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 400,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x: 5135 + platformXtWidth / 2 + goombaWidth,
          y: 100,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 100,
          traveled: 0,
        },
      }),
      new Goomba({
        position: {
          x: 6968,
          y: 0,
        },
        velocity: {
          x: -0.3,
          y: 0,
        },
        distance: {
          limit: 100,
          traveled: 0,
        },
      }),
    ];
    particles = [];
    platforms = [
      new Platform({
        x: 908 + 100,
        y: 300,
        width: blockTriWidth,
        height: 51,
        image: blockTriImage,
        block: true,
      }),
      new Platform({
        x: 908 + 100 + blockWidth,
        y: 100,
        width: blockWidth,
        height: 51,
        image: blockImage,
        block: true,
      }),
      new Platform({
        x: 1991 + platformLgWidth - platformTWidth,
        y: canvas.height - lgPlatformImage.height - tPlatformImage.height,
        width: platformTWidth,
        height: 178,
        image: tPlatformImage,
        block: true,
      }),
      new Platform({
        x: 1991 + platformLgWidth - platformTWidth - 100,
        y:
          canvas.height -
          lgPlatformImage.height -
          tPlatformImage.height +
          blockImage.height,
        width: platformTWidth,
        height: 51,
        image: blockImage,
        block: true,
      }),
      new Platform({
        x: 5712 + platformXtWidth + 175,
        y: canvas.height - xtPlatformImage.height,
        width: platformTWidth,
        height: 51,
        image: blockImage,
        block: true,
      }),
      new Platform({
        x: 6116 + 175,
        y: canvas.height - xtPlatformImage.height,
        width: platformTWidth,
        height: 51,
        image: blockImage,
        block: true,
      }),
      new Platform({
        x: 6116 + 175 * 2,
        y: canvas.height - xtPlatformImage.height,
        width: platformTWidth,
        height: 51,
        image: blockImage,
        block: true,
      }),
      new Platform({
        x: 6116 + 175 * 3,
        y: canvas.height - xtPlatformImage.height - 100,
        width: platformTWidth,
        height: 51,
        image: blockImage,
        block: true,
      }),
      new Platform({
        x: 6116 + 175 * 4,
        y: canvas.height - xtPlatformImage.height - 200,
        width: platformTWidth,
        height: 51,
        image: blockTriImage,
        block: true,
      }),
      new Platform({
        x: 6116 + 175 * 4 + blockTriImage.width,
        y: canvas.height - xtPlatformImage.height - 200,
        width: platformTWidth,
        height: 51,
        image: blockTriImage,
        block: true,
      }),
      new Platform({
        x: 6968 + 300,
        y: canvas.height - lgPlatformImage.height,
        width: platformLgWidth,
        height: 98,
        image: lgPlatformImage,
        block: true,
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

    const platformsMap = [
      'lg',
      'lg',
      'gap',
      'lg',
      'gap',
      'gap',
      'lg',
      'gap',
      't',
      'gap',
      'xt',
      'gap',
      'xt',
      'gap',
      'gap',
      'xt',
    ];

    let platformDistance = 0;

    platformsMap.forEach((symbol) => {
      switch (symbol) {
        case 'lg':
          platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - lgPlatformImage.height,
              width: platformLgWidth,
              height: 98,
              image: lgPlatformImage,
              block: true,
            })
          );

          platformDistance += platformLgWidth - 2;
          break;

        case 'gap':
          platformDistance += 175;
          break;

        case 't':
          platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - tPlatformImage.height,
              width: platformTWidth,
              height: 178,
              image: tPlatformImage,
              block: true,
            })
          );

          platformDistance += platformTWidth - 2;
          break;

        case 'xt':
          platforms.push(
            new Platform({
              x: platformDistance,
              y: canvas.height - xtPlatformImage.height,
              width: platformXtWidth,
              height: 295,
              image: xtPlatformImage,
              block: true,
            })
          );

          platformDistance += platformXtWidth - 2;
          break;
      }
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    genericObjects.forEach((genericObject) => {
      genericObject.update();
      genericObject.velocity.x = 0;
    });

    platforms.forEach((platform) => {
      platform.update();
      platform.velocity.x = 0;
    });

    // Mario obtains powerups
    fireFlowers.forEach((fireFlower, i) => {
      if (objectsTouch({ object1: player, object2: fireFlower })) {
        player.powerUps.fireFlower = true;
        setTimeout(() => {
          fireFlowers.splice(i, 1);
        }, 0);
      } else {
        fireFlower.update();
      }
    });

    goombas.forEach((goomba, index) => {
      goomba.update();

      // remove goomba on fireball hit
      particles
        .filter((particle) => particle.fireball)
        .forEach((particle, particleIndex) => {
          if (
            particle.position.x + particle.radius >= goomba.position.x &&
            particle.position.y + particle.radius >= goomba.position.y &&
            particle.position.x - particle.radius <=
              goomba.position.x + goomba.width &&
            particle.position.y - particle.radius <=
              goomba.position.y + goomba.height
          ) {
            for (let i = 0; i < 50; i++) {
              particles.push(
                new Particle({
                  position: {
                    x:
                      goomba.position.x +
                      goomba.width / 2 +
                      Math.random() * 120,
                    y:
                      goomba.position.y +
                      goomba.height / 2 +
                      Math.random() * 120,
                  },
                  velocity: {
                    x: (Math.random() - 0.5) * 50,
                    y: (Math.random() - 0.5) * 50,
                  },
                  radius: Math.random() * 7,
                })
              );
            }

            setTimeout(() => {
              goombas.splice(index, 1);
              particles.splice(particleIndex, 1);
            }, 0);
          }
        });

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
        // player hits goomba
        if (player.powerUps.fireFlower) {
          player.invincible = true;
          player.powerUps.fireFlower = false;

          setTimeout(() => {
            player.invincible = false;
          }, 1000);
        } else if (!player.invincible) reloadGame();
      }
    });

    particles.forEach((particle, index) => {
      particle.update();

      if (
        particle.fireball &&
        (particle.position.x - particle.radius >= canvas.width ||
          particle.position.x + particle.radius <= 0)
      )
        setTimeout(() => {
          particles.splice(index, 1);
        }, 0);
    });

    player.update();

    let hitSide = false;
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
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          platform.velocity.x = -player.speed;

          if (
            platform.block &&
            hitSideOfPlatform({ object: player, platform })
          ) {
            platforms.forEach((platform) => {
              platform.velocity.x = 0;
            });

            hitSide = true;
            break;
          }
        }

        if (!hitSide) {
          scrollOffset += player.speed;

          platforms.forEach((platform) => {
            platform.velocity.x = -player.speed;
          });
          genericObjects.forEach((genericObject) => {
            genericObject.velocity.x = -player.speed * 0.66;
          });
          fireFlowers.forEach((fireFlower) => {
            fireFlower.position.x -= player.speed;
          });
          goombas.forEach((goomba) => {
            goomba.position.x -= player.speed;
          });
          particles.forEach((particle) => {
            particle.position.x -= player.speed;
          });
        }
      } else if (keys.left.pressed && scrollOffset > 0) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          platform.velocity.x = player.speed;

          if (
            platform.block &&
            hitSideOfPlatform({ object: player, platform })
          ) {
            platforms.forEach((platform) => {
              platform.velocity.x = 0;
            });

            hitSide = true;
          }
        }

        if (!hitSide) {
          scrollOffset -= player.speed;

          genericObjects.forEach((genericObject) => {
            genericObject.velocity.x = player.speed * 0.66;
          });
          fireFlowers.forEach((fireFlower) => {
            fireFlower.position.x += player.speed;
          });
          goombas.forEach((goomba) => {
            goomba.position.x += player.speed;
          });
          particles.forEach((particle) => {
            particle.position.x += player.speed;
          });
        }
      }
    }

    // platform collision detection
    platforms.forEach((platform) => {
      if (isOnTopOfPlatform({ object: player, platform })) {
        player.velocity.y = 0;
      }

      if (platform.block && hitBottomOfPlatform({ object: player, platform })) {
        player.velocity.y = -player.velocity.y;
      }

      if (platform.block && hitSideOfPlatform({ object: player, platform })) {
        player.velocity.x = 0;
      }

      // particles bouncing
      particles.forEach((particle, index) => {
        if (isOnTopOfPlatformCircle({ object: particle, platform })) {
          const bounce = 0.95;
          particle.velocity.y = -particle.velocity.y * bounce;
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

      fireFlowers.forEach((fireFlower) => {
        if (isOnTopOfPlatform({ object: fireFlower, platform })) {
          fireFlower.velocity.y = 0;
        }
      });
    });

    // win scenario
    if (platformImage && scrollOffset + 400 + player.width >= 6968 + 300) {
      console.log('win');
    }

    // lose scenario
    if (player.position.y > canvas.height) {
      reloadGame();
      //location.reload()
    }

    // sprite switching condition
    if (player.velocity.y !== 0) {
      return;
    }

    if (
      keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.run.right
    ) {
      player.currentSprite = player.sprites.run.right;
    } else if (
      keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.run.left
    ) {
      player.currentSprite = player.sprites.run.left;
    } else if (
      !keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.stand.left
    ) {
      player.currentSprite = player.sprites.stand.left;
    } else if (
      !keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.stand.right
    ) {
      player.currentSprite = player.sprites.stand.right;
    } else if (
      !keys.right.pressed &&
      !keys.left.pressed &&
      !lastKey &&
      player.currentSprite !== player.sprites.stand.right
    ) {
      player.currentSprite = player.sprites.stand.right;
    }

    // fireflower sprites
    if (!player.powerUps.fireFlower) return;

    if (
      keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.run.fireFlower.right
    ) {
      player.currentSprite = player.sprites.run.fireFlower.right;
    } else if (
      keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.run.fireFlower.left
    ) {
      player.currentSprite = player.sprites.run.fireFlower.left;
    } else if (
      !keys.left.pressed &&
      lastKey === 'left' &&
      player.currentSprite !== player.sprites.stand.fireFlower.left
    ) {
      player.currentSprite = player.sprites.stand.fireFlower.left;
    } else if (
      !keys.right.pressed &&
      lastKey === 'right' &&
      player.currentSprite !== player.sprites.stand.fireFlower.right
    ) {
      player.currentSprite = player.sprites.stand.fireFlower.right;
    } else if (
      !keys.right.pressed &&
      !keys.left.pressed &&
      !lastKey &&
      player.currentSprite !== player.sprites.stand.fireFlower.right
    ) {
      player.currentSprite = player.sprites.stand.fireFlower.right;
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

        if (!player.powerUps.fireFlower) break;

        if (lastKey === 'right')
          player.currentSprite = player.sprites.jump.fireFlower.right;
        else if (lastKey === 'left')
          player.currentSprite = player.sprites.jump.fireFlower.left;

        break;
      case 32:
        if (!player.powerUps.fireFlower) return;

        let velocity = 15;

        if (lastKey === 'left') velocity = -velocity;

        particles.push(
          new Particle({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2,
            },
            velocity: {
              x: velocity,
              y: 0,
            },
            radius: 5,
            color: 'red',
            fireball: true,
          })
        );
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
