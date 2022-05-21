<p align="center"> <img src="https://github.com/olesgeras/AutoFish/blob/a915e2f84d36f3aeaa61e8594332a14b2e6bedb9/app/img/main-logo.png"> </p>

## Fishing bot

A fishing bot for World of Warcraft, wrapped in [Electron](https://github.com/electron/electron) it uses [keysender](https://github.com/Krombik/keysender) library to analyze the screen and automate a fishing process in a human-like manner in **one** or **multiple** windows of the game at the same time.

The bot was tested on Retail, Classic and Classic TBC, also on old patches: Vanilla, The Burning Crusade, Wrath of Lich King, Cataclysm, Mists of Pandaria on unofficial servers.

For more detailed review you can watch [first video](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) and [second video](https://youtu.be/o1i_cgZzuHc).

## Guide

1. Launch the game (not as administrator).
2. Switch to the lowest **DirectX** mode if available (there's no such option in the old patches so you don't need it).
3. Turn off **Vertical Sync**.
4. Switch to **Windowed(fullscreen)** mode (or **Fullscreen(windowed)** on Retail/Classic)
5. Equip your favorite fishpole.
6. Assign your 'fishing' skill to the **'2' key**.
7. Find a good place to fish (watch the video).
   - All sides of the "Fishing zone" should be in the water (check the horizon).
   - Avoid any red and yellow colors in the "Fishing zone".
   - At first the bot will make 3 attempts to find the bobber, if it fails it will stop the app. It means that your fishing place isn't good enough, try to look for another one. 
8. Don't use your keyboard and mouse while the bot is working.
9. You can press **'space'** to stop the bot.
10. Launch AutoFish (by using AutoFish.exe or from CLI).
11. Press "Start".

## UI
<p align="center"><img src="https://github.com/olesgeras/AutoFish/blob/725b384653e880cdaa556261fed5fd521976c813/app/img/uiexpl.jpg"></p>

## Download

AutoFish Setup: [Download](https://drive.google.com/file/d/1k5lLZJSA3KyTRO8YVVjnKyYsIPbjpzbo/view?usp=sharing)

It's a [squirrel](https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig#authors) type of installation, it will create a shortcut with a random name on your destkop. You can rename it as you wish. Random name is for hiding the process from potential scanning of your processes by Battle.net launcher. 

## Installation

If you want to tweak the app and make some changes you need to:

Install dependencies:

```
npm install
```

To distribute by electron-forge:

```
npm make
```

To start the app from the CLI:

```
npm run
```

## Tests

```
npm test
```
