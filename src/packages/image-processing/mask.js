import { applyFilterToImageData, luminanceFilter } from "./filters";
import {
  loadImageDataFromImageSource,
  resizeImageData,
  stretchImageData
} from "./utils";

// Yes
// https://i.imgur.com/i1rZliW.jpg (1248x754)
// https://i.imgur.com/HDPr8yR.jpeg (778x469)
// https://i.imgur.com/cQrHXYQ.jpg (780x438)
// https://i.imgur.com/e0mSSwV.jpg (970x485)

// Maybe
// https://i.imgur.com/xHWU7fl.jpeg (360x240)
// https://i.imgur.com/9HuoKHP.jpeg (236x314)
// https://i.imgur.com/iUjbsd0.jpeg (780x438)
// https://i.imgur.com/I2vp0tq.jpg (780x438)

// No
// https://i.imgur.com/cZdnmz3.jpeg (728x451)

// const imageSource = "/assets/images/matrix/1.jpg";
// const maskWidth = 75;
// const maskHeight = 150;
// const cellWidth = 3;
// const cellHeight = 5;
// const cellHorizontalSpacing = 2;
// const cellVerticalSpacing = 2;

export const createMaskFromImageSource = async (
  imageSource,
  maskWidth,
  maskHeight,
  cellWidth,
  cellHeight,
  cellHorizontalSpacing,
  cellVerticalSpacing,
  reapplyLuminanceFilter = true
) => {
  const horizontalStretchFactor =
    cellWidth < cellHeight
      ? (cellHeight + cellVerticalSpacing) / (cellWidth + cellHorizontalSpacing)
      : 1;

  const verticalStretchFactor =
    cellHeight < cellWidth
      ? (cellWidth + cellHorizontalSpacing) / (cellHeight + cellVerticalSpacing)
      : 1;

  const originalImageData = await loadImageDataFromImageSource(imageSource);

  // We stretch the image depending on the cell width and height.
  // Because each cell represents a pixel, if it is not a square
  // it will end up warping the overall image of the mask. This
  // stretching will cancel out that warping.
  const stretchedImageData = stretchImageData(
    originalImageData,
    horizontalStretchFactor,
    verticalStretchFactor
  );

  // This gives us a grid of white or black pixels, based on some
  // luminance threshold of each pixel in the input image data.
  const luminanceFilteredImageData = applyFilterToImageData(
    stretchedImageData,
    luminanceFilter
  );

  // This scales the image to the size of the mask. It will crop
  // the image if necessary to avoid stretching it further.
  const resizedImageData = reapplyLuminanceFilter
    ? applyFilterToImageData(
        resizeImageData(luminanceFilteredImageData, maskWidth, maskHeight),
        luminanceFilter
      )
    : resizeImageData(luminanceFilteredImageData, maskWidth, maskHeight);

  // What we're left with here is a grid of 1s and 0s, telling
  // us which pixels are activated in the mask.
  const mask = createMaskFromImageData(resizedImageData);

  return mask;
};

export const createMaskFromImageData = (imageData) => {
  const mask = [];
  const { width: sourceWidth, height: sourceHeight } = imageData;

  for (let row = 0; row < sourceHeight; row++) {
    mask[row] = [];

    for (let col = 0; col < sourceWidth; col++) {
      const i = (row * sourceWidth + col) * 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3] / 255;
      const filled = r * g * b * a !== 0;
      mask[row][col] = filled ? 1 : 0;
    }
  }

  return mask;
};
