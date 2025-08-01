import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter,
  FaUser,
  FaBuilding,
  FaHeart,
  FaTrophy,
  FaDollarSign,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { debounce } from 'lodash';
import styles from './ProfileSearch.module.css';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProfileSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [profileType, setProfileType] = useState(searchParams.get('type') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState({
    users: [],
    businesses: [],
    charities: []
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery, usernameQuery, locationQuery, type) => {
      if (!searchQuery && !usernameQuery && !locationQuery) {
        setResults({ users: [], businesses: [], charities: [] });
        return;
      }

      setLoading(true);
      try {
        const searchParams = {
          q: searchQuery,
          username: usernameQuery,
          location: locationQuery,
          type
        };
        const data = await profileService.searchProfiles(searchParams);
        
        // Handle different response formats
        let formattedResults = data;
        
        // If the response has a results property, use that
        if (data.results) {
          formattedResults = data.results;
        }
        // If the response is an array, categorize it
        else if (Array.isArray(data)) {
          formattedResults = {
            users: data.filter(item => !item.abn && !item.industry).map(user => ({
              ...user,
              displayName: user.displayName || user.name || 'Unknown',
              publicScore: user.impactScore || user.publicScore || 0,
              tier: user.tier || 'Bronze'
            })),
            businesses: data.filter(item => item.industry),
            charities: data.filter(item => item.abn)
          };
        }
        
        // Ensure all user objects have required fields
        if (formattedResults.users) {
          formattedResults.users = formattedResults.users.map(user => ({
            ...user,
            displayName: user.displayName || user.name || 'Unknown',
            publicScore: user.impactScore || user.publicScore || 0,
            tier: user.tier || 'Bronze'
          }));
        }
        
        setResults(formattedResults);
        setHasSearched(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query, username, location, profileType);
  }, [query, username, location, profileType, debouncedSearch]);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    updateSearchParams({ q: newQuery });
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value.toLowerCase();
    setUsername(newUsername);
    updateSearchParams({ username: newUsername });
  };

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    updateSearchParams({ location: newLocation });
  };

  const handleTypeChange = (type) => {
    setProfileType(type);
    updateSearchParams({ type });
  };

  const updateSearchParams = (updates) => {
    const newParams = {
      q: query,
      username,
      location,
      type: profileType,
      ...updates
    };
    
    // Remove empty parameters
    Object.keys(newParams).forEach(key => {
      if (!newParams[key]) delete newParams[key];
    });
    
    setSearchParams(newParams);
  };

  const navigateToProfile = (type, identifier) => {
    switch (type) {
      case 'user':
        navigate(`/profile/${identifier}`);
        break;
      case 'business':
        navigate(`/business/${identifier}`);
        break;
      case 'charity':
        navigate(`/charity/${identifier}`);
        break;
    }
  };

  const profileTypes = [
    { value: 'all', label: 'All', icon: <FaSearch /> },
    { value: 'users', label: 'People', icon: <FaUser /> },
    { value: 'businesses', label: 'Businesses', icon: <FaBuilding /> },
    { value: 'charities', label: 'Charities', icon: <FaHeart /> }
  ];

  // Tier configurations
  const tierConfig = {
    Bronze: { color: '#CD7F32', icon: '🥉' },
    Silver: { color: '#C0C0C0', icon: '🥈' },
    Gold: { color: '#FFD700', icon: '🥇' },
    Platinum: { color: '#E5E4E2', icon: '💎' }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Discover Profiles</h1>
        <p className={styles.subtitle}>
          Find donors, businesses, and charities making an impact
        </p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or keyword..."
            value={query}
            onChange={handleQueryChange}
            className={styles.searchInput}
            autoFocus
          />
        </div>

        {/* Type Filters */}
        <div className={styles.typeFilters}>
          {profileTypes.map((type) => (
            <button
              key={type.value}
              className={`${styles.typeButton} ${profileType === type.value ? styles.active : ''}`}
              onClick={() => handleTypeChange(type.value)}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
          
          <button
            className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Search by exact username"
                value={username}
                onChange={handleUsernameChange}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                placeholder="City, state, or country"
                value={location}
                onChange={handleLocationChange}
                className={styles.filterInput}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={styles.results}>
        {loading ? (
          <LoadingSpinner message="Searching..." />
        ) : !hasSearched ? (
          <div className={styles.emptyState}>
            <FaSearch className={styles.emptyIcon} />
            <h3>Start Searching</h3>
            <p>Enter a name or keyword to find profiles</p>
          </div>
        ) : (
          <>
            {/* User Results */}
            {(profileType === 'all' || profileType === 'users') && results?.users?.length > 0 && (
              <div className={styles.resultSection}>
                <h2>People</h2>
                <div className={styles.userGrid}>
                  {results?.users?.map((user) => (
                    <div 
                      key={user._id || user.id}
                      className={styles.userCard}
                      onClick={() => navigateToProfile('user', user.username || user._id || user.id)}
                    >
                      <div className={styles.userHeader}>
                        <div className={styles.avatar}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.displayName} />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className={styles.userInfo}>
                          <h3>{user.displayName}</h3>
                          {user.username && (
                            <p className={styles.username}>@{user.username}</p>
                          )}
                          {user.professionalTitle && (
                            <p className={styles.title}>{user.professionalTitle}</p>
                          )}
                          {user.bio && (
                            <p className={styles.bio}>{user.bio.substring(0, 100)}...</p>
                          )}
                          <p className={styles.tier}>{user.tier || 'Member'} Tier</p>
                          {(user.location && (user.location.city || user.location.state || user.location.country)) ? (
                            <p className={styles.location}>
                              <FaMapMarkerAlt />
                              <span>
                                {[user.location.city, user.location.state, user.location.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </p>
                          ) : user.location && typeof user.location === 'string' ? (
                            <p className={styles.location}>
                              <FaMapMarkerAlt />
                              <span>{user.location}</span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.userStats}>
                        <div 
                          className={styles.tierBadge}
                          style={{ backgroundColor: tierConfig[user.tier]?.color }}
                        >
                          <span>{tierConfig[user.tier]?.icon}</span>
                          <span>{user.tier}</span>
                        </div>
                        {user.publicScore !== 'Private' && (
                          <div className={styles.score}>
                            <FaTrophy />
                            <span>{user.publicScore.toLocaleString()} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Results */}
            {(profileType === 'all' || profileType === 'businesses') && results?.businesses?.length > 0 && (
              <div className={styles.resultSection}>
                <h2>Businesses</h2>
                <div className={styles.businessGrid}>
                  {results?.businesses?.map((business) => (
                    <div 
                      key={business.slug}
                      className={styles.businessCard}
                      onClick={() => navigateToProfile('business', business.slug)}
                    >
                      <div className={styles.businessHeader}>
                        {business.logo ? (
                          <img src={business.logo} alt={business.name} className={styles.businessLogo} />
                        ) : (
                          <div className={styles.logoPlaceholder}>
                            <FaBuilding />
                          </div>
                        )}
                        <div className={styles.businessInfo}>
                          <h3>{business.name}</h3>
                          <p className={styles.industry}>{business.industry}</p>
                        </div>
                      </div>
                      <div className={styles.businessStats}>
                        <div className={styles.stat}>
                          <FaDollarSign />
                          <span>${business.totalMatched?.toLocaleString() || 0} matched</span>
                        </div>
                        <div className={styles.stat}>
                          <FaHeart />
                          <span>{business.charitiesSupported || 0} charities</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charity Results */}
            {(profileType === 'all' || profileType === 'charities') && results?.charities?.length > 0 && (
              <div className={styles.resultSection}>
                <h2>Charities</h2>
                <div className={styles.charityGrid}>
                  {results?.charities?.map((charity) => (
                    <div 
                      key={charity.abn}
                      className={styles.charityCard}
                      onClick={() => navigateToProfile('charity', charity.abn)}
                    >
                      <div className={styles.charityHeader}>
                        {charity.logo ? (
                          <img src={charity.logo} alt={charity.name} className={styles.charityLogo} />
                        ) : (
                          <div className={styles.logoPlaceholder}>
                            <FaHeart />
                          </div>
                        )}
                        <div className={styles.charityInfo}>
                          <h3>{charity.name}</h3>
                          <p className={styles.category}>{charity.category}</p>
                        </div>
                      </div>
                      <div className={styles.charityStats}>
                        <div className={styles.stat}>
                          <FaDollarSign />
                          <span>${charity.totalRaised?.toLocaleString() || 0} raised</span>
                        </div>
                        {charity.location && (
                          <div className={styles.stat}>
                            <FaMapMarkerAlt />
                            <span>{charity.location}</span>
                          </div>
                        )}
                      </div>
                      {charity.dgrStatus && (
                        <div className={styles.dgrBadge}>
                          DGR Registered
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {(!results?.users?.length && !results?.businesses?.length && !results?.charities?.length) && (
              <div className={styles.noResults}>
                <h3>No results found</h3>
                <p>Try adjusting your search terms or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSearch;