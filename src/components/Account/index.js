import React, { Component } from 'react';
import { compose } from 'recompose';

import * as AUTH from '../../constants/auth.js'
import '../Common/Auth.css';

import {
  AuthUserContext,
  withAuthorization  
} from '../Session';
import { withFirebase } from '../Firebase';
import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';

const SIGN_IN_METHODS = [
  {
    type: 'password',
    provider: null,
    available: AUTH.EMAIL
  },
  {
    type: 'google.com',
    provider: 'googleProvider',
    available: AUTH.GOOGLE
  },
  {
    type: 'facebook.com',
    provider: 'facebookProvider',
    available: AUTH.FACEBOOK
  },
  {
    type: 'twitter.com',
    provider: 'twitterProvider',
    available: AUTH.TWITTER
  },
];

const AccountPage = () => {
  
  let email;
  if (AUTH.EMAIL) {
    email = [
      <PasswordForgetForm />,
      <PasswordChangeForm />
    ];
  }
  return (
  <AuthUserContext.Consumer>
    {authUser => (
      <div className="AuthBox">
        <h1 className="AuthTitle">Account: {authUser.email}</h1>
        {email}
        <LoginManagement authUser={authUser} />
        <div className="AuthPadding"></div>
      </div>
    )}
  </AuthUserContext.Consumer>
)};

class LoginManagementBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSignInMethods: [],
      error: null,
    };
  }

  componentDidMount() {
    this.fetchSignInMethods();
  }

  fetchSignInMethods = () => {
    this.props.firebase.auth
      .fetchSignInMethodsForEmail(this.props.authUser.email)
      .then(activeSignInMethods =>
        this.setState({ activeSignInMethods, error: null }),
      )
      .catch(error => this.setState({ error }));
  };

  onSocialLoginLink = provider => {
    this.props.firebase.auth.currentUser
      .linkWithPopup(this.props.firebase[provider])
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({ error }));
  };

  onDefaultLoginLink = password => {
    const credential = this.props.firebase.emailAuthProvider.credential(
      this.props.authUser.email,
      password,
    );

    this.props.firebase.auth.currentUser
      .linkAndRetrieveDataWithCredential(credential)
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({ error }));
  };

  onUnlink = providerId => {
    this.props.firebase.auth.currentUser
      .unlink(providerId)
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({ error }));
  };

  render() {
    const { activeSignInMethods, error } = this.state;

    return (
      <div className="AuthSubtitle">
        Sign In Methods:        
          {SIGN_IN_METHODS.map(signInMethod => {
            const onlyOneLeft = activeSignInMethods.length === 1;
            const isEnabled = activeSignInMethods.includes(
              signInMethod.type,
            );
            
            const available = signInMethod.available;

            if (!available) {
              return null;
            }

            return (
              <div key={signInMethod.type}>
                {signInMethod.type === 'password' ? (
                  <DefaultLoginToggle
                    onlyOneLeft={onlyOneLeft}
                    isEnabled={isEnabled}
                    signInMethod={signInMethod}
                    onLink={this.onDefaultLoginLink}
                    onUnlink={this.onUnlink}
                  />
                ) : (
                  <SocialLoginToggle
                    onlyOneLeft={onlyOneLeft}
                    isEnabled={isEnabled}
                    signInMethod={signInMethod}
                    onLink={this.onSocialLoginLink}
                    onUnlink={this.onUnlink}
                  />
                )}
              </div>
            );
          })}        
        {error && error.message}
      </div>
    );
  }
}

const SocialLoginToggle = ({
  onlyOneLeft,
  isEnabled,
  signInMethod,
  onLink,
  onUnlink,
}) =>
  isEnabled ? (
    <button
      type="button"
      onClick={() => onUnlink(signInMethod.type)}
      disabled={onlyOneLeft}
    >
      Deactivate {signInMethod.type}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => onLink(signInMethod.provider)}
    >
      Link {signInMethod.type}
    </button>
  );

class DefaultLoginToggle extends Component {
  constructor(props) {
    super(props);

    this.state = { passwordOne: '', passwordTwo: '' };
  }

  onSubmit = event => {
    event.preventDefault();

    this.props.onLink(this.state.passwordOne);
    this.setState({ passwordOne: '', passwordTwo: '' });
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      onlyOneLeft,
      isEnabled,
      signInMethod,
      onUnlink,
    } = this.props;

    const { passwordOne, passwordTwo } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === '';

    return isEnabled ? (
      <button
        className="AuthSubmit"
        type="button"
        onClick={() => onUnlink(signInMethod.type)}
        disabled={onlyOneLeft}
      >
        Deactivate {signInMethod.type}
      </button>
    ) : (
      <form onSubmit={this.onSubmit}>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="New Password"
          className="AuthPassword"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm New Password"
          className="AuthPassword"
        />

        <button disabled={isInvalid} type="submit">
          Link {signInMethod.type}
        </button>
      </form>
    );
  }
}

const LoginManagement = withFirebase(LoginManagementBase);

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(AccountPage);
