import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { parseISO, format } from 'date-fns';
import { ImpactContext } from '../contexts/ImpactContext';

Chart.register(...registerables);

function processData(donations, oneOffContributions, volunteerActivities) {
  console.log('Processing data...');
  console.log('Raw donations:', donations);
  console.log('Raw oneOffContributions:', oneOffContributions);
  console.log('Raw volunteerActivities:', volunteerActivities);

  const allContributions = [
    ...donations.map(d => ({ 
      date: d.date, // Store the original date string
      parsedDate: parseISO(d.date), 
      impact: d.amount / 100, 
      type: 'Regular Donation' 
    })),
    ...oneOffContributions.map(d => ({ 
      date: d.date, // Store the original date string
      parsedDate: parseISO(d.date), 
      impact: d.amount / 100, 
      type: 'One-off Donation' 
    })),
    ...volunteerActivities.map(v => ({ 
      date: v.date, // Store the original date string
      parsedDate: parseISO(v.date), 
      impact: v.hours, 
      type: 'Volunteer Hours' 
    }))
  ];

  console.log('Contributions before sorting:', 
    allContributions.map(c => ({
      ...c,
      originalDate: c.date,
      parsedDate: format(c.parsedDate, 'yyyy-MM-dd HH:mm:ss'),
      parsedTimestamp: c.parsedDate.getTime()
    }))
  );

  allContributions.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

  console.log('Contributions after sorting:', 
    allContributions.map(c => ({
      ...c,
      originalDate: c.date,
      parsedDate: format(c.parsedDate, 'yyyy-MM-dd HH:mm:ss'),
      parsedTimestamp: c.parsedDate.getTime()
    }))
  );

  let cumulativeImpact = 0;
  const dataPoints = allContributions.map(contribution => {
    cumulativeImpact += contribution.impact;
    return { x: contribution.parsedDate, y: cumulativeImpact };
  });

  console.log('Final data points:', 
    dataPoints.map(dp => ({
      x: format(dp.x, 'yyyy-MM-dd HH:mm:ss'),
      y: dp.y
    }))
  );

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
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
  
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
  
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Cumulative Impact Score',
            data: dataPoints,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month', // Adjust the unit to 'month' or 'year'
                displayFormats: {
                  day: 'dd/MM/yyyy', // Show day, month, and year
                  month: 'MMM yyyy', // Show month and year
                  year: 'yyyy' // Show only the year
                }
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Impact Score'
              }
            }
          }
        }
      });
    }
  
    // The return statement is aligned properly here
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPoints]); // Ensure dependencies are correct

  return <canvas ref={chartRef} />;
}

export default ImpactVisualization;






