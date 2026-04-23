import styles from "./Footer.module.css";

function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footerContainer}>

        <div className={styles.footerLeftSection}>
          <h2>HYGO Technologies</h2>
          <p>
            Smart Lead Management System to track, manage, and convert leads efficiently.
          </p>
        </div>

        <div className={styles.footerQuickSection}>
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Leads</a></li>
            <li><a href="#">Activities</a></li>
            <li><a href="#">Reports</a></li>
            <li><a href="#">Users</a></li>
          </ul>
        </div>

        <div className={styles.footerFeatureSection}>
          <h3>Features</h3>
          <ul>
            <li>Lead Tracking</li>
            <li>Pipeline Management</li>
            <li>Reports & Analytics</li>
            <li>User Management</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Contact</h3>
          <p>Email: support@hygo.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Location: Gujarat, India</p>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 HYGO Technologies | All Rights Reserved</p>
        </div>

      </div>
    </div>
  );
}

export default Footer;





// import "./Footer.module.css";

// function FooterComponent() {
//     return (
//         <div className="footer">
//             <div className="footer-container">

//                 <div className="footer-left-section">
//                     <h2>HYGO Technologies</h2>
//                     <p>Smart Lead Management System to track, manage, and convert leads efficiently.</p>
//                 </div>

//                 <div className="footer-quick-section">
//                     <h3>Quick Links</h3>

//                     <ul>
//                         <li><a href="#">Dashboard</a></li>
//                         <li><a href="#">Leads</a></li>
//                         <li><a href="#">Activities</a></li>
//                         <li><a href="#">Reports</a></li>
//                         <li><a href="#">Users</a></li>
//                     </ul>

//                 </div>

//                 <div className="footer-feature-section">
//                     <h3>Features</h3>
//                     <ul>
//                         <li>Lead Tracking</li>
//                         <li>Pipeline Management</li>
//                         <li>Reports & Analytics</li>
//                         <li>User Management</li>
//                     </ul>
//                 </div>

//                 <div className="footer-section">
//                     <h3>Contact</h3>
//                     <p>Email: support@hygo.com</p>
//                     <p>Phone: +91 98765 43210</p>
//                     <p>Location: Gujarat, India</p>
//                 </div>

//                 <div className="footer-bottom">
//                     <p>© 2026 HYGO Technologies | All Rights Reserved</p>
//                 </div>
//             </div>
//         </div>
//     );
// }
// export default FooterComponent;