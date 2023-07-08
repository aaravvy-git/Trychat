<?php
  $username = $_POST['username'];
  $message = $_POST['message'];

  // Append the username and message to the text file
  $file = fopen("messages.txt", "a");
  fwrite($file, $username . ": " . $message . PHP_EOL);
  fclose($file);
?>
