This code runs a music history practice test for the listening portion of Dr. Roger McVey's Music History I and II course and the University of Wisconsin, River Falls.

I haven't been at UWRF for a while now, but this is still being used. I'm sticking this code online in case someone is interested in updating it.

The code is an early example of my javascript, so there are much better ways of doing some of this.

Possible improvements:
----------------------

* Use SoundManager2 - It would be a cleaner system if we used SM2. This way it could also avoid needing Ogg Vorbis files, since browsers such as Firefox or IE which either don't support MP3 or don't support HTML5 audio could still work.
* Make this work on mobile - It might be difficult as the limitations on firing play events on mobile make it nearly impossible. The entire app would need to be re-architected with the event chain in mind. Audio could only play on a click event. Possible, but difficult. Also, playing from the middle of a file is odd on mobile.