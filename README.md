# How this got started
Interested in learning music composition, I picked up the book "Music Compositions from Dummies". In this book the scales and frequently used modes are defined and the playable ranges for the standard orchestra instruments are given. 
I ran into a Reddit post on subreddit Recorders by ekiim where he had put together something to help him learn the notes and figurings for the 4 basic recorders (SATB). 
This gave me an idea to put the two things together - a way to select scales and modes and view the playable notes for the instruments. I could just use the MCFD book and Wikipedia as references, but writing an app is much more fun. Beside, I can extend it to use as a composition tool as I get new idea.
# Basic use cases
User has control of the selection of instrument, key, pitch, scale, and mode. Basic display is all of the notes that can be played on the instrument. Minor scales with descending notes different cause the display to include the descending scale.
# UI layout
## Header
logo
application name version
message area
## Body
  * instrument selection (default first in list)

  * scale
    * diatonic
    * pentatonic
    * thirds
    * fourths
    * fifths
    * chromatic

  * key selection (default C)

  * mode selection (default ionian)
    * Ionian
    * Dorian
    * Phrygian
    * Lydian
    * Mixolydian
    * Aeolian (natural minor)
    * Locrian
  * Pitch
    * concert pitch
    * instrument pitch

  * Display options
    * Ascending
    * descending
    * ascending and descending

  * Note display
    * shows notes selected
    * multiple notes can be selected and played (in sequence or as a chord)
## Footer
displays current scale, mode, instrument, pitch, and display option selected
# Implementation
Implemented in Vite/React TrueScript with the [VexFlow](https://www.vexflow.com/) addon. 
This is my first TrueScript project. There is not much use for a server for this application unless some user data retention is needed in the future.
