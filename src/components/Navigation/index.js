import React from 'react';
import { Link } from 'react-router-dom';
 
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as AUTH from '../../constants/auth';
import styles from './index.module.css';
import { AuthUserContext } from '../Session';


class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.isOpen = false;
  }
  toggleNav(e) {
    let menu = document.getElementById("NavigationMenu");
    // let main = document.getElementById("Main");
    if (this.isOpen) {
      this.isOpen = false;
      menu.style.height = "0px";      
    } else {
      this.isOpen = true;
      menu.style.height = "30px";      
    }
  }
  render() {
    let self = this;
    return (
      <div>
        <div className={styles.navigation} id="NavigationMenu">
          <span className={styles.navigationMargin}>            
            <AuthUserContext.Consumer>
              {authUser =>
                authUser ? (
                  <NavigationAuth authUser={authUser} />
                ) : (
                  <NavigationNonAuth />
                )
              }
            </AuthUserContext.Consumer>            
            <a href="javascript:void(0)" className={styles.navigationCloseButton} onClick={(e)=>{self.toggleNav(e)}}>&times;</a>
          </span>
        </div>
        <NavigationButton open={(e)=>{self.toggleNav(e)}}></NavigationButton>
      </div>
    );
  }
}

class NavigationButton extends React.Component {

  render() {   
    let self = this;
    return (<div className={styles.navigationButton}>
      <a href="javascript:void(0)" className={styles.navigationText} onClick={(e)=>{self.props.open(e)}}>&#9776; open</a>
      
    </div>);
  }
}  

const NavigationAuth = ({ authUser }) => {    
  return [  
    <div className={styles.cell}><Link to={ROUTES.LANDING}>Landing</Link></div>,
    <div className={styles.cell}><Link to={ROUTES.HOME}>Home</Link></div>,
    <div className={styles.cell}><Link to={ROUTES.ACCOUNT}>Account</Link></div>,
    <div>{!!authUser.roles[AUTH.ADMIN] && (    
        <div className={styles.cell}><Link to={ROUTES.ADMIN}>Admin</Link></div>    
    )}</div>,
    <div className={styles.cell}><SignOutButton /></div>
  ]};

const NavigationNonAuth = () => ([
  <div className={styles.cell}><Link to={ROUTES.LANDING}>Landing</Link></div>,
  <div className={styles.cell}><Link to={ROUTES.SIGN_IN}>Sign In</Link></div>                
]);

 
export default Navigation;
