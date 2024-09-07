import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { parseISO, subYears } from 'date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';

Chart.register(...registerables);

function processData(donations, oneOffContributions, volunteerActivities) {
  if (!donations || !oneOffContributions || !volunteerActivities) {
    console.error('Invalid input for processData');
    return [];
  }

  const allContributions = [
    ...donations.map(d => ({ 
      date: d.date,
      parsedDate: parseISO(d.date), 
      type: 'Regular Donation' 
    })),
    ...oneOffContributions.map(d => ({ 
      date: d.date,
      parsedDate: parseISO(d.date), 
      type: 'One-off Donation' 
    })),
    ...volunteerActivities.map(v => ({ 
      date: v.date,
      parsedDate: parseISO(v.date), 
      type: 'Volunteer Hours' 
    }))
  ];

  allContributions.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

  const benchmarks = {
    monthlyDonationBenchmark: 100,
    oneOffDonationBenchmark: 500
  };

  const dataPoints = allContributions.map((_, index) => {
    const currentDate = allContributions[index].parsedDate;
    const oneYearAgo = subYears(currentDate, 1);

    const currentData = {
      regularDonations: donations.filter(d => parseISO(d.date) <= currentDate),
      oneOffDonations: oneOffContributions.filter(d => parseISO(d.date) <= currentDate),
      volunteeringActivities: volunteerActivities.filter(v => parseISO(v.date) <= currentDate),
      previousPeriodScore: calculateComplexImpactScore({
        regularDonations: donations.filter(d => parseISO(d.date) > oneYearAgo && parseISO(d.date) <= currentDate),
        oneOffDonations: oneOffContributions.filter(d => parseISO(d.date) > oneYearAgo && parseISO(d.date) <= currentDate),
        volunteeringActivities: volunteerActivities.filter(v => parseISO(v.date) > oneYearAgo && parseISO(v.date) <= currentDate),
        previousPeriodScore: 0
      }, benchmarks).totalScore
    };

    const score = calculateComplexImpactScore(currentData, benchmarks).totalScore;
    return { x: currentDate, y: score };
  });

  return dataPoints;
}

function ImpactVisualization() {
  const { donations, oneOffContributions, volunteerActivities } = useContext(ImpactContext);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const dataPoints = useMemo(() => 
    processData(donations, oneOffContributions, volunteerActivities),
    [donations, oneOffContributions, volunteerActivities]
  );

  useEffect(() => {
    if (chartRef.current && dataPoints.length > 0) {
      const ctx = chartRef.current.getContext('2d');
  
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
  
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Personal Impact Score',
            data: dataPoints,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: function(tooltipItems) {
                  return tooltipItems[0].label;
                },
                label: function(context) {
                  return `Personal Impact Score: ${context.parsed.y.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month',
                displayFormats: {
                  month: 'MMM yyyy'
                }
              },
              title: {
                display: false
              },
              grid: {
                display: false
              },
              ticks: {
                color: '#2E7D32',
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6
              }
            },
            y: {
              title: {
                display: false
              },
              min: 0,
              max: 100,
              grid: {
                color: 'rgba(46, 125, 50, 0.1)',
              },
              ticks: {
                color: '#2E7D32',
                padding: 5,
                stepSize: 25,
                callback: function(value) {
                  return value;
                }
              }
            }
          }
        }
      });
    }
  
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPoints]);

  if (dataPoints.length === 0) {
    return <div>No data available for visualization</div>;
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export default ImpactVisualization;
