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
  const [profileType, setProfileType] = useState(searchParams.get('type') || 'all');
  const [results, setResults] = useState({
    users: [],
    businesses: [],
    charities: []
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery, type) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults({ users: [], businesses: [], charities: [] });
        return;
      }

      setLoading(true);
      try {
        const data = await profileService.searchProfiles(searchQuery, type);
        setResults(data);
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
    debouncedSearch(query, profileType);
  }, [query, profileType, debouncedSearch]);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSearchParams({ q: newQuery, type: profileType });
  };

  const handleTypeChange = (type) => {
    setProfileType(type);
    setSearchParams({ q: query, type });
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
            placeholder="Search by name, username, or keyword..."
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
        </div>
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
            {(profileType === 'all' || profileType === 'users') && results.users.length > 0 && (
              <div className={styles.resultSection}>
                <h2>People</h2>
                <div className={styles.userGrid}>
                  {results.users.map((user) => (
                    <div 
                      key={user.username}
                      className={styles.userCard}
                      onClick={() => navigateToProfile('user', user.username)}
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
                          <p className={styles.username}>@{user.username}</p>
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
            {(profileType === 'all' || profileType === 'businesses') && results.businesses.length > 0 && (
              <div className={styles.resultSection}>
                <h2>Businesses</h2>
                <div className={styles.businessGrid}>
                  {results.businesses.map((business) => (
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
            {(profileType === 'all' || profileType === 'charities') && results.charities.length > 0 && (
              <div className={styles.resultSection}>
                <h2>Charities</h2>
                <div className={styles.charityGrid}>
                  {results.charities.map((charity) => (
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
            {results.users.length === 0 && results.businesses.length === 0 && results.charities.length === 0 && (
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