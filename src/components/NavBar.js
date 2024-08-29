import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../Layout.module.css'; // Assuming styles are in Layout.module.css

function NavBar() {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <NavLink to="/ImpactSpace" activeClassName={styles.active}>
            Your ImpactSpace
          </NavLink>
        </li>
        <li>
          <NavLink to="/contributions" activeClassName={styles.active}>
            My Contributions
          </NavLink>
        </li>
        <li>
          <NavLink to="/impact" activeClassName={styles.active}>
            Impact
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" activeClassName={styles.active}>
            Profile/Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/matching" activeClassName={styles.active}>
            Matching
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
