# Word Games — AnRat desktop theme

This package contains the updated game pages, the games directory, and the shared `game-theme.css` stylesheet.

## Install

1. Put the contents of this folder in your existing `FileExplorer/Misc/Games/Word-Games/` directory.
2. Keep `game-theme.css` **next to** the game HTML files. Each page links to `./game-theme.css`.
3. Keep `game-stats.js`, `layers.css`, and `layers.js` alongside the pages; their current functionality is unchanged.
4. You can keep your existing favicon assets and API setup. These pages still use `api.anrat.link` where configured.

## Layout

- Charcoal window panels, slate title bars, monospaced typography, squared borders, purple accents, and a subtle desktop grid — based on anrat.link.
- Mobile play areas prioritize the board, in-game buttons, and touch keyboard or letter wheel. Word Search uses a horizontal word-bank scroller for longer lists.
- Saved lifetime stats remain on the directory and on desktop game pages, while mobile game pages hide the extra history strip to preserve board space.
- No Mizuki graphic, character image, or animation is included.

Small mobile browser viewports can still require scrolling for *secondary* content, such as instructions and the full crossword clue list. The selected clue and touch keyboard stay beside the playable crossword in the primary view.
