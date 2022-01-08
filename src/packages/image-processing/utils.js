export const loadImageDataFromImageSource = async (imageSource) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSource;
    img.onload = () => {
      const imageData = imageToImageData(img);
      resolve(imageData);
    };
  });
};

export const imageToImageData = (image) => {
  const { naturalWidth: width, naturalHeight: height } = image;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

export const renderToCanvas = (
  canvas,
  imageData,
  width = imageData.width,
  height = imageData.height
) => {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
};

export const calculateResizingInfo = (sw, sh, dw, dh) => {
  const wRatio = dw / sw;
  const hRatio = dh / sh;

  if (wRatio > hRatio) {
    // Cut the top and bottom off.
    const usableHeight = sh * (hRatio / wRatio);
    return [0, (sh - usableHeight) / 2, sw, usableHeight];
  } else if (wRatio < hRatio) {
    // Cut the left and right off.
    const usableWidth = sw * (wRatio / hRatio);
    return [(sw - usableWidth) / 2, 0, usableWidth, sh];
  } else {
    // No need to change anything.
    return [0, 0, sw, sh];
  }
};

export const resizeImageData = (imageData, width, height) => {
  const { width: sourceWidth, height: sourceHeight } = imageData;
  const intermediateCanvas = document.createElement("canvas");
  renderToCanvas(intermediateCanvas, imageData);

  const [sx, sy, sw, sh] = calculateResizingInfo(
    sourceWidth,
    sourceHeight,
    width,
    height
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(intermediateCanvas, sx, sy, sw, sh, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

export const stretchImageData = (imageData, widthFactor, heightFactor) => {
  const intermediateCanvas = document.createElement("canvas");
  renderToCanvas(intermediateCanvas, imageData);

  const width = imageData.width * widthFactor;
  const height = imageData.height * heightFactor;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(intermediateCanvas, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};
