Drop your real app screenshots here.

Expected files (PNG or JPG, portrait orientation ~9:19):
  - screen-home.png      → Home / daily verse screen
  - screen-journal.png   → Journal / notes screen
  - screen-reader.png    → Bible reader screen
  - screen-profile.png   → Profile / progress screen

Then in index.php, replace each <div class="screen-*">…</div> block
with:  <img src="images/screen-home.png" style="width:100%;height:100%;object-fit:cover;object-position:top" alt="…">
