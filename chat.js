// Trychat-CSS chat.js patches
// Fixes HTML injection without outright deleting it.
//
//
//
var firebaseConfig = {
  apiKey: "AIzaSyBAWt0_iZAZijVi1rrKOUjMGYHtyw9HQ64",
  authDomain: "aaravchat-44e73.firebaseapp.com",
  projectId: "aaravchat-44e73",
  storageBucket: "aaravchat-44e73.appspot.com",
  messagingSenderId: "234190306046",
  appId: "1:234190306046:web:dcc3e28dbc134dca1003af",
  measurementId: "G-3GB9TJSLT7"
};


// Initialize Firebase (if not already)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Audio effects (keeps your original filenames)
var sendAudio = new Audio('s.mp3');
var receiveAudio = new Audio('g.mp3');

/* ---------------------------
 *   Safe rendering utilities
 *   --------------------------- */

// Build DOM nodes for a message text safely:
// - uses text nodes (no innerHTML) so <, >, <button>, <script> are shown as text
// - recognizes spoilers (||like this||) and creates clickable spoiler spans
// - recognizes URLs and either creates img/video/iframe/anchor nodes
function renderMessageContentFragment(text) {
  const frag = document.createDocumentFragment();

  if (!text) return frag;

  // Helper URL regexes
  const urlRegex = /https?:\/\/[^\s]+/g;
  const imageExt = /\.(gif|jpe?g|tiff?|png|webp|bmp)(\?.*)?$/i;
  const videoExt = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i;

  // First split by spoilers: keep the delimiter groups
  const spoilerParts = text.split(/(\|\|.*?\|\|)/g);

  spoilerParts.forEach(part => {
    if (!part) return;
    const isSpoiler = /^\|\|(.*)\|\|$/.test(part);
    if (isSpoiler) {
      const inner = part.slice(2, -2);
      const span = document.createElement('span');
      span.className = 'spoiler-text';
      // show hidden style initially
      span.textContent = inner;
      span.style.background = 'linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0.9))';
      span.style.color = 'transparent';
      span.style.borderRadius = '4px';
      span.style.padding = '0 4px';
      span.style.cursor = 'pointer';
      span.addEventListener('click', function () {
        // reveal
        this.style.background = 'none';
        this.style.color = '';
      });
      frag.appendChild(span);
      return;
    }

    // Process non-spoiler chunk: find URLs and split text accordingly
    let lastIndex = 0;
    let match;
    while ((match = urlRegex.exec(part)) !== null) {
      const url = match[0];
      const idx = match.index;

      // text before url
      if (idx > lastIndex) {
        frag.appendChild(document.createTextNode(part.slice(lastIndex, idx)));
      }

      // decide element type for URL
      if (imageExt.test(url)) {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'embedded-image';
        img.style.maxWidth = '240px';
        img.style.maxHeight = '240px';
        img.style.display = 'block';
        img.style.marginTop = '6px';
        frag.appendChild(img);
      } else if (videoExt.test(url)) {
        const vid = document.createElement('video');
        vid.src = url;
        vid.controls = true;
        vid.className = 'embedded-video';
        vid.style.maxWidth = '320px';
        vid.style.display = 'block';
        vid.style.marginTop = '6px';
        frag.appendChild(vid);
      } else {
        const youtubeMatch = youtubeRegex.exec(url);
        if (youtubeMatch) {
          const id = youtubeMatch[1];
          const iframe = document.createElement('iframe');
          iframe.width = 560;
          iframe.height = 315;
          iframe.src = 'https://www.youtube.com/embed/' + id;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.frameBorder = 0;
          iframe.className = 'embedded-youtube';
          iframe.style.maxWidth = '100%';
          iframe.style.marginTop = '6px';
          frag.appendChild(iframe);
        } else {
          // generic link
          const a = document.createElement('a');
          a.href = url;
          a.textContent = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'message-link';
          frag.appendChild(a);
        }
      }

      lastIndex = idx + url.length;
      // reset lastIndex for next iteration
      urlRegex.lastIndex = lastIndex;
    }

    // remaining text after last URL
    if (lastIndex < part.length) {
      frag.appendChild(document.createTextNode(part.slice(lastIndex)));
    }
    // reset regex state
    urlRegex.lastIndex = 0;
  });

  return frag;
}

/* ---------------------------
 *   DOM wiring & behavior
 *   --------------------------- */

document.addEventListener("DOMContentLoaded", function () {
  // match your original IDs/structure
  var messageInput = document.getElementById("messageInput");
  var fileInput = document.getElementById("fileInput");
  var chatContainer = document.getElementById("chatContainer");
  var sendButton = document.getElementById("sendButton");
  var usernameContainer = document.getElementById("usernameContainer");
  var usernameInput = document.getElementById("usernameInput");
  var usernameSubmit = document.getElementById("usernameSubmit");

  // input container (the area with the message input + send button)
  var inputContainer = document.querySelector(".input-container");

  // fallback if elements are not found — avoid hard errors
  if (!chatContainer) {
    console.error("chatContainer element not found. Make sure your HTML contains #chatContainer.");
    return;
  }
  if (!usernameContainer || !usernameInput || !usernameSubmit) {
    console.warn("username elements not found; will not prompt for username.");
  }

  // hide chat until username set (preserves your previous flow)
  chatContainer.style.display = 'none';
  if (inputContainer) inputContainer.style.display = 'none';

  // keep username in localStorage so refresh keeps it
  var username = localStorage.getItem('chat_username') || null;

  function showChatAfterUsername() {
    usernameContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    if (inputContainer) inputContainer.style.display = 'flex';
  }

  function setUsername() {
    var inputUsername = usernameInput ? usernameInput.value.trim() : "";
    if (inputUsername !== "") {
      username = inputUsername;
      localStorage.setItem('chat_username', username);
      showChatAfterUsername();
    }
  }

  // If username already present, show chat
  if (username) {
    if (usernameContainer) usernameContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    if (inputContainer) inputContainer.style.display = 'flex';
  } else {
    // show username container (if present)
    if (usernameContainer) usernameContainer.style.display = "flex";
  }

  if (usernameSubmit) usernameSubmit.addEventListener("click", setUsername);
  if (usernameInput) usernameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") setUsername();
  });

    // send button handler (keeps file upload behavior)
    sendButton.addEventListener("click", function () {
      var messageContent = messageInput ? messageInput.value.trim() : "";
      if (!username) {
        // guard: require username
        alert("Please enter a username first.");
        return;
      }

      // handle file upload path
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = firebase.storage().ref('uploads/' + Date.now() + "-" + file.name);
        const uploadTask = storageRef.put(file);
        uploadTask.on('state_changed', null, function (err) {
          console.error("Upload error:", err);
          alert("File upload failed.");
        }, function () {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            firebase.database().ref("messages").push().set({
              username: username,
              content: messageContent,
              fileUrl: downloadURL,
              fileType: file.type,
              timestamp: Date.now()
            });
            if (messageInput) messageInput.value = "";
            if (fileInput) fileInput.value = "";  // Reset file input
            sendAudio.play();
          });
        });
      } else if (messageContent !== "") {
        firebase.database().ref("messages").push().set({
          username: username,
          content: messageContent,
          timestamp: Date.now()
        });
        if (messageInput) messageInput.value = "";
        sendAudio.play();
      }
    });

    // Listen for new messages in the Realtime DB
    firebase.database().ref("messages").on("child_added", function (snapshot) {
      var message = snapshot.val();
      // build message node safely
      var messageElement = document.createElement("div");
      messageElement.classList.add("message");

      var usernameElement = document.createElement("span");
      usernameElement.classList.add("message-username");
      usernameElement.textContent = (message.username || "Unknown") + ": ";
      messageElement.appendChild(usernameElement);

      var contentWrapper = document.createElement("span");
      contentWrapper.classList.add("message-content");

      // Append safe content fragment
      const textFrag = renderMessageContentFragment(message.content || "");
      contentWrapper.appendChild(textFrag);

      // handle file attachments safely (images, pdfs, etc.)
      if (message.fileUrl) {
        if ((message.fileType || "").startsWith('image/')) {
          const imageElement = document.createElement('img');
          imageElement.src = message.fileUrl;
          imageElement.className = 'embedded-image';
          imageElement.style.maxWidth = "200px";
          imageElement.style.display = 'block';
          imageElement.style.marginTop = '6px';
          contentWrapper.appendChild(imageElement);
        } else if (message.fileType === 'application/pdf') {
          const fileLink = document.createElement('a');
          fileLink.href = message.fileUrl;
          fileLink.innerText = "View File (PDF)";
          fileLink.target = "_blank";
          fileLink.rel = "noopener noreferrer";
          fileLink.style.display = 'block';
          fileLink.style.marginTop = '6px';
          contentWrapper.appendChild(fileLink);
        } else {
          // generic link for other file types
          const fileLink = document.createElement('a');
          fileLink.href = message.fileUrl;
          fileLink.innerText = "Download file";
          fileLink.target = "_blank";
          fileLink.rel = "noopener noreferrer";
          fileLink.style.display = 'block';
          fileLink.style.marginTop = '6px';
          contentWrapper.appendChild(fileLink);
        }
      }

      messageElement.appendChild(contentWrapper);
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // play receive sound when message is not from current user
      if (message.username !== username) {
        try { receiveAudio.play(); } catch (e) { /* ignore autoplay errors */ }
      }
    });

}); // DOMContentLoaded end
