import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <header>
      <nav className={styles.navbar}>
        
        <div className={styles.logo}>
          <h3>HYGO</h3>
          <span>LeadManagement</span>
        </div>

        {/* Links */}
        <ul className={styles.navLinks}>
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Leads</a></li>
          <li><a href="#">Activities</a></li>
          <li><a href="#">Users</a></li>
        </ul>

        {/* Right Section */}
        <div className={styles.navRight}>
          <input
            type="text"
            placeholder="Search leads..."
            className={styles.searchBox}
          />
          <button className={styles.btn}>+ Add Lead</button>
        </div>

        {/* Menu Toggle */}
        <div className={styles.menuToggle}>
          ☰
        </div>

      </nav>
    </header>
  );
};

export default Navbar;










// import React from "react";
// import "./Navbar.css";

// function NavbarComponent() {
//   return (
//     <header>
//       <nav className="navbar">
        
//         {/* Logo */}
//         <div className="logo">
//           <h3 style={{ textAlign: "center", margin: 0 }}>HYGO</h3>
//           <span>LeadManagement</span>
//         </div>

//         {/* Links */}
//         <ul className="nav-links">
//           <li><a href="#">Dashboard</a></li>
//           <li><a href="#">Leads</a></li>
//           <li><a href="#">Activities</a></li>
//           {/* <li><a href="#">Pipeline</a></li>
//           <li><a href="#">Reports</a></li> */}
//           <li><a href="#">Users</a></li>
//         </ul>

//         {/* Right Section */}
//         <div className="nav-right">
//           <input
//             type="text"
//             placeholder="Search leads..."
//             className="search-box"
//           />
//           <button className="btn">+ Add Lead</button>
//         </div>

//         {/* Menu Toggle */}
//         <div className="menu-toggle">
//           ☰
//         </div>

//       </nav>
//     </header>
//   );
// }

// export default NavbarComponent;