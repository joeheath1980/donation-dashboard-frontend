import apiServices from './api.service';

const api = apiServices.client;

class ProfileService {
  // User Profile Methods
  async getUserPublicProfile(userId) {
    try {
      const response = await api.get(`/api/public/user/${userId}`);
      console.log('Profile API response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        console.error('Invalid API response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      // Extract the profile data from the response
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
      const response = await api.get(`/api/public/business/${slug}`);
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
      const response = await api.get(`/api/public/charity/${abn}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Charity not found');
      }
      throw error;
    }
  }

  // Search Methods
  async searchProfiles(query, type = 'all') {
    const response = await api.get('/api/public/search', {
      params: { q: query, type }
    });
    return response.data;
  }

  // Activity Methods
  async getPublicActivity(profileType, profileId, page = 1) {
    const response = await api.get(`/api/public/${profileType}/${profileId}/activity`, {
      params: { page, limit: 10 }
    });
    return response.data;
  }

  // Generate shareable profile URL
  generateProfileUrl(type, identifier) {
    const baseUrl = process.env.REACT_APP_PUBLIC_URL || 'https://do-nation.space';
    switch (type) {
      case 'user':
        return `${baseUrl}/profile/${identifier}`;
      case 'business':
        return `${baseUrl}/business/${identifier}`;
      case 'charity':
        return `${baseUrl}/charity/${identifier}`;
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
          url: this.generateProfileUrl('user', profileData._id || profileData.id),
          type: 'profile',
          'og:profile:username': profileData._id || profileData.id
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