import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
 
import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as AUTH from '../../constants/auth.js'

import style from './index.module.css';
import '../Common/Auth.css';
 
const SignInPage = () => {
    let fb;
    let goog; 
    let twitter;
    let email;
    let emailForgot;
    let signup;
  
    if (AUTH.FACEBOOK) {
      fb = <SignInFacebook />;
    }
    if (AUTH.GOOGLE) {
      goog = <SignInGoogle />
    }
    if (AUTH.TWITTER) {
      twitter = <SignInTwitter />;
    }
    if (AUTH.EMAIL) {
      email = <SignInForm />
      emailForgot = <PasswordForgetLink />
    }
  
    if (AUTH.SIGNUP) {
      signup = <SignUpLink />
    }
  
    return (
    <div className="AuthBox">
      <h1 className="AuthTitle">SignIn</h1>
      {email}
      {fb}
      {goog}
      {twitter}
      {emailForgot}
      {signup}
      <div className="AuthPadding" />
    </div>
  )};
 
const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};
const ERROR_CODE_ACCOUNT_EXISTS =
  'auth/account-exists-with-different-credential';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an E-Mail address to
  this social account already exists. Try to login from
  this account instead and associate your social accounts on
  your personal account page.
`;
 
class SignInFormBase extends Component {
  constructor(props) {
    super(props);
 
    this.state = { ...INITIAL_STATE };
  }
 
  onSubmit = event => {
    const { email, password } = this.state;
 
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });
 
    event.preventDefault();
  };
 
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
 
  render() {
    const { email, password, error } = this.state;
 
    const isInvalid = password === '' || email === '';
 
    return (
        <div className="AuthForm">
            <form onSubmit={this.onSubmit}>
                <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Email Address"
                    className="AuthEmail"
                />
                <input
                    name="password"
                    value={password}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                    className="AuthPassword"
                />
                <button disabled={isInvalid} type="submit" className="AuthSubmit">Sign In
                </button>
  
            {error && <p>{error.message}</p>}
          </form>
        </div>
      );
  }
}
class SignInGoogleBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  componentDidUpdate() {
    let signin = document.getElementById("GoogleLoginButton")
    if (signin) {
      this.props.firebase.google.signInWithElement(signin);
    }
  }

  onSubmit = event => {      
    this.props.firebase
      .signInWithGoogle()
      .then(socialAuthUser => {
        // Create a user in your Firebase Realtime Database too
        debugger
        return this.props.firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.user.displayName,
          email: socialAuthUser.user.email,
          roles: {},
        });
      })
      .then(() => {
          debugger
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        debugger
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    if (AUTH.GOOGLEAPIs) {
      // Note the Submit prevents the login from happening with GAPI, so we'll keep you on current page until we have login completed
      // We need to add a page push after we login (aka without a submit)
      return (
        <div id="GoogleLoginButton" className="AuthLoginProvider">
          <div className={style.googleButton}>
            <img src="/Google/btn_google_signin_light_normal_web.png" alt="google icon" className="AuthLoginProviderImage"/>       
          </div>
        </div>
      )
    }

    return (
      <form onSubmit={this.onSubmit}>
        <div className="AuthLoginProvider">
          <button className="AuthLoginProviderButton" type="submit">
            <img src="/Google/btn_google_signin_light_normal_web.png" alt="google icon" className="AuthLoginProviderImage"/>       
          </button>
          </div>  
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

class SignInFacebookBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = event => {
    this.props.firebase
      .signInWithFacebook()
      .then(socialAuthUser => {
        // Create a user in your Firebase Realtime Database too
        return this.props.firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.additionalUserInfo.profile.name,
          email: socialAuthUser.additionalUserInfo.profile.email,
          roles: {},
        });
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
        <form onSubmit={this.onSubmit}>
            <div className="AuthLoginProvider">
                <button type="submit">Sign In with Facebook</button>
                {error && <p>{error.message}</p>}
            </div>
      </form>
    );
  }
}

class SignInTwitterBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = event => {
    this.props.firebase
      .signInWithTwitter()
      .then(socialAuthUser => {
        // Create a user in your Firebase Realtime Database too
        return this.props.firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.additionalUserInfo.profile.name,
          email: socialAuthUser.additionalUserInfo.profile.email,
          roles: {},
        });
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <div className="AuthLoginProvider">
          <button type="submit" className="AuthLoginProviderButton">
          <img src="/Twitter/sign-in-with-twitter-gray.png" alt="twitter icon" className="AuthLoginProviderImage"/>       
          </button>    
          {error && <p>{error.message}</p>}
        </div>
      </form>
    );
  }
}

const SignInGoogle = compose(
  withRouter,
  withFirebase,
)(SignInGoogleBase);

const SignInFacebook = compose(
  withRouter,
  withFirebase,
)(SignInFacebookBase);

const SignInTwitter = compose(
  withRouter,
  withFirebase,
)(SignInTwitterBase);
 
const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);
 
export default SignInPage;
 
export { SignInForm, SignInGoogle, SignInFacebook, SignInTwitter };
