// Registry for active QRCodeStyling instances across the app

const qrInstances = new Set();

/**
 * Register a QRCodeStyling instance to receive global updates and resets.
 * @param {object} instance - QRCodeStyling instance
 * @returns {function} unregister function
 */
export function registerQRInstance(instance) {
  if (instance) {
    qrInstances.add(instance);
  }
  return () => {
    qrInstances.delete(instance);
  };
}

/**
 * Returns the canonical default black-and-white square QR code styling config.
 * @param {number} dimension
 * @returns {object}
 */
export function getDefaultQRConfig(dimension = 280) {
  return {
    width: dimension,
    height: dimension,
    data: 'https://google.com',
    margin: 10,
    qrOptions: {
      errorCorrectionLevel: 'M',
    },
    image: '',
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.36,
      margin: 4,
    },
    dotsOptions: {
      type: 'square',
      color: '#000000',
      gradient: null,
    },
    cornersSquareOptions: {
      type: 'square',
      color: '#000000',
      gradient: null,
    },
    cornersDotOptions: {
      type: 'square',
      color: '#000000',
      gradient: null,
    },
    backgroundOptions: {
      color: '#ffffff',
      gradient: null,
    },
  };
}

/**
 * Explicitly calls qrCode.update(defaultConfig) on all active instances
 * to instantly revert live canvases back to clean default black-and-white squares.
 * @param {number} [dimension=280]
 */
export function resetAllQRInstances(dimension = 280) {
  const config = getDefaultQRConfig(dimension);
  qrInstances.forEach((inst) => {
    try {
      if (inst && typeof inst.update === 'function') {
        inst.update(config);
      }
    } catch (e) {
      console.warn('Failed to update QR instance on reset:', e);
    }
  });
}
