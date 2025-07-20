import api from './api.service';

class ProfileService {
  // User Profile Methods
  async getUserPublicProfile(username) {
    try {
      const response = await api.get(`/public/user/${username}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw error;
    }
  }

  async updateUserPrivacySettings(settings) {
    const response = await api.put('/users/privacy', settings);
    return response.data;
  }

  async getUserPrivacySettings() {
    const response = await api.get('/users/privacy');
    return response.data;
  }

  // Business Profile Methods
  async getBusinessPublicProfile(slug) {
    try {
      const response = await api.get(`/public/business/${slug}`);
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
      const response = await api.get(`/public/charity/${abn}`);
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
    const response = await api.get('/public/search', {
      params: { q: query, type }
    });
    return response.data;
  }

  // Activity Methods
  async getPublicActivity(profileType, profileId, page = 1) {
    const response = await api.get(`/public/${profileType}/${profileId}/activity`, {
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

    switch (type) {
      case 'user':
        return {
          title: `${profileData.displayName} - Do-Nation Giving Profile`,
          description: `${profileData.displayName} is a ${profileData.tier} tier donor supporting ${profileData.stats?.charitiesSupported || 0} charities on Do-Nation.`,
          image: profileData.avatar || defaultImage,
          url: this.generateProfileUrl('user', profileData.username),
          type: 'profile',
          'og:profile:username': profileData.username
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

    switch (type) {
      case 'user':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profileData.displayName,
          url: this.generateProfileUrl('user', profileData.username),
          description: `${profileData.tier} tier donor on Do-Nation`,
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

export default new ProfileService();