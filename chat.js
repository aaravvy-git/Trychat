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

// Audio effects initialization
var sendAudio = new Audio('s.mp3');
var receiveAudio = new Audio('g.mp3');

document.addEventListener("DOMContentLoaded", function() {
  var messageInput = document.getElementById("messageInput");
  var fileInput = document.getElementById("fileInput");
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
      usernameContainer.style.display = "none";
      chatContainer.style.display = 'block';
      document.querySelector(".input-container").style.display = 'flex';
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
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const storageRef = firebase.storage().ref('uploads/' + new Date().getTime() + "-" + file.name);
      const uploadTask = storageRef.put(file);
      uploadTask.on('state_changed', null, null, () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          firebase.database().ref("messages").push().set({
            username: username,
            content: messageContent,
            fileUrl: downloadURL,
            fileType: file.type
          });
          messageInput.value = "";
          fileInput.value = "";  // Reset file input
          sendAudio.play();
        });
      });
    } else if (messageContent !== "") {
      firebase.database().ref("messages").push().set({
        username: username,
        content: messageContent
      });
      messageInput.value = "";
      sendAudio.play();
    }
  });

  // Function to process spoilers within a message
  function processSpoilers(message) {
    return message.replace(/\|\|([^|]+)\|\|/g, '<span class="spoiler-text" onclick="revealSpoiler(this)">$1</span>');
  }

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
    contentElement.innerHTML = processSpoilers(message.content);
    messageElement.appendChild(contentElement);

    if (message.fileUrl) {
      if (message.fileType.startsWith('image/')) {
        const imageElement = document.createElement('img');
        imageElement.src = message.fileUrl;
        imageElement.style.maxWidth = "200px"; 
        messageElement.appendChild(imageElement);
      } else if (message.fileType === 'application/pdf') {
        const fileLink = document.createElement('a');
        fileLink.href = message.fileUrl;
        fileLink.innerText = "View File";
        fileLink.target = "_blank";
        messageElement.appendChild(fileLink);
      } 
    }

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (message.username !== username) {
        receiveAudio.play();
    }
  });

  usernameContainer.style.display = "flex";
});

// Function to reveal spoiler text
function revealSpoiler(element) {
    element.style.background = 'none';
    element.style.color = '#DCDDDE';
          }
