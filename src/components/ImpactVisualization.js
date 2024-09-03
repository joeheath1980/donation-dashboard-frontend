import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { parseISO, format, subYears } from 'date-fns';
import { ImpactContext, calculateComplexImpactScore } from '../contexts/ImpactContext';

Chart.register(...registerables);

function processData(donations, oneOffContributions, volunteerActivities) {
  console.log('Processing data...');
  console.log('Raw donations:', donations);
  console.log('Raw oneOffContributions:', oneOffContributions);
  console.log('Raw volunteerActivities:', volunteerActivities);

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
    console.log('Rendering chart with dataPoints:', dataPoints);
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
  
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
  
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Complex Impact Score',
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
                unit: 'month',
                displayFormats: {
                  month: 'MMM yyyy'
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
                text: 'Complex Impact Score'
              },
              min: 0,
              max: 100
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

  return <canvas ref={chartRef} />;
}

export default ImpactVisualization;
