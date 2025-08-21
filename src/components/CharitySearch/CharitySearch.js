import React, { useState, useEffect, useCallback } from 'react';
import apiServices from '../../services/api.service';
import { FaSearch, FaSpinner, FaCheckCircle, FaBuilding } from 'react-icons/fa';
import styles from './CharitySearch.module.css';
import { API_CONFIG } from '../../config/api.config';
import { SecureTokenStorage } from '../../utils/auth.utils';

const CharitySearch = ({ onCharitySelect, initialValue, placeholder = "Search by charity name, ABN, or category...", required = false }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [inputValue, setInputValue] = useState(initialValue || '');

  // Debounced search function
  const searchCharities = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const api = apiServices.client;
      const response = await api.get('/api/charity-search/simple', { params: { q: term } });
      
      setSearchResults(response.data.charities || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Charity search error:', err);
      setError('Failed to search charities. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setInputValue(value);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const newTimer = setTimeout(() => {
      searchCharities(value);
    }, 300);

    setDebounceTimer(newTimer);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Handle charity selection
  const handleSelectCharity = async (charity) => {
    try {
      // Fetch full charity details
      const api = apiServices.client;
      const response = await api.get(`/api/charity-search/details/${charity.ABN || charity.abn}`);
      
      const fullCharityData = response.data;
      // Ensure we have an _id for navigation
      const charityWithId = {
        ...fullCharityData,
        _id: fullCharityData._id || fullCharityData.id || charity.ABN || charity.abn,
        abn: fullCharityData.ABN || fullCharityData.abn || charity.ABN || charity.abn,
        name: fullCharityData.name || charity.name,
        category: fullCharityData.category || charity.category
      };
      if (onCharitySelect) {
        onCharitySelect(charityWithId);
      }
      setSelectedCharity(charityWithId);
      setInputValue(charity.name);
      setSearchTerm(charity.name);
      setShowDropdown(false);
    } catch (err) {
      console.error('Failed to fetch charity details:', err);
      // Still select with basic data if details fetch fails
      const basicCharity = {
        ...charity,
        _id: charity._id || charity.id || charity.ABN || charity.abn,
        abn: charity.ABN || charity.abn,
        name: charity.name,
        category: charity.category
      };
      if (onCharitySelect) {
        onCharitySelect(basicCharity);
      }
      setSelectedCharity(basicCharity);
      setInputValue(charity.name);
      setSearchTerm(charity.name);
      setShowDropdown(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.searchContainer}`)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={styles.searchInput}
          required={required}
        />
        {isLoading && <FaSpinner className={styles.loadingIcon} />}
      </div>
      
      {!searchTerm && !selectedCharity && (
        <p className={styles.searchHint}>Start typing to see matching charities</p>
      )}

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {showDropdown && searchResults.length > 0 && (
        <div className={styles.dropdown}>
          {searchResults.map((charity) => (
            <div
              key={charity.ABN || charity.abn}
              className={styles.dropdownItem}
              onClick={() => handleSelectCharity(charity)}
            >
              <div className={styles.charityInfo}>
                <div className={styles.charityName}>
                  <FaBuilding className={styles.charityIcon} />
                  {charity.name}
                </div>
                <div className={styles.charityDetails}>
                  <span className={styles.category}>{charity.category}</span>
                  {charity.state && <span className={styles.location}>{charity.state}</span>}
                  {charity.pbi && <span className={styles.pbi}>PBI</span>}
                </div>
              </div>
              {selectedCharity?.abn === (charity.ABN || charity.abn) && (
                <FaCheckCircle className={styles.selectedIcon} />
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>No charities found</div>
        </div>
      )}
    </div>
  );
};

export default CharitySearch;
