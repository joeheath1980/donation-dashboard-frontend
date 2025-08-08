import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import styles from './TaxSummary.module.css';
import { RiLightbulbLine, RiArrowLeftLine } from 'react-icons/ri';

const TaxSummary = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxSummary();
  }, [selectedYear]);

  const fetchTaxSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/business/tax/summary/${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      }
    } catch (error) {
      console.error('Error fetching tax summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const quarterlyChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Quarterly Donations',
      data: summaryData?.quarterlyBreakdown || [0, 0, 0, 0],
      borderColor: '#2d8f7b',
      backgroundColor: 'rgba(45, 143, 123, 0.1)',
      tension: 0.4
    }]
  };

  const charityChartData = {
    labels: summaryData?.charityBreakdown?.map(c => c.name) || [],
    datasets: [{
      data: summaryData?.charityBreakdown?.map(c => c.amount) || [],
      backgroundColor: [
        '#2d8f7b',
        '#5ecfb6',
        '#00D4AA',
        '#6D6D78',
        '#E5E5EA'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading tax summary...</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <button 
          onClick={() => navigate('/business/tax-center')} 
          className={styles.backButton}
        >
          <RiArrowLeftLine /> Back to Tax Centre
        </button>
      </nav>
      
      <div className={styles.header}>
        <h1>Tax Summary</h1>
        <select 
          className={styles.yearSelector}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[...Array(5)].map((_, i) => {
            const year = currentYear - i;
            return <option key={year} value={year}>{year}/{year + 1} Tax Year</option>;
          })}
        </select>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <h3>Total Donations</h3>
          <p className={styles.amount}>{formatCurrency(summaryData?.totalDonations || 0)}</p>
          <span className={styles.label}>Charitable contributions</span>
        </div>

        <div className={styles.summaryCard}>
          <h3>Tax Savings</h3>
          <p className={styles.amount}>{formatCurrency(summaryData?.estimatedTaxSavings || 0)}</p>
          <span className={styles.label}>At {summaryData?.taxRate || 0}% rate</span>
        </div>

        <div className={styles.summaryCard}>
          <h3>Gift Aid Claimed</h3>
          <p className={styles.amount}>{formatCurrency(summaryData?.giftAidClaimed || 0)}</p>
          <span className={styles.label}>Additional benefit</span>
        </div>

        <div className={styles.summaryCard}>
          <h3>Optimization Score</h3>
          <p className={styles.score}>{summaryData?.optimizationScore || 0}%</p>
          <span className={styles.label}>Tax efficiency</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2>Quarterly Breakdown</h2>
          <div className={styles.chartContainer}>
            <Line data={quarterlyChartData} options={chartOptions} />
          </div>
          <div className={styles.quarterlyTable}>
            <table>
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Amount</th>
                  <th>Tax Benefit</th>
                </tr>
              </thead>
              <tbody>
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
                  <tr key={quarter}>
                    <td>{quarter}</td>
                    <td>{formatCurrency(summaryData?.quarterlyBreakdown?.[index] || 0)}</td>
                    <td>{formatCurrency((summaryData?.quarterlyBreakdown?.[index] || 0) * (summaryData?.taxRate || 0) / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Charity Distribution</h2>
          <div className={styles.chartContainer}>
            <Pie data={charityChartData} options={chartOptions} />
          </div>
          <div className={styles.charityList}>
            {summaryData?.charityBreakdown?.map((charity, index) => (
              <div key={index} className={styles.charityItem}>
                <span className={styles.charityName}>{charity.name}</span>
                <span className={styles.charityAmount}>{formatCurrency(charity.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.monthlyBreakdown}>
        <h2>Monthly Details</h2>
        <div className={styles.monthlyGrid}>
          {summaryData?.monthlyBreakdown?.map((month, index) => (
            <div key={index} className={styles.monthCard}>
              <h4>{month.month}</h4>
              <p className={styles.monthAmount}>{formatCurrency(month.amount)}</p>
              <span className={styles.monthCount}>{month.count} donations</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.recommendations}>
        <h2>Tax Optimisation Recommendations</h2>
        <div className={styles.recommendationsList}>
          {summaryData?.recommendations?.map((rec, index) => (
            <div key={index} className={styles.recommendation}>
              <div className={styles.recIcon}><RiLightbulbLine /></div>
              <div className={styles.recContent}>
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
                <span className={styles.recSavings}>Potential savings: {formatCurrency(rec.potentialSavings)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxSummary;