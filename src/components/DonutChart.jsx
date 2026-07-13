import React, { useEffect, useRef } from 'react';
import { donutChartData } from '../data/dashboardData';
import { toPersianNum } from '../utils/helpers';

// رسم نمودار دایره‌ای روی کانواس
function drawDonutChart(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 160;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = Math.max(1, size / 2 - 4);
  const innerR = Math.max(1, outerR - 22);

  const total = donutChartData.reduce((s, d) => s + d.value, 0);
  let startAngle = -Math.PI / 2;
  const gap = 0.04; // فاصله بین بخش‌ها

  donutChartData.forEach((segment) => {
    const sliceAngle = (segment.value / total) * Math.PI * 2 - gap;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();

    startAngle = endAngle + gap;
  });
}

// پنل توزیع وضعیت تسک‌ها (نمودار دایره‌ای + لجند)
export default function DonutChart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawDonutChart(canvasRef.current);
    }
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">توزیع وضعیت تسک‌ها</div>
      </div>
      <div className="chart-container">
        <div className="donut-chart">
          <canvas ref={canvasRef} id="donutChart" width="320" height="320"></canvas>
          <div className="donut-center">
            <div className="donut-center-value fa-num">۱۲۸</div>
            <div className="donut-center-label">کل تسک‌ها</div>
          </div>
        </div>
        <div className="chart-legend" id="chartLegend">
          {donutChartData.map((d) => (
            <div className="legend-item" key={d.label}>
              <div className="legend-right">
                <div className="legend-dot" style={{ background: d.color }}></div>
                <span className="legend-label">{d.label}</span>
              </div>
              <span className="legend-value fa-num">{toPersianNum(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
