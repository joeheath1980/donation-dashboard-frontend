import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';

function NavBar() {
  return (
    <nav className={styles.navBar}>
      <NavLink to="/ImpactSpace" className={styles.navItem} activeClassName={styles.active}>
        Your ImpactSpace
      </NavLink>
      <NavLink to="/contributions" className={styles.navItem} activeClassName={styles.active}>
        My Contributions
      </NavLink>
      <NavLink to="/profile" className={styles.navItem} activeClassName={styles.active}>
        Profile/Settings
      </NavLink>
    </nav>
  );
}

export default NavBar;
