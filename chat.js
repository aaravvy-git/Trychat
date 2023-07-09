// Replace the following configuration with your own Firebase project details
var firebaseConfig = {
  apiKey: "AIzaSyAdoKFG0lCLpG5uL7yY2ucb9Rcsfy3DZv8",
  authDomain: "my-first-project-4daee.firebaseapp.com",
  projectId: "my-first-project-4daee",
  storageBucket: "my-first-project-4daee.appspot.com",
  messagingSenderId: "71109801712",
  appId: "1:71109801712:web:654ef77908511ee9497435",
  measurementId: "G-CQS2S1B598"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", function() {
  var messageInput = document.getElementById("messageInput");
  var chatContainer = document.getElementById("chatContainer");
  var sendButton = document.getElementById("sendButton");
  var usernameContainer = document.getElementById("usernameContainer");
  var usernameInput = document.getElementById("usernameInput");
  var usernameSubmit = document.getElementById("usernameSubmit");
  var username = null;

  function setUsername() {
    var inputUsername = usernameInput.value.trim();
    if (inputUsername !== "") {
      username = inputUsername;
      usernameContainer.style.display = "none";
    }
  }

  usernameSubmit.addEventListener("click", setUsername);
  usernameInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      setUsername();
    }
  });

  sendButton.addEventListener("click", function() {
    var messageContent = messageInput.value.trim();
    if (messageContent !== "") {
      firebase.database().ref("messages").push().set({
        username: username,
        content: messageContent
      });
      messageInput.value = "";
    }
  });

  firebase.database().ref("messages").on("child_added", function(snapshot) {
    var message = snapshot.val();
    var messageElement = document.createElement("div");
    messageElement.classList.add("message");

    var usernameElement = document.createElement("span");
    usernameElement.classList.add("message-username");
    usernameElement.innerText = message.username + ": ";
    messageElement.appendChild(usernameElement);

    var contentElement = document.createElement("span");
    contentElement.classList.add("message-content");
    contentElement.innerText = message.content;
    messageElement.appendChild(contentElement);

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });

  usernameContainer.style.display = "flex";
});
