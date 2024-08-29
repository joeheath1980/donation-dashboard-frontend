import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

function ImpactVisualization({ donationsData }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      // Prepare the data for the graph
      const dates = donationsData.map(d => new Date(d.date).toLocaleDateString());
      const amounts = donationsData.map(d => d.amount);

      // Calculate cumulative totals
      const cumulativeAmounts = amounts.reduce((acc, amount, index) => {
        acc.push((acc[index - 1] || 0) + amount);
        return acc;
      }, []);

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Donation Amount',
              data: amounts,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: false,
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
            },
            {
              label: 'Cumulative Amount',
              data: cumulativeAmounts,
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: true,
              pointRadius: 0, // No points for cumulative line
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'year', // Adjust this based on your data
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount ($)',
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `$${tooltipItem.formattedValue}`;
                },
              },
            },
          },
        },
      });
    }

    // Cleanup function to destroy the chart instance when the component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [donationsData]);

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default ImpactVisualization;







