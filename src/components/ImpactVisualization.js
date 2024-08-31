import React, { useContext, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ImpactContext } from '../contexts/ImpactContext';

Chart.register(...registerables);

function ImpactVisualization() {
  const { donations, oneOffContributions, volunteerActivities } = useContext(ImpactContext);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      const allContributions = [
        ...donations.map(d => ({ date: new Date(d.date), impact: d.amount / 100, type: 'Regular Donation' })),
        ...oneOffContributions.map(d => ({ date: new Date(d.date), impact: d.amount / 100, type: 'One-off Donation' })),
        ...volunteerActivities.map(v => ({ date: new Date(v.date), impact: v.hours, type: 'Volunteer Hours' }))
      ].sort((a, b) => a.date - b.date);

      let cumulativeImpact = 0;
      const dataPoints = allContributions.map(contribution => {
        cumulativeImpact += contribution.impact;
        return { x: contribution.date, y: cumulativeImpact };
      });

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
                unit: 'day'
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

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [donations, oneOffContributions, volunteerActivities]);

  return <canvas ref={chartRef} />;
}

export default ImpactVisualization;







