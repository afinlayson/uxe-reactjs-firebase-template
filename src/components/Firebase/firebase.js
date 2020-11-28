import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
    constructor() {
        // console.log(dotenv, process.env);
        app.initializeApp(config);
        this.googleProvider = app.auth.GoogleAuthProvider()
        this.auth = app.auth();
        this.db = app.database();
    }

    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();
   
    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);

          // *** User API ***
 
    user = uid => this.db.ref(`users/${uid}`);
    
    users = () => this.db.ref('users');

    
    signInWithGoogle = () => {
        this.auth.signInWithPopup(this.googleProvider).then((res) => {
            console.log(res.user)
        }).catch((error) => {
            console.log(error.message)
        });
    }
}

export default Firebase;