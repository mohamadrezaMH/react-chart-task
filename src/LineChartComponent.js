import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Papa from "papaparse"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  registerables
} from "chart.js";

import 'chartjs-adapter-date-fns'; 

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend , ...registerables);

const LineChartComponent = () => {
  // State to store chart data
  const [data, setData] = useState(null); 

  // Function to load and parse CSV data
  const loadCSVData = async (csvFile) => {
    try {
      const response = await fetch(csvFile);
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        complete: (result) => {
          // Check for valid data
          if (!result.data || result.data.length === 0) {
            console.error('No valid data found');
            return;
          }

          // Extract relevant columns from CSV
          const labels = [];
          const temperature = [];
          const dewPoint = [];
          const windSpeed = [];

          result.data.forEach((row) => {
            labels.push(row.time);
            temperature.push(parseFloat(row['temperature_2m (°C)']));
            dewPoint.push(parseFloat(row['dew_point_2m (°C)']));
            windSpeed.push(parseFloat(row['wind_speed_10m (km/h)']));
          });

          // Update state with formatted data
          setData({
            labels,
            datasets: [
              {
                label: "temperature_2m",
                data: temperature,
                borderColor: "rgba(0, 128, 255, 1)",
                backgroundColor: "rgba(0, 128, 255, 0.2)",
                yAxisID: "y1",
                tension: 0.4,
                pointBackgroundColor: "rgba(0, 128, 255, 1)",
                pointRadius: 0,
                hoverRadius: 8,
              },
              {
                label: "dew_point_2m",
                data: dewPoint,
                borderColor: "rgba(128, 0, 255, 1)",
                backgroundColor: "rgba(128, 0, 255, 0.2)",
                pointBackgroundColor: "rgba(128, 0, 255, 1)",
                yAxisID: "y1",
                tension: 0.4,
                pointStyle: "rectRot",
                pointRadius: 0,
                hoverRadius: 8,
              },
              {
                label: "wind_speed_10m",
                data: windSpeed,
                borderColor: "rgba(0, 255, 128, 1)",
                backgroundColor: "rgba(0, 255, 128, 0.2)",
                pointBackgroundColor: "rgba(0, 255, 128, 1)",
                yAxisID: "y2",
                tension: 0.4,
                pointStyle: "rect",
                pointRadius: 0,
                hoverRadius: 8,
                Animation : false,
              },
            ],
          });
        },
        error: (err) => {
          console.error('Error parsing CSV:', err);
        }
      });
    } catch (err) {
      console.error('Error loading CSV file:', err);
    }
  };

  // Load CSV data when component mounts
  useEffect(() => {
    const csvFile = "./file.csv"; 
    loadCSVData(csvFile);
  }, []);

  // Chart.js options for configuring the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "white",
          font: {
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "52.52°N 13.42°E 38m above sea level",
        color: "white",
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw;
            const unit = context.dataset.yAxisID === "y1" ? "°C" : "km/h";
            return `${label}: ${value} ${unit}`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "white",
        bodyColor: "white",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        type: "time",  
        time: {
          unit: "day",  
          tooltipFormat: "yyyy-MM-dd'  'HH:mm",  
          displayFormats: {
            day: "dd MMM",  
          },
        },
        ticks: {
          color: "white", 
          maxRotation: 0, 
          minRotation: 0,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.5)", 
          borderColor: "white", 
          borderWidth: 2, 
        },
      },
      y1: {
        type: "linear",
        position: "left",
        ticks: {
          color: "white",
          callback: (value) => `${value}°C`,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
      y2: {
        type: "linear",
        position: "left",
        ticks: {
          color: "white",
          callback: (value) => `${value} km/h`,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
  };

  // Add plugin for drawing vertical line
  const verticalLinePlugin = {
    id: "verticalLine",
    beforeDraw: (chart) => {
      if (chart.tooltip?._active?.length) {
        const ctx = chart.ctx;
        const activePoint = chart.tooltip._active[0];
        const x = activePoint.element.x;
        const topY = chart.scales.y1.top;
        const bottomY = chart.scales.y1.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.restore();
      }
    },
  };

  // Register plugin
  ChartJS.register(verticalLinePlugin);

  return (
    <div style={{ width: "80%", height: "500px", backgroundColor: "#1e1e1e", marginBottom: "50px" , padding: "20px", borderRadius: "8px" }}>
      {data ? <Line data={data} options={options} /> : <p>Loading data...</p>}
    </div>
  );
};

export default LineChartComponent;
