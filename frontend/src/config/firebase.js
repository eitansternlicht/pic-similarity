  import firebase from "firebase"
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyA4Wc36_9273FfZ-cZ5ogzuc4uELXSdKmM",
    authDomain: "pic-similarity.firebaseapp.com",
    databaseURL: "https://pic-similarity.firebaseio.com",
    projectId: "pic-similarity",
    storageBucket: "pic-similarity.appspot.com",
    messagingSenderId: "125234123383",
    appId: "1:125234123383:web:d9aeef8fd3850a0067ec72"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase