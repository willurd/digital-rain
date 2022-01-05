# Design

## Examples

- https://upload.wikimedia.org/wikipedia/commons/c/cc/Digital_rain_animation_medium_letters_shine.gif
- https://www.schemecolor.com/matrix-code-green.php
- https://www.dafont.com/matrix-code-nfi.font

## Concepts

- Screen: The environment that contains the digital rain.
- Digital Rain: The collection of streaks.
- Streak: A single vertical line of kinetic typography (animated text), representing a digital rain drop.

## Notes

- Text characters will be called "glyphs".
- Glyphs _do not_ move down the screen. Instead they are revealed, stay in place, and over time become dimmer until they disappear.
- Some number of glyphs will swap to a different glyph (maybe around 20-30%?). This can happen to multiple glyphs in a streak, and multiple times to a single glyph. The time between glyph swaps is random.
- The glyph pool appears to be forward and reversed versions of uppercase roman letters, half-width Japanese hiragana and katakana, reversed half-width Japanese hiragana and katakana, some special characters (such as asterisks), cyrillic characters, and roman numbers.
- When glyphs are revealed, they may be a different color for a short period of time, creating a "rain drop" kind of effect.
