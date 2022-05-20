# AutoFish

![assets/images/main-logo.jpg](AutoFish)

A fishing bot for World of Warcraft, wrapped in [Electron](https://github.com/electron/electron) it uses [keysender](https://github.com/Krombik/keysender) library to analyze the screen and automate a fishing process in a human-like manner in **one** or **multiple** windows of the game at the same time.

The bot was tested on Retail, Classic and Classic TBC, also on old patches: Vanilla, The Burning Crusade, Wrath of Lich King, Cataclysm, Mists of Pandaria on unofficial servers.

For more detailed review you can watch this [video](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) and this [video](https://www.youtube.com/olesgeras).

## Guide

###Old patches:

1. Launch the game.
2. Switch to the lowest **DirectX** mode if available.
3. Turn off **Vertical Sync**.
4. Switch to **Windowed(fullscreen)** mode
5. Equip your favorite fishpole.
6. Assign your 'fishing' skill to the **'2' key**.
7. Find a good place to fish (watch the video).

- All sides of the "Fishing zone" should be in the water (check the horizon).
- Avoid any red and yellow colors in the "Fishing zone".
- At first the bot will make 3 attempts to find the bobber, if it fails it will stop the app.

8. Don't use your keyboard and mouse while the bot is working.
9. You can press **'space'** to stop the bot.
10. Launch AutoFish (by using AutoFish.exe or from CLI).
11. Press "Start".

###Retail&classic:

1. Launch the game.
2. Switch to **DirectX 11** mode.
3. Turn off **Vertical Sync**.
4. Switch to **Windowed(fullscreen)** mode
5. Equip your favorite fishpole.
6. Assign your 'fishing' skill to the **'2' key**.
7. Find a good place to fish (watch the video)

- All sides of the "Fishing zone" should be in the water (check the horizon).
- Avoid any red and yellow colors in the "Fishing zone".
- At first the bot will make 3 attempts to find the bobber, if it fails it will stop the app.

8. You can use either **Hardware** (with opened window) or **Virtual** (in the background) mode.
9. You can press **'space'** to stop the bot.
10. Find a good place to fish (watch the video).
11. Launch AutoFish (by using AutoFish.exe or from CLI).
12. Press "Start".

## Installation

If you want to tweak the app and make some changes you need to:

Install dependencies

```
npm install
```

To distribute by electron-forge

```
npm make
```

To start the app from the CLI

```
npm run
```

## Tests

```
npm test
```
