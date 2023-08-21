var firebaseConfig = {
  apiKey: "AIzaSyBAWt0_iZAZijVi1rrKOUjMGYHtyw9HQ64",
  authDomain: "aaravchat-44e73.firebaseapp.com",
  projectId: "aaravchat-44e73",
  storageBucket: "aaravchat-44e73.appspot.com",
  messagingSenderId: "234190306046",
  appId: "1:234190306046:web:dcc3e28dbc134dca1003af",
  measurementId: "G-3GB9TJSLT7"
};

firebase.initializeApp(firebaseConfig);

document.getElementById("signupButton").addEventListener("click", function() {
  var username = document.getElementById("signupUsername").value.trim();
  var password = document.getElementById("signupPassword").value.trim();

  if (username && password) {
    firebase.database().ref("users/" + username).set({
      password: password
    });
    alert("Signup successful");
  } else {
    alert("Please enter a valid username and password.");
  }
});
