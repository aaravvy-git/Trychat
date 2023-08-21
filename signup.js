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

document.addEventListener("DOMContentLoaded", function() {
  var signupUsername = document.getElementById("signupUsername");
  var signupPassword = document.getElementById("signupPassword");
  var signupSubmit = document.getElementById("signupSubmit");

  signupSubmit.addEventListener("click", function() {
    var username = signupUsername.value.trim();
    var password = signupPassword.value.trim();

    if (username !== "" && password !== "") {
      firebase.database().ref("users/" + username).once('value').then(function(snapshot) {
        if(snapshot.exists()) {
          alert("Username already taken. Please choose another.");
        } else {
          firebase.database().ref("users/" + username).set({
            password: password
          });
          alert("Signup successful!");
          window.location.href = "chat.html";
        }
      });
    } else {
      alert("Please fill out both fields.");
    }
  });
});
