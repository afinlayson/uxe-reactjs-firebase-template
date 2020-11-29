import React, { Component } from 'react';
import { compose } from 'recompose';

import { Link, withRouter } from 'react-router-dom';
 
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as AUTH from '../../constants/auth.js'
import {SignInFacebook, SignInTwitter, SignInGoogle} from '../SignIn';
 
const SignUpPage = () => {
  
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
    email = <SignUpForm />
    // emailForgot = <PasswordForgetLink />
  }
  
  return (
    <div className="AuthBox">
      <h1 className="AuthTitle">SignUp</h1>
      {email}
      {fb}
      {goog}
      {twitter}
      {emailForgot}
      {signup}
      <div className="AuthPadding" />
    </div>
  );
}

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    error: null,
  };
  
 
class SignUpFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }
 
  onSubmit = event => {
    const { username, email, passwordOne } = this.state;
 
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            username,
            email,
          });
      })
      .then(authUser => {
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
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;
 
    const isInvalid =
        passwordOne !== passwordTwo ||
        passwordOne === '' ||
        email === '' ||
        username === '';

    return (
      <div className="AuthForm">
        <form onSubmit={this.onSubmit}>
          
          <input
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="Full Name"
            className="AuthEmail"
          />
          <input
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
            className="AuthEmail"
          />
          <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
            className="AuthPassword"
          />
          <input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm Password"
            className="AuthPassword"
          />
          <button disabled={isInvalid} type="submit" className="AuthSubmit">
            Sign Up
          </button>
        
          {error && <p>{error.message}</p>}
          <div className="AuthPadding" />
        </form>
      </div>
    );
  }

}
 
const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

// const SignUpForm = withRouter(withFirebase(SignUpFormBase));
const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);
 
export default SignUpPage;
 
export { SignUpForm, SignUpLink };
