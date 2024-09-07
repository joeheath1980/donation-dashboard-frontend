import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../Layout.module.css';

function NavBar() {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <NavLink to="/ImpactSpace" className={styles.navLink} activeClassName={styles.active}>
            Your ImpactSpace
          </NavLink>
        </li>
        <li>
          <NavLink to="/contributions" className={styles.navLink} activeClassName={styles.active}>
            My Contributions
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={styles.navLink} activeClassName={styles.active}>
            Profile/Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/matching" className={styles.navLink} activeClassName={styles.active}>
            Matching
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
