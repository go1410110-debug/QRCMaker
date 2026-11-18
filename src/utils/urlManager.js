// Centralized Object URL manager for memory leak prevention

const managedUrls = new Set();

/**
 * Creates a managed Blob/File Object URL and tracks it for revocation.
 * @param {Blob|File} blobOrFile
 * @returns {string|null}
 */
export function createManagedBlobUrl(blobOrFile) {
  if (!blobOrFile) return null;
  const url = URL.createObjectURL(blobOrFile);
  managedUrls.add(url);
  return url;
}

/**
 * Revokes a managed Blob URL and removes it from the tracking set.
 * @param {string} url
 */
export function revokeManagedBlobUrl(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Failed to revoke blob URL:', e);
    }
    managedUrls.delete(url);
  }
}

/**
 * Revokes all tracked Blob URLs (used on Reset or Unmount).
 */
export function revokeAllManagedBlobUrls() {
  managedUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Failed to revoke blob URL:', e);
    }
  });
  managedUrls.clear();
}
