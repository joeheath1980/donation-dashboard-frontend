import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { charitySearchService } from '../services/charitySearch.service';
import { createLogger } from '../utils/logger';
import styles from './CharitySearch.module.css';

const logger = createLogger('CharitySearch');

const CharitySearch = ({ value, onChange, onSelect, disabled = false }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search function
  const searchCharities = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await charitySearchService.searchCharities(searchQuery);
        setResults(response.charities || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error) {
        logger.error('Error searching charities', { error: error.message });
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchCharities(query);
  }, [query, searchCharities]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
  };

  const handleSelect = async (charity) => {
    setQuery(charity.name);
    setShowDropdown(false);
    
    // Get full details if ABN is available
    if (charity.ABN) {
      try {
        const details = await charitySearchService.getCharityDetails(charity.ABN);
        onSelect({
          charity: charity.name,
          charityABN: charity.ABN,
          charityType: details.category || charity.category
        });
      } catch (error) {
        logger.error('Error getting charity details', { error: error.message });
        // Use basic info if details fail
        onSelect({
          charity: charity.name,
          charityABN: charity.ABN,
          charityType: charity.category
        });
      }
    } else {
      onSelect({
        charity: charity.name,
        charityABN: '',
        charityType: charity.category
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className={styles.charitySearch}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setShowDropdown(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Type to search for a charity..."
        className={styles.input}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showDropdown && (query.length >= 2) && (
        <div className={styles.dropdown}>
          {loading && (
            <div className={styles.loading}>
              <span className={styles.spinner}></span>
              Searching charities...
            </div>
          )}
          
          {!loading && results.length === 0 && (
            <div className={styles.noResults}>
              No charities found. You can still enter the charity name manually.
            </div>
          )}
          
          {!loading && results.map((charity, index) => (
            <div
              key={charity.ABN || index}
              className={`${styles.dropdownItem} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleSelect(charity)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={styles.charityName}>{charity.name}</div>
              <div className={styles.charityInfo}>
                <span className={styles.category}>{charity.category}</span>
                {charity.state && (
                  <span className={styles.state}>{charity.state}</span>
                )}
                {charity.isPBI && (
                  <span className={styles.badge}>PBI</span>
                )}
              </div>
              {charity.ABN && (
                <div className={styles.abn}>ABN: {charity.ABN}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharitySearch;