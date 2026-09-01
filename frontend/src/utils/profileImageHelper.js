/**
 * Extract valid base64 string from profileImage
 * Handles cases where profileImage might be:
 * - A valid base64 string
 * - An object (needs data extraction)
 * - null or undefined
 */
export const getProfileImageUrl = (profileImage, mimeType = 'image/jpeg') => {
  if (!profileImage) return null;

  // If it's a string, use it directly
  if (typeof profileImage === 'string') {
    return `data:${mimeType};base64,${profileImage}`;
  }

  // If it's an object, try to extract the data
  if (typeof profileImage === 'object') {
    // Try common property names
    const base64String = 
      profileImage.data || 
      profileImage.base64 || 
      profileImage.value || 
      profileImage.content ||
      JSON.stringify(profileImage); // fallback

    if (typeof base64String === 'string' && base64String.length > 0) {
      return `data:${mimeType};base64,${base64String}`;
    }
  }

  return null;
};

/**
 * Safe profile image renderer
 */
export const createProfileImageUrl = (user) => {
  if (!user) return null;

  // Try profileImage first (prioritized)
  if (user.profileImage) {
    const url = getProfileImageUrl(user.profileImage, user.profileImageMimeType);
    if (url) return url;
  }

  // Fallback to avatar
  if (user.avatar && typeof user.avatar === 'string') {
    return user.avatar;
  }

  return null;
};
