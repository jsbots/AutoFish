<p align="center"> <img src="https://github.com/olesgeras/AutoFish/blob/a915e2f84d36f3aeaa61e8594332a14b2e6bedb9/app/img/main-logo.png"> </p>

## Table of Contents :page_with_curl:	

- [Fishing bot](#fishing-bot-fish) 
- [Warninig](#warning-warning)
- [Will I be banned for this?](#will-i-be-banned-for-this-interrobang)
- [Guide](#guide-blue_book)
- [UI](#ui-orange_book)
- [Download](#download-open_file_folder)
- [Installation](#installation-hammer)
- [Tests](#tests-straight_ruler)


## Fishing bot :fish:

A fishing bot for World of Warcraft, wrapped in [Electron](https://github.com/electron/electron) it uses [keysender](https://github.com/Krombik/keysender) library to analyze the screen and automate a fishing process in a human-like manner in **one** or **multiple** windows of the game at the same time.

The bot was tested on Retail, Classic and Classic TBC, also on old patches: Vanilla, The Burning Crusade, Wrath of Lich King, Cataclysm, Mists of Pandaria on unofficial servers.

For more detailed review you can watch [first video](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) and [second video](https://youtu.be/o1i_cgZzuHc).

This is so called "pixel bot", it doesn't change anything in the processes memory nor use any vision libraries like OpenCV, it uses a more simple solution (and much faster): it analyzes the screen for condensed red colors and then sticks to them checking their position for changes. It moves with the bober while the bober slowly wobbles, but when the bobber is jerked, the bot sees this as a change of the color and understands it as time to hook.


## Warning :warning: 

Using bots in most of the games is prohibited, by doing so you should understand all the risk that such an act entails: banning, losing account, losing real money etc. 

The bot is written in JavaScript, while writting the bot I didn't have acess to low-level operations like utilizing mouse, keyboard and screen. It's done by [keysender](https://github.com/Krombik/keysender), so I can't guarantee anything that comes from this particular low-level domain.

To prevent detection all the delay values were randomised: mouse clicks, key pressing, delays of casting and hooking, the curvature and the speed of the mouse (optional), the names of the processes, the names of the folder where the bot is installed are generated per install, the names of the title of the bot window are generated per launch.

## Will I be banned for this? :interrobang:

Using common sense while using the bot will help to reduce risks of being banned:
- Don't leave the bot alone for a long time.
- Don't fish in one place all the time.
- Try to combine gameplay between fishing: run some dungeons, chat with somebody etc.

Anyone who can see you for more than 15m on one spot might suspect something and report you, or might not.  It all depends on many external factors: who, where and why. In my opinion, the biggest problem with people being banned is because they don't know how to cheat, not because of the software. So again, if you decided to step on this path: think and use common sense, no software will do this for you. 

After reading all this you are eager to ask the most important *existential* question of the topic:
> **"Am I going to be banned?"**

If we consider only the software itself, the very simplified answer you seek depends on where you use the bot:
- on **official servers**:
> **"Probably"**. 

- on **unofficial servers**: 
> **"Unlikely"**.




## Guide :blue_book:

1. Launch the game (not as administrator).
2. Switch to the lowest **DirectX** mode if available (there's no such option in the old patches so you don't need it).
3. Turn off **Vertical Sync**.
4. Switch to **Windowed(fullscreen)** mode (or **Fullscreen(windowed)** on Retail/Classic)
5. Equip your favorite fishpole.
6. Assign your 'fishing' skill to the **'2' key**.
7. Find a good place to fish (watch the video).
   - All sides of the "Fishing zone" should be in the water (check the horizon).
   - Avoid any red and yellow colors in the "Fishing zone".
   - At first the bot will make 3 attempts to find the bobber, if it fails it will stop the app. It can mean that either you don't set video settings right or that your fishing place isn't good enough. Check the settings and try to look for another place.  
8. Don't use your keyboard and mouse while the bot is working.
9. You can press **'space'** to stop the bot.
10. Launch AutoFish (by using the shortcut or from CLI).
11. Press "Start".


## UI :orange_book:
<p align="center"><img src="https://github.com/olesgeras/AutoFish/blob/725b384653e880cdaa556261fed5fd521976c813/app/img/uiexpl.jpg"></p>


## Download :open_file_folder:

AutoFish Setup: [Download](https://drive.google.com/file/d/1k5lLZJSA3KyTRO8YVVjnKyYsIPbjpzbo/view?usp=sharing)

It's a [squirrel](https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig#authors) type of installation, it will install the bot into folder under random name and create a shortcut with a random name on your destkop. You can rename it as you wish. 

## Installation :hammer:

If you want to tweak the app and make some changes you need to:

Install dependencies:

```
npm install
```

To distribute by electron-forge:

```
npm run make
```

To start the app from the CLI:

```
npm start
```


## Tests :straight_ruler:

```
npm test
```
