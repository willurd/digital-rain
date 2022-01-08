import { useEffect, useRef } from "react";
import { render } from "react-dom";

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

const math$pow = Math.pow;

const l = (v) => {
  const p = v / 255;
  return p <= 0.03928 ? p / 12.92 : math$pow((p + 0.055) / 1.055, 2.4);
};

// Based on https://github.com/gka/chroma.js/blob/74c9ff5ba573eb40079b6786d2afcd9d135bdb00/chroma.js#L1851
const rgb2luminance = (r, g, b) => {
  return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);
};

const getColorByLuminanceThreshold = (data, i, threshold) => {
  const lum = rgb2luminance(data[i], data[i + 1], data[i + 2]);
  return lum >= threshold ? 255 : 0;
};

// Based on https://jsfiddle.net/vua1jstr
const luminanceFilter = (data) => {
  const threshold = 0.2;

  for (let i = 0; i < data.length; i += 4) {
    const color = getColorByLuminanceThreshold(data, i, threshold);
    data[i] = data[i + 1] = data[i + 2] = color;
    data[i + 3] = 255;
  }

  return data;
};

const getColorForBinarizationThreshold = (data, i, threshold) => {
  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  return threshold < avg ? 255 : 0;
};

// Copied from https://jsfiddle.net/vua1jstr
const binarizationFilter = (data) => {
  const threshold = 255 / 2;

  for (let i = 0; i < data.length; i += 4) {
    const color = getColorForBinarizationThreshold(data, i, threshold);
    data[i] = data[i + 1] = data[i + 2] = color;
    data[i + 3] = 255;
  }

  return data;
};

const filterImageData = (imageData, filter) => {
  const newImageData = new ImageData(
    imageData.data.slice(),
    imageData.width,
    imageData.height
  );
  filter(newImageData.data);
  return newImageData;
};

const imageToImageData = (image) => {
  const { naturalWidth: width, naturalHeight: height } = image;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

const renderToCanvas = (
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

const calculateResizingInfo = (sw, sh, dw, dh) => {
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

const resizeImageData = (imageData, width, height) => {
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

const stretchImageData = (imageData, widthFactor, heightFactor) => {
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

const createMaskFromImageData = (imageData) => {
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

const renderGridFromImageData = (
  canvas,
  imageData,
  cellWidth,
  cellHeight,
  cellSpacing,
  cellHorizontalSpacing,
  cellVerticalSpacing,
  horizontalMargin = cellHorizontalSpacing,
  verticalMargin = cellVerticalSpacing
) => {
  const { width: sourceWidth, height: sourceHeight } = imageData;
  const width =
    cellWidth * sourceWidth +
    cellHorizontalSpacing * (sourceWidth - 1) +
    horizontalMargin * 2;
  const height =
    cellHeight * sourceHeight +
    cellVerticalSpacing * (sourceHeight - 1) +
    verticalMargin * 2;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  for (let row = 0; row < sourceHeight; row++) {
    for (let col = 0; col < sourceWidth; col++) {
      const i = (row * sourceWidth + col) * 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3] / 255;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      const x = col * (cellWidth + cellHorizontalSpacing) + horizontalMargin;
      const y = row * (cellHeight + cellVerticalSpacing) + verticalMargin;
      ctx.fillRect(x, y, cellWidth, cellHeight);
    }
  }
};

const renderGridFromMask = (
  canvas,
  mask,
  cellWidth,
  cellHeight,
  cellHorizontalSpacing,
  cellVerticalSpacing,
  horizontalMargin = cellHorizontalSpacing,
  verticalMargin = cellVerticalSpacing
) => {
  const sourceHeight = mask.length;
  const sourceWidth = mask[0].length;
  const width =
    cellWidth * sourceWidth +
    cellHorizontalSpacing * (sourceWidth - 1) +
    horizontalMargin * 2;
  const height =
    cellHeight * sourceHeight +
    cellVerticalSpacing * (sourceHeight - 1) +
    verticalMargin * 2;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";

  for (let row = 0; row < sourceHeight; row++) {
    for (let col = 0; col < sourceWidth; col++) {
      const cellMask = mask[row][col];

      if (!cellMask) {
        continue;
      }

      const x = col * (cellWidth + cellHorizontalSpacing) + horizontalMargin;
      const y = row * (cellHeight + cellVerticalSpacing) + verticalMargin;
      ctx.fillRect(x, y, cellWidth, cellHeight);
    }
  }
};

export const ImageProcessorSpike = () => {
  const canvas0Ref = useRef();
  const canvas1Ref = useRef();
  const canvas2Ref = useRef();
  const canvas3Ref = useRef();
  const canvas4Ref = useRef();
  const canvas5Ref = useRef();
  const canvas6Ref = useRef();

  useEffect(() => {
    if (
      !(
        canvas0Ref.current &&
        canvas1Ref.current &&
        canvas2Ref.current &&
        canvas3Ref.current &&
        canvas4Ref.current &&
        canvas5Ref.current &&
        canvas6Ref.current
      )
    ) {
      return;
    }

    let cancelled = false;

    const rows = 75;
    const columns = 150;
    const cellWidth = 3;
    const cellHeight = 5;
    const cellHorizontalSpacing = 2;
    const cellVerticalSpacing = 2;

    const imageSource = "/assets/images/matrix/1.jpg";

    const horizontalStretchFactor =
      cellWidth < cellHeight
        ? (cellHeight + cellVerticalSpacing) /
          (cellWidth + cellHorizontalSpacing)
        : 1;

    const verticalStretchFactor =
      cellHeight < cellWidth
        ? (cellWidth + cellHorizontalSpacing) /
          (cellHeight + cellVerticalSpacing)
        : 1;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSource;
    img.onload = () => {
      if (cancelled) {
        return;
      }

      const originalImageData = imageToImageData(img);

      const stretchedImageData = stretchImageData(
        originalImageData,
        horizontalStretchFactor,
        verticalStretchFactor
      );

      const luminanceFilteredImageData = filterImageData(
        stretchedImageData,
        luminanceFilter
      );

      const reapplyLuminanceFilter = true;
      const resizedImageData = reapplyLuminanceFilter
        ? filterImageData(
            resizeImageData(luminanceFilteredImageData, columns, rows),
            luminanceFilter
          )
        : resizeImageData(luminanceFilteredImageData, columns, rows);

      renderToCanvas(canvas1Ref.current, originalImageData);
      renderToCanvas(canvas0Ref.current, originalImageData);

      renderToCanvas(canvas2Ref.current, stretchedImageData);

      renderToCanvas(canvas3Ref.current, luminanceFilteredImageData);

      renderToCanvas(canvas4Ref.current, resizedImageData);

      const mask = createMaskFromImageData(resizedImageData);
      renderGridFromMask(canvas5Ref.current, mask, cellWidth, cellHeight, 0);
      renderGridFromMask(
        canvas6Ref.current,
        mask,
        cellWidth,
        cellHeight,
        cellHorizontalSpacing,
        cellVerticalSpacing
      );
    };

    return () => {
      cancelled = true;
    };
  }, [
    canvas0Ref,
    canvas1Ref,
    canvas2Ref,
    canvas3Ref,
    canvas4Ref,
    canvas5Ref,
    canvas6Ref
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <div style={{ display: "flex", gap: 50 }}>
        <div>
          <div>
            <h3>Grid Mask with spacing (Final Step)</h3>
            <canvas ref={canvas6Ref} />
          </div>

          <div>
            <h3>Grid Mask no spacing (Final Step)</h3>
            <canvas ref={canvas5Ref} />
          </div>
        </div>

        <div>
          <canvas ref={canvas0Ref} />
        </div>
      </div>

      <div>
        <h3>Resized (Step 4)</h3>
        <canvas ref={canvas4Ref} />
      </div>

      <div>
        <h3>Stretched (Step 3)</h3>
        <canvas ref={canvas3Ref} />
      </div>

      <div>
        <h3>Luminance Filtered (Step 2)</h3>
        <canvas ref={canvas2Ref} />
      </div>

      <div>
        <h3>Original (Step 1)</h3>
        <canvas ref={canvas1Ref} />
      </div>
    </div>
  );
};

export default ImageProcessorSpike;
