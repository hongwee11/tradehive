import Sidebar from "./components/sidebar";
// Import your widgets here, e.g.:
// import PortfolioChart from "./components/PortfolioChart";
// import TopHoldings from "./components/TopHoldings";
import "./dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Add your widgets here */}
        {/* <PortfolioChart /> */}
        {/* <TopHoldings /> */}
        <h1>Welcome to Your Dashboard</h1>
        <p>This is your dashboard main area.</p>
      </main>
    </div>
  );
}

export default Dashboard;