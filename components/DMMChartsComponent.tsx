'use client';

import React, { useState, useEffect, useRef } from 'react';

const DMMChartsComponent = () => {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const timelineRef = useRef<HTMLCanvasElement>(null);
  const costConventionalRef = useRef<HTMLCanvasElement>(null);
  const costDMMRef = useRef<HTMLCanvasElement>(null);
  const riskRef = useRef<HTMLCanvasElement>(null);
  const roiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load Chart.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    script.onload = () => {
      setChartsLoaded(true);
      setTimeout(createCharts, 100);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const createCharts = () => {
    if (!(window as any).Chart) return;

    const Chart = (window as any).Chart;

    // Timeline Chart
    if (timelineRef.current) {
      new Chart(timelineRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Planning', 'Permitting', 'Construction', 'Marketing', 'Sales'],
          datasets: [
            {
              label: 'Conventional (Months)',
              data: [8, 12, 20, 6, 6],
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 2
            },
            {
              label: 'DMM Partnership (Months)',
              data: [5, 8, 14, 4, 3],
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Development Timeline Comparison'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Months'
              }
            }
          }
        }
      });
    }

    // Conventional Cost Pie Chart
    if (costConventionalRef.current) {
      new Chart(costConventionalRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Land', 'Construction', 'Prof Fees', 'Marketing', 'Contingency'],
          datasets: [{
            data: [15, 25, 5, 3, 5],
            backgroundColor: [
              '#ef4444',
              '#f97316',
              '#a855f7',
              '#3b82f6',
              '#22c55e'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Conventional: $53M'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // DMM Cost Pie Chart
    if (costDMMRef.current) {
      new Chart(costDMMRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Land', 'Construction', 'Prof Fees', 'Marketing', 'Contingency', 'Partner Value'],
          datasets: [{
            data: [15, 20, 2, 2, 3, 3],
            backgroundColor: [
              '#14b8a6',
              '#059669',
              '#10b981',
              '#fbbf24',
              '#fb923c',
              '#16a34a'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'DMM: $45M (15% Savings)'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Risk Radar Chart
    if (riskRef.current) {
      new Chart(riskRef.current.getContext('2d'), {
        type: 'radar',
        data: {
          labels: ['Market Risk', 'Construction', 'Financial', 'Timeline', 'Quality', 'Regulatory'],
          datasets: [
            {
              label: 'Conventional Risk',
              data: [85, 70, 90, 75, 65, 80],
              borderColor: 'rgba(239, 68, 68, 1)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              pointBackgroundColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 2
            },
            {
              label: 'DMM Partnership Risk',
              data: [45, 35, 50, 30, 25, 35],
              borderColor: 'rgba(34, 197, 94, 1)',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              pointBackgroundColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Risk Profile Comparison'
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }

    // ROI Line Chart
    if (roiRef.current) {
      new Chart(roiRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
          datasets: [
            {
              label: 'Conventional ROI (%)',
              data: [-20, -5, 8, 15, 22],
              borderColor: 'rgba(239, 68, 68, 1)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'DMM Partnership ROI (%)',
              data: [-10, 5, 18, 28, 35],
              borderColor: 'rgba(34, 197, 94, 1)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'ROI Trajectory Comparison'
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'ROI Percentage'
              }
            }
          }
        }
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">DMM Development Model</h2>
        <p className="text-lg md:text-xl opacity-95">Partners Not Paychecks: Revolutionary Real Estate Development</p>
      </div>

      <div className="p-4 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
            <div className="text-2xl md:text-3xl font-bold text-green-600">25-35%</div>
            <div className="text-xs md:text-sm text-green-700">Time Reduction</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">15-25%</div>
            <div className="text-xs md:text-sm text-blue-700">Cost Savings</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">60%</div>
            <div className="text-xs md:text-sm text-purple-700">Risk Reduction</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
            <div className="text-2xl md:text-3xl font-bold text-orange-600">40%</div>
            <div className="text-xs md:text-sm text-orange-700">Higher Success</div>
          </div>
        </div>

        {/* Key Messages */}
        <div className="bg-gradient-to-r from-teal-500 to-green-500 text-white p-6 rounded-xl mb-6">
          <h3 className="text-lg font-bold text-center mb-4 text-white">Core Partnership Principles</h3>
          <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
            <div className="bg-white bg-opacity-90 p-4 rounded-lg text-center">
              <div className="font-bold text-sm md:text-base text-gray-800">
                "Investors hope - partners make it happen"
              </div>
            </div>
            <div className="bg-white bg-opacity-90 p-4 rounded-lg text-center">
              <div className="font-bold text-sm md:text-base text-gray-800">
                "Your expertise beats your investment"
              </div>
            </div>
            <div className="bg-white bg-opacity-90 p-4 rounded-lg text-center">
              <div className="font-bold text-sm md:text-base text-gray-800">
                "Stop betting on others - start building with them"
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Charts */}
        {chartsLoaded ? (
          <>
            {/* Timeline Chart */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <div className="h-80">
                <canvas ref={timelineRef}></canvas>
              </div>
            </div>

            {/* Cost Charts Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-red-50 p-6 rounded-xl">
                <div className="h-64">
                  <canvas ref={costConventionalRef}></canvas>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="h-64">
                  <canvas ref={costDMMRef}></canvas>
                </div>
              </div>
            </div>

            {/* Risk Chart */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <div className="h-80">
                <canvas ref={riskRef}></canvas>
              </div>
            </div>

            {/* ROI Chart */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <div className="h-80">
                <canvas ref={roiRef}></canvas>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interactive charts...</p>
          </div>
        )}

        {/* Bottom Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl text-center">
          <h3 className="text-xl font-bold mb-3 text-white">The DMM Advantage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white bg-opacity-90 p-3 rounded-lg">
              <div className="font-bold text-gray-800">$8M+ Saved</div>
              <div className="text-sm text-gray-600">per project</div>
            </div>
            <div className="bg-white bg-opacity-90 p-3 rounded-lg">
              <div className="font-bold text-gray-800">12+ Months</div>
              <div className="text-sm text-gray-600">faster delivery</div>
            </div>
            <div className="bg-white bg-opacity-90 p-3 rounded-lg">
              <div className="font-bold text-gray-800">60% Less Risk</div>
              <div className="text-sm text-gray-600">distributed expertise</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMMChartsComponent;