import React from 'react';
import { Link } from 'react-router-dom';
 
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as AUTH from '../../constants/auth';
import styles from './index.module.css';
import { AuthUserContext } from '../Session';

const Navigation = () => (
  <div>
<AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ) : (
        <NavigationNonAuth />
      )
    }
  </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = ({ authUser }) => {
  console.log("", AUTH);
  // debugger
  // return <div />;
  return (
  <div className={styles.navigation}>
    <div className={styles.cell}><Link to={ROUTES.LANDING}>Landing</Link></div>    
    {/* <div className={styles.cell}><Link to={ROUTES.SIGN_IN}>Sign In</Link></div>          */}
    <div className={styles.cell}><Link to={ROUTES.HOME}>Home</Link></div>
    <div className={styles.cell}><Link to={ROUTES.ACCOUNT}>Account</Link></div>
    {!!authUser.roles[AUTH.ADMIN] && (    
        <div className={styles.cell}><Link to={ROUTES.ADMIN}>Admin</Link></div>    
    )}
    <div className={styles.cell}><SignOutButton /></div>
      
  </div>
)};

const NavigationNonAuth = () => (
  <div className={styles.navigation}>
    <div className={styles.cell}><Link to={ROUTES.LANDING}>Landing</Link></div>
    <div className={styles.cell}><Link to={ROUTES.SIGN_IN}>Sign In</Link></div>              
  </div>
);

 
export default Navigation;
