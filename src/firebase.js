import app from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyCPypfKpDIJ5wfTs19ABlkOKGO5zc1710c",
  authDomain: "biblioteca-2f952.firebaseapp.com",
  projectId: "biblioteca-2f952",
  storageBucket: "biblioteca-2f952.appspot.com",
  messagingSenderId: "912224541578",
  appId: "1:912224541578:web:e8e04bff8861ca51148673",
  measurementId: "G-E22H6L32E6"
};

// Initialize Firebase
app.initializeApp(firebaseConfig);

const db=app.firestore()
const auth=app.auth()
export {db,auth}