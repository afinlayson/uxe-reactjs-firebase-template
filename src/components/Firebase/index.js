import FirebaseContext, { withFirebase } from './context';
import Firebase from './firebase';
import {signInWithGoogle} from './signInWithGoogle.js';

export default Firebase;

export { FirebaseContext, withFirebase, signInWithGoogle};