import React from 'react';
import SignInPage from "../SignIn"; 
import { withFirebase } from '../Firebase';

import { AuthUserContext } from '../Session';

class Landing extends React.Component {



  render() {
    // if(au)
    let signin;    
    // if (this.props.firebase && this.props.firebase.isSignedIn()) {      
    //   signin = 
    // }

    return (
    <div>
      <h1>Landing</h1>
      <AuthUserContext.Consumer>
        {authUser => !authUser ? <SignInPage /> : <div>Signed In</div>}
      </AuthUserContext.Consumer>
    </div>
    );
  }
}


export default withFirebase(Landing);