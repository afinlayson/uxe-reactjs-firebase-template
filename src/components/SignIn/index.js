import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
 
import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase, signInWithGoogle } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import style from './index.module.css';
 
const SignInPage = () => (
    <div className={style.root}>
        <h1 className={style.title}>SignIn</h1>
        <SignInForm />  
        <SignInWithGoogle />            
        <PasswordForgetLink />
        <SignUpLink />
    </div>
);
 
const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};
 
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
        
            
            <div className={style.outline}>
                
            <form onSubmit={this.onSubmit}>
                <div className={style.form}>
                    <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Email Address"
                    className={style.username}
                    />
                </div>
                <div className={style.form}>
                    <input
                    name="password"
                    value={password}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                    className={style.password}
                    />
                </div>
                <button disabled={isInvalid} type="submit" className={style.submit}>
                Sign In
                </button>
        
                {error && <p>{error.message}</p>}
            </form>
        
    </div>
    );
  }
}
 
const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

function SignInWithGoogle(props) {

    // let signInWithGoogle = props.firebase.signInWithGoogle;

    return (
    <div className={style.google}>
        <button className={style.loginProviderButton} onClick={signInWithGoogle}>
        <img src="/Google/btn_google_signin_light_normal_web.png" alt="google icon"/>       
        </button>
    </div>
    );
}
 
export default SignInPage;
 
export { SignInForm };
