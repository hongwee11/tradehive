import Sidebar from "./components/sidebar";
import Chart from "./components/chart";
// Import your widgets here, e.g.:
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
        {/* Add your widgets here */}
        {/* <PortfolioChart /> */}
        {/* <TopHoldings /> */}
        <h1>Welcome to Your Dashboard hello</h1>
        <p>This is your dashboard main area.</p>
        <Chart title="Portfolio Value Over Time" data={tempData} labels={tempLabels} />
      </main>
    </div>
  );
}

export default Dashboard;