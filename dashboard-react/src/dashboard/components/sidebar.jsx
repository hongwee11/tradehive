import "./sidebar.css";
import { useNavigate , Link } from 'react-router-dom';



function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
  navigate('/');
};

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <img src="/BWW.png" alt="TradeHive Logo" className="brand-logo" />
        TradeHive
      </div>
      <ul className="sidebar-nav">
        <li><Link to="/dashboard">Home</Link></li>
        <li><Link to="/trade">Add Trade</Link></li>
        <li><Link to="/projection">Projections</Link></li>
        <li><Link to="/forum">Forum</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </ul>
    </nav>
  );
}

export default Sidebar;