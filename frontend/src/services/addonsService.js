import apiClient from './apiClient';

const BASE_URL = '/packages';

export const addonsService = {
  /**
   * Get all add-ons for a package
   */
  getPackageAddons: async (packageId) => {
    try {
      console.log(`📥 [addonsService.getPackageAddons] Fetching addons for package: ${packageId}`);
      const response = await apiClient.get(`${BASE_URL}/${packageId}/addons`);
      console.log(`🟢 [addonsService.getPackageAddons] Response:`, {
        success: response.success,
        dataCount: response.data?.length,
        count: response.count,
      });
      // apiClient already returns response.data, which contains {success, data, count}
      return response;
    } catch (error) {
      console.error('❌ Error fetching add-ons:', error);
      throw error;
    }
  },

  /**
   * Create a new add-on (Admin)
   */
  createAddon: async (packageId, addonData) => {
    try {
      if (!packageId) {
        const error = new Error('Missing required parameter: packageId is required');
        console.error('❌ [addonsService.createAddon] Validation error:', error.message);
        throw error;
      }

      if (!addonData?.name || addonData?.price === undefined) {
        const error = new Error('Missing required fields: name and price are required');
        console.error('❌ [addonsService.createAddon] Validation error:', error.message);
        throw error;
      }

      console.log(`📝 [addonsService.createAddon] Creating addon for package: ${packageId}`, {
        name: addonData.name,
        price: addonData.price,
      });

      const response = await apiClient.post(`${BASE_URL}/${packageId}/addons`, addonData);
      
      console.log(`✅ [addonsService.createAddon] Success:`, {
        id: response.data?.id,
        name: response.data?.name,
      });
      
      return response;
    } catch (error) {
      console.error('❌ [addonsService.createAddon] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        packageId,
      });
      throw error;
    }
  },

  /**
   * Update add-on
   */
  updateAddon: async (packageId, addonId, addonData) => {
    try {
      if (!packageId || !addonId) {
        const error = new Error('Missing required parameters: packageId and addonId are required');
        console.error('❌ [addonsService.updateAddon] Validation error:', error.message);
        throw error;
      }

      console.log(`📝 [addonsService.updateAddon] Updating addon: ${addonId}`, {
        packageId,
        name: addonData?.name,
        price: addonData?.price,
      });

      const response = await apiClient.put(
        `${BASE_URL}/${packageId}/addons/${addonId}`,
        addonData
      );

      console.log(`✅ [addonsService.updateAddon] Success:`, {
        id: response.data?.id,
        name: response.data?.name,
      });

      return response;
    } catch (error) {
      console.error('❌ [addonsService.updateAddon] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        packageId,
        addonId,
      });
      throw error;
    }
  },

  /**
   * Delete add-on
   */
  deleteAddon: async (packageId, addonId) => {
    try {
      if (!packageId || !addonId) {
        const error = new Error('Missing required parameters: packageId and addonId are required');
        console.error('❌ [addonsService.deleteAddon] Validation error:', error.message);
        throw error;
      }

      console.log(`🗑️ [addonsService.deleteAddon] Deleting addon: ${addonId} from package: ${packageId}`);
      
      const response = await apiClient.delete(
        `${BASE_URL}/${packageId}/addons/${addonId}`
      );
      
      console.log(`✅ [addonsService.deleteAddon] Response:`, response);
      return response;
    } catch (error) {
      console.error('❌ [addonsService.deleteAddon] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        packageId,
        addonId,
      });
      throw error;
    }
  },

  /**
   * Bulk update add-ons (reorder, toggle availability)
   */
  bulkUpdateAddons: async (packageId, updateData) => {
    try {
      console.log(`📝 [addonsService.bulkUpdateAddons] Bulk updating addons`);
      const response = await apiClient.put(
        `${BASE_URL}/${packageId}/addons/bulk-update`,
        updateData
      );
      console.log(`✅ [addonsService.bulkUpdateAddons] Response:`, response);
      return response;
    } catch (error) {
      console.error('❌ Error bulk updating add-ons:', error);
      throw error;
    }
  },
};

export default addonsService;
