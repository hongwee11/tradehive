import "./sidebar.css";

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        {/* Update the src path as needed for your logo */}
        <img src="/BWW.png" alt="TradeHive Logo" className="brand-logo" />
        TradeHive
      </div>
      <ul className="sidebar-nav">
        <li><a href="#home">Home</a></li>
        <li><a href="#profile">Profile</a></li>
        <li><a href="#settings">Settings</a></li>
        <li><a href="#logout">Logout</a></li>
      </ul>
    </nav>
  );
}

export default Sidebar;