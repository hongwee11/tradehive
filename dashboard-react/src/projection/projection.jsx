import React from 'react';
import Sidebar from '../dashboard/components/sidebar';
import './projection.css';

function ProjectionsPage() {
  // Current earnings data (static for now)
  const currentEarnings = {
    eps: 20.92,
    pe: 4.11,
    epsGrowth: 31.5
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="projections-main">
        <h1 className="projections-title">Stock Projections</h1>
        
        <div className="projections-container">
          {/* Left Column - Assumptions */}
          <div className="assumptions-column">
            <div className="assumptions-card">
              <h2 className="section-title">Assumptions</h2>
              
              {/* Current Earnings Section */}
              <div className="current-earnings-section">
                <h3 className="subsection-title">Current Earnings</h3>
                
                <div className="earnings-grid">
                  <div className="earnings-item">
                    <span className="earnings-label">EPS (TTM)</span>
                    <span className="earnings-value">${currentEarnings.eps}</span>
                  </div>
                  
                  <div className="earnings-item">
                    <span className="earnings-label">P/E TTM</span>
                    <span className="earnings-value">{currentEarnings.pe}</span>
                  </div>
                  
                  <div className="earnings-item">
                    <span className="earnings-label">EPS Growth</span>
                    <span className="earnings-value">{currentEarnings.epsGrowth}%</span>
                  </div>
                </div>
              </div>

              {/* Inputs will be added later */}
            </div>
          </div>

          {/* Right Column - Projection Chart */}
          <div className="projection-column">
            <div className="projection-card">
              <h2 className="section-title">5-Year Projection</h2>
              
              {/* Calculation Results */}
              <div className="calculation-results">
                <h3 className="subsection-title">Calculation Results</h3>
                
                <div className="results-grid">
                  <div className="result-item">
                    <span className="result-label">Return from today's price</span>
                    <span className="result-value highlight">Filler</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Entry Price for 15% Return</span>
                    <span className="result-value">Filler</span>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="chart-placeholder">
                <p>Chart will go here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProjectionsPage;