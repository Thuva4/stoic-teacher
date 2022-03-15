import React from "react";
import Chart from "chart.js";

export default function CardLineChart({xScale, dataSet}) {
  React.useEffect(() => {
    var config = {
      type: 'line',
      data: {
        labels: xScale,
        datasets: [dataSet]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                'millisecond': 'MMM DD',
                'second': 'MMM DD',
                'minute': 'MMM DD',
                'hour': 'MMM DD',
                'day': 'MMM DD',
                'week': 'MMM DD',
                'month': 'MMM DD',
                'quarter': 'MMM DD',
                'year': 'MMM DD',
              }
            }
          }],
        },
      }
    };
    var ctx = document.getElementById(`line-chart-${dataSet.label}`).getContext("2d");
    window.myLine = new Chart(ctx, config);
  }, [xScale, dataSet]);
  return (
    <>
      <div className="relative flex flex-col break-words w-full lg:w-6/12 xl:w-6/12 mb-6 shadow-lg rounded">
        <div className="p-4 flex-auto">
          <div className="relative">
            <canvas id={`line-chart-${dataSet.label}`}></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
