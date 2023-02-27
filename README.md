# Player for local videos
This a video player for local videos whose main features are:
* Light/dark theme (following system preferences)
* Restores video state[^note]
* [Keyboard shortcuts](#keyboard-shortcuts)
* Global Media Controls integration
* Works offline

Light mode | Dark mode
:---------:|:--------:
![Welcome screen (light mode)](./screenshots/welcome-light.png) | ![Welcome screen (dark mode)](./screenshots/welcome-dark.png)
![Player (light mode)](./screenshots/player-light.png) | ![Player (dark mode)](./screenshots/player-dark.png)

## Usage
To use the extension, click on its tooltip icon or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd>[^1].

To open a video, drag and drop it on the extension page or click on the button. If another video is opened, its state will be saved and the dragged video will be opened.

## Keyboard shortcuts
The following keyboard shortcuts are supported:
| Key | Action |
|:---:|---|
| <kbd>Space</kbd><br><kbd>K</kbd> | Toggle play/pause |
| <kbd>S</kbd> | Slow down by 0.1 |
| <kbd>D</kbd> | Speed up by 0.1 |
| <kbd>Z</kbd><br><kbd>&larr;</kbd><br><kbd>&darr;</kbd> | Rewind 10 seconds |
| <kbd>X</kbd><br><kbd>&rarr;</kbd><br><kbd>&uarr;</kbd> | Forward 10 seconds |
| <kbd>R</kbd> | Reset default speed |
| <kbd>T</kbd> | Toggle time/remaining |
| <kbd>A</kbd> | Set speed to 1.8 |
| <kbd>M</kbd> | Toggle mute |
| <kbd>C</kbd> | Toggle video zoom |
| <kbd>P</kbd> | Toggle PiP |
| <kbd>F</kbd><br><kbd>Enter</kbd> | Toggle fullscreen |

[![Available in the Chrome Web Store](https://user-images.githubusercontent.com/50383865/166124241-0a01a0b4-855a-44be-8f24-b823bb1ed7bd.png)](https://chrome.google.com/webstore/detail/player-for-local-videos/jobmoeleihhccoboiljgojnjkejppiih)

[^note]: The video state is saved in the browser's local storage. If you clear your browser's data, the state will be lost. Saved state will be deleted upon video completion or for videos last played more than 30 days ago.

[^1]: <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> on macOS. Customizable under `chrome://extensions/shortcuts`.
