import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
  // <button type="button" onClick={firebase.doSignOut}>  
  //   Sign Out
  // </button>
  <Link to={ROUTES.SIGN_IN} onClick={firebase.doSignOut}>Sign Out</Link>
);

export default withFirebase(SignOutButton);
