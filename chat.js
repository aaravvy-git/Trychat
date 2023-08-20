// Your Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBAWt0_iZAZijVi1rrKOUjMGYHtyw9HQ64",
  authDomain: "aaravchat-44e73.firebaseapp.com",
  projectId: "aaravchat-44e73",
  storageBucket: "aaravchat-44e73.appspot.com",
  messagingSenderId: "234190306046",
  appId: "1:234190306046:web:dcc3e28dbc134dca1003af",
  measurementId: "G-3GB9TJSLT7"
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

  // Initially, hide the chat and input containers
  chatContainer.style.display = 'none';
  document.querySelector(".input-container").style.display = 'none';

  function setUsername() {
    var inputUsername = usernameInput.value.trim();
    if (inputUsername !== "") {
      username = inputUsername;
      usernameContainer.style.display = "none"; // Hide username input
      chatContainer.style.display = 'block'; // Show chat container
      document.querySelector(".input-container").style.display = 'flex'; // Show input container
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

    // Spoiler check and implementation
    if (message.content.startsWith("||") && message.content.endsWith("||")) {
        contentElement.classList.add("spoiler");
        contentElement.innerText = "Click to reveal spoiler";
        contentElement.setAttribute("data-spoiler-content", message.content.slice(2, -2));
        contentElement.onclick = function() {
            this.innerText = this.getAttribute("data-spoiler-content");
            this.classList.remove("spoiler");
        };
    } else {
        contentElement.innerText = message.content;
    }

    messageElement.appendChild(contentElement);
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });

  usernameContainer.style.display = "flex";
});
