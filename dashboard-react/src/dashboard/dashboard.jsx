import Sidebar from "./components/sidebar";
import Chart from "./components/chart";
import PositionTable from "./components/PositionTable";


// Import widgets here, e.g.:
// import PortfolioChart from "./components/PortfolioChart";
// import TopHoldings from "./components/TopHoldings";
import "./dashboard.css";
//Processsing data for the chart in dashboard or chart itself?
const tempData = [1000, 1200, 1500, 1300, 1700, 1500];
    const tempLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function Dashboard() {
  
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Top */}
        <div className="dashboard-top-row">
          <div className="widget widget-portfolio-value">Total Portfolio Value</div>
          <div className="widget widget-gain-loss">Total Gain/Loss</div>
          <div className="widget widget-daily-change">Day's Change</div>
        </div>
        
        {/* Middle */}
        <div className="dashboard-main-row">
          <div className="dashboard-main-left">
            <div className="widget widget-performance-chart">
              <Chart title="Portfolio Value Over Time" data={tempData} labels={tempLabels} />
          </div>
        </div>
        <div className="dashboard-main-right">
            <div className="widget widget-recent-trades">
              Recent Trades
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="holdings">
          <PositionTable />
        </div>
      </main>
    </div>
  );
}


export default Dashboard;