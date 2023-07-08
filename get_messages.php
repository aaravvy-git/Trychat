<?php
  $messages = file("messages.txt", FILE_IGNORE_NEW_LINES);
  echo json_encode($messages);
?>
