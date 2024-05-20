import canvasFilters from 'canvas-filters';
export function convertToBlackAndWhiteAndIncreaseContrast(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  console.log(canvasFilters)
  // Convert to black and white using grayscale filter
  const grayScaleData = canvasFilters.GrayScale(imageData);

  // Increase the contrast
  const contrastData = canvasFilters.BrightnessContrastPhotoshop(grayScaleData, 10, 50);

  // Put the processed image data back to the canvas
  context.putImageData(contrastData, 0, 0);
}
