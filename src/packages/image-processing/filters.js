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
export const luminanceFilter = (data) => {
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
export const binarizationFilter = (data) => {
  const threshold = 255 / 2;

  for (let i = 0; i < data.length; i += 4) {
    const color = getColorForBinarizationThreshold(data, i, threshold);
    data[i] = data[i + 1] = data[i + 2] = color;
    data[i + 3] = 255;
  }

  return data;
};

export const applyFilterToImageData = (imageData, filter) => {
  const newImageData = new ImageData(
    imageData.data.slice(),
    imageData.width,
    imageData.height
  );
  filter(newImageData.data);
  return newImageData;
};
