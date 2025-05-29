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
        {/* Update the src path as needed for your logo */}
        <img src="/BWW.png" alt="TradeHive Logo" className="brand-logo" />
        TradeHive
      </div>
      <ul className="sidebar-nav">
        <li><Link to="#home">Home</Link></li>
        <li><Link to="/trade">Add Trade</Link></li>
        <li><Link to="#profile">Profile</Link></li>
        <li><Link to="#settings">Settings</Link></li>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </ul>
    </nav>
  );
}

export default Sidebar;