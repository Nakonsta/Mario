export function createImage(imagePath) {
  const image = new Image();
  image.src = imagePath;

  return image;
}

export function createImageAsync(imagePath) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = imagePath;
  });
}
