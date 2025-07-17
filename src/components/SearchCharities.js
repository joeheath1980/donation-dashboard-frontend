import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './SearchCharities.module.css';
import { FaSearch, FaInfoCircle, FaCheckCircle, FaFilter, FaTimes } from 'react-icons/fa';

const CHARITY_CATEGORIES = [
  'Health Services',
  'Mental Health',
  'Education',
  'Environmental Conservation',
  'Social Welfare',
  'Emergency Relief',
  'Food Security',
  'Child Welfare',
  'Indigenous Support',
  'Housing',
  'Community Building',
  'Rural Support',
  'Arts & Culture',
  'Animal Welfare',
  'International Aid',
  'Disability Services'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'score_desc', label: 'Highest Score' },
  { value: 'score_asc', label: 'Lowest Score' },
  { value: 'newest', label: 'Recently Added' },
  { value: 'trending', label: 'Trending' }
];

function SearchCharities() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minScore, setMinScore] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/search-charities`, {
        params: { 
          q: query,
          categories: selectedCategories.join(','),
          minScore,
          verifiedOnly,
          sortBy
        }
      });

      if (response.data.result && response.data.result.records) {
        // Add dummy data for scores, verification, and categories
        const enhancedResults = response.data.result.records.map(charity => ({
          ...charity,
          score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          isVerified: Math.random() > 0.3, // 70% chance of being verified
          category: CHARITY_CATEGORIES[Math.floor(Math.random() * CHARITY_CATEGORIES.length)],
          trending: Math.random() > 0.8 // 20% chance of trending
        }));
        setResults(enhancedResults);
      } else {
        setError('Failed to fetch results. Please try again.');
      }
    } catch (err) {
      console.error('Error searching charities:', err);
      setError(`An error occurred while searching: ${err.message}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply client-side filtering and sorting
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];
    
    // Apply filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(charity => 
        selectedCategories.includes(charity.category)
      );
    }
    
    if (minScore > 0) {
      filtered = filtered.filter(charity => charity.score >= minScore);
    }
    
    if (verifiedOnly) {
      filtered = filtered.filter(charity => charity.isVerified);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => a.Charity_Legal_Name.localeCompare(b.Charity_Legal_Name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.Charity_Legal_Name.localeCompare(a.Charity_Legal_Name));
        break;
      case 'score_desc':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'score_asc':
        filtered.sort((a, b) => a.score - b.score);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }
    
    return filtered;
  }, [results, selectedCategories, minScore, verifiedOnly, sortBy]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinScore(0);
    setVerifiedOnly(false);
    setSortBy('relevance');
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    (minScore > 0 ? 1 : 0) + 
    (verifiedOnly ? 1 : 0) + 
    (sortBy !== 'relevance' ? 1 : 0);

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <h1 className={styles.header}>Search Charities</h1>
        <p className={styles.introText}>
          Discover charities that align with your values. Search for charities and view their details to learn more about their mission and impact.
        </p>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchControls}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for charities by name, location, or cause..."
                className={styles.input}
                aria-label="Search charities"
              />
              <button type="submit" className={styles.searchButton}>
                <FaSearch /> Search
              </button>
            </div>
            <button 
              type="button" 
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
              {activeFiltersCount > 0 && (
                <span className={styles.filterBadge}>{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterHeader}>
              <h3>Filter Results</h3>
              <button onClick={clearFilters} className={styles.clearButton}>
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className={styles.filterSection}>
              <h4>Categories</h4>
              <div className={styles.categoryGrid}>
                {CHARITY_CATEGORIES.map(category => (
                  <label key={category} className={styles.categoryCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Score Filter */}
            <div className={styles.filterSection}>
              <h4>Minimum Impact Score</h4>
              <div className={styles.scoreFilter}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className={styles.scoreSlider}
                />
                <span className={styles.scoreValue}>{minScore}</span>
              </div>
            </div>

            {/* Verified Only */}
            <div className={styles.filterSection}>
              <label className={styles.verifiedCheckbox}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span>Show only verified charities</span>
              </label>
            </div>

            {/* Sort Options */}
            <div className={styles.filterSection}>
              <h4>Sort By</h4>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className={styles.activeFilters}>
          <span>Active Filters:</span>
          {selectedCategories.map(category => (
            <span key={category} className={styles.filterTag}>
              {category}
              <button onClick={() => toggleCategory(category)}>
                <FaTimes />
              </button>
            </span>
          ))}
          {minScore > 0 && (
            <span className={styles.filterTag}>
              Score ≥ {minScore}
              <button onClick={() => setMinScore(0)}>
                <FaTimes />
              </button>
            </span>
          )}
          {verifiedOnly && (
            <span className={styles.filterTag}>
              Verified Only
              <button onClick={() => setVerifiedOnly(false)}>
                <FaTimes />
              </button>
            </span>
          )}
          {sortBy !== 'relevance' && (
            <span className={styles.filterTag}>
              Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <button onClick={() => setSortBy('relevance')}>
                <FaTimes />
              </button>
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <div className={styles.loading}>
          Searching for charities...
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && filteredAndSortedResults.length > 0 && (
        <div className={styles.resultsCount}>
          Found {filteredAndSortedResults.length} charit{filteredAndSortedResults.length === 1 ? 'y' : 'ies'}
        </div>
      )}

      {filteredAndSortedResults.length > 0 && (
        <div className={styles.resultsGrid}>
          {filteredAndSortedResults.map((charity) => (
            <div key={charity._id} className={`${styles.card} ${charity.trending ? styles.trending : ''}`}>
              {charity.trending && (
                <div className={styles.trendingBadge}>🔥 Trending</div>
              )}
              
              <div className={styles.cardHeader}>
                <h2 className={styles.charityName}>
                  {charity['Charity_Legal_Name']}
                  {charity.isVerified && (
                    <FaCheckCircle className={styles.verifiedBadge} title="Verified Charity" />
                  )}
                </h2>
                <div className={styles.scoreDisplay}>
                  <span className={styles.scoreLabel}>Impact Score</span>
                  <span className={styles.scoreValue}>{charity.score}</span>
                </div>
              </div>
              
              <div className={styles.charityInfo}>
                <div className={styles.charityDetails}>
                  <span className={styles.category}>{charity.category}</span>
                </div>
                <div className={styles.charityDetails}>
                  <strong>State:</strong> {charity['State']}
                </div>
                <div className={styles.charityDetails}>
                  <strong>ABN:</strong> {charity['ABN']}
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <Link 
                  to={`/charity/${charity['ABN']}`} 
                  className={styles.viewDetailsButton}
                >
                  <FaInfoCircle /> View Details
                </Link>
                <Link 
                  to={`/donate/${charity['ABN']}`} 
                  className={styles.donateButton}
                >
                  💳 Donate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && filteredAndSortedResults.length === 0 && (
        <div className={styles.noResults}>
          No charities match your current filters. Try adjusting your criteria.
        </div>
      )}

      {filteredAndSortedResults.length > 0 && (
        <div className={styles.guidanceBox}>
          <h3>What you can do:</h3>
          <ul>
            <li>Click on "View Details" to learn more about a charity</li>
            <li>Look for verified charities marked with the <FaCheckCircle style={{ color: '#10b981' }} /> badge</li>
            <li>Check impact scores to find highly effective charities</li>
            <li>On the charity's detail page, you can choose to follow, find matching opportunities, or make donations</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchCharities;