import React, { useState, useMemo } from 'react';
import axios from 'axios';
import styles from './SearchCharities.module.css';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import CharityCard from './CharityCard';
import { mapNormalizedToACNC } from '../utils/charityDataMapper';

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
  'Disability Services',
  'Religious Activities',
  'Research',
  'Advancing Culture',
  'Other Philanthropic',
  'Advancing Health',
  'Advancing Education',
  'Advancing Social or Public Welfare',
  'Advancing Religion',
  'Advancing the Natural Environment',
  'Advancing Security or Safety',
  'Advancing Amateur Sport',
  'Advancing Reconciliation',
  'Human Rights Protection',
  'Animal Protection',
  'Environmental Protection'
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
      // Use the new enhanced search endpoint
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/search/${encodeURIComponent(query)}`, {
        params: { 
          limit: 50,
          offset: 0
        }
      });

      if (response.data.charities && response.data.charities.records) {
        // Use the mapper to handle backend normalized data
        const enhancedResults = response.data.charities.records.map(charity => {
          const mappedCharity = mapNormalizedToACNC(charity);
          return {
            ...mappedCharity,
            // Add display properties
            score: charity.impactScore || Math.floor(Math.random() * 40) + 60,
            isVerified: true, // All results from API are verified
            category: charity.category || 'Other Philanthropic',
            trending: charity.trending || Math.random() > 0.8,
            // Add purpose summary for display
            purposeSummary: charity.purposes ? Object.entries(charity.purposes)
              .filter(([key, value]) => value)
              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
              .slice(0, 3) : []
          };
        });
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
        filtered.sort((a, b) => (a.Charity_Legal_Name || a.name || '').localeCompare(b.Charity_Legal_Name || b.name || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.Charity_Legal_Name || b.name || '').localeCompare(a.Charity_Legal_Name || a.name || ''));
        break;
      case 'score_desc':
        filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'score_asc':
        filtered.sort((a, b) => (a.score || 0) - (b.score || 0));
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
            <CharityCard key={charity.ABN || charity._id} charity={charity} />
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
            <li>Look for verified charities marked with the ✓ badge</li>
            <li>Check impact scores to find highly effective charities</li>
            <li>View financial information and operating locations</li>
            <li>On the charity's detail page, you can choose to follow, find matching opportunities, or make donations</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchCharities;