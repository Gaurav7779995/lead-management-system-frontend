import styles from "./HeroSection.module.css";

function HeroSection() {
  return (
    <section className={styles.hero}>

      <div className={styles.heroContainer}>

        <div className={styles.heroContent}>

          <span className={styles.heroTag}>
            Lead Management System
          </span>

          <h1 className={styles.fadeIn}>
            Manage Leads with{" "}
            <span className={styles.highlight}>
              Clarity & Control
            </span>
          </h1>

          <p className={`${styles.fadeIn} ${styles.delay}`}>
            Streamline your sales process, track every lead, and improve conversion rates with a simple and powerful platform.
          </p>

          <div className={`${styles.heroButtons} ${styles.fadeIn} ${styles.delay2}`}>
            <button className={styles.btnPrimary}>Get Started</button>
            <button className={styles.btnSecondary}>View Demo</button>
          </div>

          <p className={`${styles.heroTrust} ${styles.fadeIn} ${styles.delay3}`}>
            Trusted by growing teams for efficient lead tracking
          </p>

        </div>

      </div>

    </section>
  );
}

export default HeroSection;