import apiServices from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

const api = apiServices.client;

class ProfileService {
  // User Profile Methods
  async getUserPublicProfile(identifier) {
    try {
      // Resolve special identifier "me" to the current user's username when possible
      let resolvedId = identifier;
      if (identifier === 'me') {
        try {
          const meRes = await api.get(API_ENDPOINTS.USER_PROFILE);
          const me = meRes.data || {};
          resolvedId = me.username || me._id || me.id || 'me';
        } catch (e) {
          // If we can't resolve "me" (likely unauthenticated), propagate a clear error
          if (e?.response?.status === 401) {
            throw new Error('Not authenticated. Please log in to view your profile.');
          }
          // Otherwise continue with provided identifier which may still work server-side
        }
      }

      // Try canonical path first; backend should accept username or ID
      let response;
      try {
        response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_USER}/${resolvedId}`);
      } catch (primaryErr) {
        // Fallback to alternate documented path if primary is not found
        if (primaryErr?.response?.status === 404 || primaryErr?.response?.status === 400) {
          response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_USER_LEGACY}/${resolvedId}`);
        } else {
          throw primaryErr;
        }
      }
      console.log('Profile API response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('Invalid API response structure:', response.data);
        throw new Error('Invalid response from server');
      }

      // Extract the profile data from the response (support multiple shapes)
      if (response.data.profile) {
        console.log('Profile data structure:', {
          hasUser: !!response.data.profile.user,
          hasStats: !!response.data.profile.stats,
          hasRecentActivity: !!response.data.profile.recentActivity,
          hasCharityPortfolio: !!response.data.profile.charityPortfolio,
          userProperties: response.data.profile.user ? Object.keys(response.data.profile.user) : []
        });
        console.log('Returning profile data:', response.data.profile);
        return response.data.profile;
      } else if (response.data.success && response.data.data) {
        // Some APIs return { success, data }
        return response.data.data;
      } else if (response.data.user) {
        // Some APIs return the profile object directly
        return response.data;
      }
      
      console.error('No profile data in response:', response.data);
      throw new Error('Profile data not found in response');
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw error;
    }
  }

  async updateUserPrivacySettings(settings) {
    const response = await api.put('/api/users/privacy', settings);
    return response.data;
  }

  async getUserPrivacySettings() {
    const response = await api.get('/api/users/privacy');
    return response.data;
  }

  // Business Profile Methods
  async getBusinessPublicProfile(slug) {
    try {
      let response;
      try {
        response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_BUSINESS}/${slug}`);
      } catch (primaryErr) {
        if (primaryErr?.response?.status === 404 || primaryErr?.response?.status === 400) {
          response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_BUSINESS_LEGACY}/${slug}`);
        } else {
          throw primaryErr;
        }
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Business not found');
      }
      throw error;
    }
  }

  // Charity Profile Methods
  async getCharityPublicProfile(abn) {
    try {
      let response;
      try {
        response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_CHARITY}/${abn}`);
      } catch (primaryErr) {
        if (primaryErr?.response?.status === 404 || primaryErr?.response?.status === 400) {
          response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_CHARITY_LEGACY}/${abn}`);
        } else {
          throw primaryErr;
        }
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Charity not found');
      }
      throw error;
    }
  }

  // Search Methods
  async searchProfiles(params) {
    // Support both old and new API signatures
    if (typeof params === 'string') {
      params = { q: params, type: arguments[1] || 'all' };
    }
    
    // Updated to use correct endpoint path
    let response;
    try {
      response = await api.get(API_ENDPOINTS.PUBLIC_PROFILE_SEARCH, { params });
    } catch (primaryErr) {
      if (primaryErr?.response?.status === 404 || primaryErr?.response?.status === 400) {
        response = await api.get(API_ENDPOINTS.PUBLIC_PROFILE_SEARCH_LEGACY, { params });
      } else {
        throw primaryErr;
      }
    }
    return response.data;
  }

  // Activity Methods
  async getPublicActivity(profileType, profileId, page = 1) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_ACTIVITY_ROOT}/${profileType}/${profileId}/activity`, {
        params: { page, limit: 10 }
      });
      return response.data;
    } catch (primaryErr) {
      if (primaryErr?.response?.status === 404 || primaryErr?.response?.status === 400) {
        const response = await api.get(`${API_ENDPOINTS.PUBLIC_PROFILE_ACTIVITY_LEGACY_ROOT}/${profileType}/${profileId}/activity`, {
          params: { page, limit: 10 }
        });
        return response.data;
      }
      throw primaryErr;
    }
  }

  // Generate shareable profile URL
  generateProfileUrl(type, identifier) {
    const baseUrl = process.env.REACT_APP_PUBLIC_URL || 'https://do-nation.space';
    switch (type) {
      case 'user':
        // Identifier should be a username for public profiles
        return `${baseUrl}/profile/${identifier}`;
      case 'business':
        return `${baseUrl}/business/${identifier}`;
      case 'charity':
        return `${baseUrl}/charity/profile/${identifier}`;
      default:
        throw new Error('Invalid profile type');
    }
  }

  // SEO Meta Data
  generateMetaTags(profileData, type) {
    const baseUrl = process.env.REACT_APP_PUBLIC_URL || 'https://do-nation.space';
    const defaultImage = `${baseUrl}/og-image-default.png`;

    if (!profileData) {
      return {
        title: 'Do-Nation Profile',
        description: 'View profiles on Do-Nation',
        image: defaultImage,
        url: baseUrl,
        type: 'website'
      };
    }

    switch (type) {
      case 'user':
        return {
          title: `${profileData.displayName || 'User'} - Do-Nation Giving Profile`,
          description: `${profileData.displayName || 'User'} is a ${profileData.tier || 'Bronze'} tier donor supporting ${profileData.stats?.charitiesSupported || 0} charities on Do-Nation.`,
          image: profileData.avatar || defaultImage,
          url: this.generateProfileUrl('user', profileData.username || profileData._id || profileData.id),
          type: 'profile',
          'og:profile:username': profileData.username || profileData._id || profileData.id
        };
      
      case 'business':
        return {
          title: `${profileData.name} - Do-Nation Business Partner`,
          description: `${profileData.name} has matched $${profileData.stats?.totalMatched || 0} in donations supporting ${profileData.stats?.charitiesSupported || 0} charities.`,
          image: profileData.logo || defaultImage,
          url: this.generateProfileUrl('business', profileData.slug),
          type: 'website'
        };
      
      case 'charity':
        return {
          title: `${profileData.name} - Do-Nation Charity`,
          description: profileData.description || `Support ${profileData.name} on Do-Nation. ${profileData.stats?.totalRaised ? `$${profileData.stats.totalRaised} raised so far.` : ''}`,
          image: profileData.logo || defaultImage,
          url: this.generateProfileUrl('charity', profileData.abn),
          type: 'website'
        };
      
      default:
        return null;
    }
  }

  // Generate JSON-LD structured data
  generateStructuredData(profileData, type) {
    const baseUrl = process.env.REACT_APP_PUBLIC_URL || 'https://do-nation.space';

    if (!profileData) {
      return null;
    }

    switch (type) {
      case 'user':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profileData.displayName || 'User',
          url: this.generateProfileUrl('user', profileData._id || profileData.id),
          description: `${profileData.tier || 'Bronze'} tier donor on Do-Nation`,
          memberOf: {
            '@type': 'Organization',
            name: 'Do-Nation',
            url: baseUrl
          }
        };
      
      case 'business':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: profileData.name,
          url: this.generateProfileUrl('business', profileData.slug),
          description: profileData.description,
          logo: profileData.logo,
          member: {
            '@type': 'Organization',
            name: 'Do-Nation Business Partners',
            url: `${baseUrl}/businesses`
          }
        };
      
      case 'charity':
        return {
          '@context': 'https://schema.org',
          '@type': 'NonProfitOrganization',
          name: profileData.name,
          url: this.generateProfileUrl('charity', profileData.abn),
          description: profileData.description,
          logo: profileData.logo,
          identifier: profileData.abn,
          address: profileData.address ? {
            '@type': 'PostalAddress',
            addressLocality: profileData.address.city,
            addressRegion: profileData.address.state,
            addressCountry: 'AU'
          } : undefined
        };
      
      default:
        return null;
    }
  }
}

const profileService = new ProfileService();
export default profileService;
