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
  let items = [
    {to: ROUTES.LANDING, name: "Landing"},
    {to: ROUTES.HOME, name: "Home"},
    {to: ROUTES.ACCOUNT, name: "Account"},        
  ]

  if (!!authUser.roles[AUTH.ADMIN]) {
    items.push({to: ROUTES.ADMIN, name: "Admin"});
  }
  
  let rtn = items.map( item => (<div className={styles.cell} key={"NavigationAuth"+item.name}><Link to={item.to}>{item.name}</Link></div>))
  rtn.push(<div className={styles.cell} key={"NavigationAuthSignOut"}><SignOutButton /></div>);
  return rtn;
}

const NavigationNonAuth = () => {
  let items = [
    {to: ROUTES.LANDING, name: "Landing"},
    {to: ROUTES.SIGN_IN, name: "Sign In"}
  ]

  let rtn = items.map( item => (<div className={styles.cell} key={"NavigationNonAuth"+item.name}><Link to={item.to}>{item.name}</Link></div>))
  if (AUTH.ALWAYS_ALLOW_SIGNOUT) {
    rtn.push(<div className={styles.cell}key={"NavigationNonAuthSignOut"}><SignOutButton /></div>);
  }
  return rtn;           
};

 
export default Navigation;
