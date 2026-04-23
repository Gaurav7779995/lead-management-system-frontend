import React from "react";
import styles from "./FeatureSection.module.css";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

// Type for feature object
type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

// Data
const featuresData: Feature[] = [
  {
    icon: <TrendingUpIcon />,
    title: "Lead Tracking",
    desc: "Track every lead from start to conversion with complete visibility.",
  },
  {
    icon: <BarChartIcon />,
    title: "Reports & Analytics",
    desc: "Get real-time insights and performance analytics.",
  },
  {
    icon: <PeopleIcon />,
    title: "User Management",
    desc: "Manage users, roles, and permissions efficiently.",
  },
  {
    icon: <TrackChangesIcon />,
    title: "Target Monitoring",
    desc: "Set targets and track performance against goals.",
  },
];

const FeaturesComponent: React.FC = () => {
  return (
    <section className={styles.features}>
      <h2 className={styles.featuresTitle}>Powerful Features</h2>

      <p className={styles.featuresSubtitle}>
        Everything you need to manage and convert leads efficiently
      </p>

      <div className={styles.featuresContainer}>
        {featuresData.map((feature: Feature, index: number) => (
          <div className={styles.featureCard} key={index}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesComponent;

