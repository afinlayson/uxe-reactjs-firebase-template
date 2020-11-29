import React from 'react';
import SignInPage from "../SignIn"; 


class Landing extends React.Component {

  render() {
    // if(au)
    let signin;

    if (true) {      
      signin = <SignInPage />
    }

    return (
    <div>
      <h1>Landing</h1>
      {signin}
    </div>
    );
  }
}


export default Landing;