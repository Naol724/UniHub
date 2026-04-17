import React, { useEffect, useRef } from 'react';

/**
 * ProgressChart Component
 * Displays a bar chart visualization of task completion progress.
 * Uses Chart.js for rendering - a lightweight, responsive charting library.
 * 
 * @param {Object} props
 * @param {Object} props.data - Chart data object with labels, completed, total
 */
const ProgressChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // Dynamic import to reduce initial bundle size
    import('chart.js/auto').then((ChartJS) => {
      const ctx = chartRef.current.getContext('2d');

      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart
      chartInstanceRef.current = new ChartJS.default(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Completed Tasks',
              data: data.completed,
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderRadius: 8,
              barPercentage: 0.65,
              categoryPercentage: 0.8,
            },
            {
              label: 'Total Tasks',
              data: data.total,
              backgroundColor: 'rgba(156, 163, 175, 0.4)',
              borderRadius: 8,
              barPercentage: 0.65,
              categoryPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 10,
                font: {
                  size: 11,
                },
                color: '#6B7280',
              },
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: '#F3F4F6',
              bodyColor: '#D1D5DB',
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(156, 163, 175, 0.15)',
              },
              ticks: {
                stepSize: 1,
                color: '#6B7280',
              },
              title: {
                display: true,
                text: 'Number of Tasks',
                color: '#9CA3AF',
                font: {
                  size: 11,
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11,
                },
              },
            },
          },
        },
      });
    });

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  // Calculate overall completion percentage
  const totalCompleted = data.completed.reduce((a, b) => a + b, 0);
  const totalTasks = data.total.reduce((a, b) => a + b, 0);
  const overallPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Overall Progress Summary */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overall Completion</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {overallPercentage}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {totalCompleted} / {totalTasks}
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <canvas ref={chartRef} height="250"></canvas>

      {/* Legend / Key Insights */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Completed tasks per team
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Total tasks per team
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;