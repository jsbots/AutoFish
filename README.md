<p align="center"> <img src="https://github.com/olesgeras/AutoFish/blob/008c1ca000ba17729aa0b5dae2453a4fbf737f22/app/img/main-logo.png"> </p>
<div align="center">

 <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/olesgeras/autofish"> [![GitHub license](https://img.shields.io/github/license/olesgeras/AutoFish)](https://github.com/olesgeras/AutoFish/blob/4c5f0fdb5af0f1378f3318d563c5738fa7580e2f/LICENSE)
<a href="https://youtu.be/e0D5dBptQUg"><img alt="" src="https://img.shields.io/youtube/views/o1i_cgZzuHc?style=social"></a>

</div>

## Table of Contents :page_with_curl:

- [Fishing bot](#fishing-bot-fish)
- [Servers tests](#servers-tests-video_game)
- [Warninig](#warning-warning)
- [Will I be banned for using this?](#will-i-be-banned-for-using-this-interrobang)
- [Guide](#guide-blue_book)
- [Fishing zone](#fishing-zone-dart)
- [Download](#download-open_file_folder)
- [Installation](#installation-hammer)
- [Task list](#task-list-checkered_flag)


## Fishing bot :fish:

A fishing bot for World of Warcraft, wrapped in [Electron](https://github.com/electron/electron) it uses [keysender](https://github.com/Krombik/keysender) library to analyze the screen and automate a fishing process in a human-like manner. The bot can work with one or multiple windows of the game at the same time. The bot also uses [tesseract.js](https://github.com/naptha/tesseract.js) for analyzing loot.

**Features:**
- Multiple windows support.
- Optional loot support.
- Fishing lures support.
- Custom window suppport.
- Convoluted automation (random sleep, random reaction, random sleep after catching, random mouse speed/curvature, random click on the bobber, random bobber highlighting)

For more detailed review you can watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.0](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) and <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20">  [AutoFish 1.1](https://youtu.be/o1i_cgZzuHc).

This is so called "pixel bot", it doesn't change anything in the processes memory nor use any vision libraries like OpenCV, it uses a simpler solution: it analyzes the window of the game for condensed red colors and then sticks to them checking the area for changes. It moves with the bobber while the bobber slowly wobbles, but when the bobber is jerked, it clicks on it and catches the fish.

The bot doesn't work in the background and requires the window of the game to be opened all the time, to get around this you can use a **virtual machine** (like [VirtualBox](https://www.virtualbox.org/)) with installed World of Warcraft and launch AutoFish there. *(tested)*

## Servers tests :video_game:

The bot was tested on official servers:
- <img src="guide_img/icons/good.png" width="15" height="15">  **Retail**
- <img src="guide_img/icons/good.png" width="15" height="15">  **Classic**
- <img src="guide_img/icons/good.png" width="15" height="15"> **Classic TBC**

Also on unofficial servers:
- <img src="guide_img/icons/good.png" width="15" height="15"> **MoP**: stormforge.gg
- <img src="guide_img/icons/good.png" width="15" height="15">  **Cataclysm**: apollo-wow.com
- <img src="guide_img/icons/good.png" width="15" height="15">  **WoTLK**: warmane.com
- <img src="guide_img/icons/good.png" width="15" height="15">  **TBC**: atlantiss.org
- <img src="guide_img/icons/good.png" width="15" height="15">  **Vanilla**: kronos-wow.com

On custom servers:
- <img src="guide_img/icons/good.png" width="15" height="15">  **Turtle WoW**: turtle-wow.org works, but the efficiency is usually around 80% (for some reason the bobber doesn't dive into the water completely on Turtle-wow sometimes and the bot misses the fish).
- <img src="guide_img/icons/bad.png" width="15" height="15">  **Ascension**: ascension.gg - doesn't work!

## Warning :warning:

Using bots in most of the games is prohibited, by doing so you should understand all the risks such an act entails: being banned, losing account, losing real money etc.

The bot is written in JavaScript, when writing the bot I didn't have acess to low-level operations like utilizing mouse, keyboard and screen. It's done by [keysender](https://github.com/Krombik/keysender), so I can't guarantee anything that comes from this particular low-level domain.

To prevent detection all the delay values were randomized: delays between clicks/pressing, sleep time (optional), reaction time (optional), after hook time (optional), the curvature and the speed of the mouse (optional), random click on the bobber, random highlighting of the bobber, the names of the processes, the names of the folder where the bot is installed are generated per install, the names of the title of the bot window are generated per launch.

## Will I be banned for using this? :interrobang:

Using common sense while using the bot will help to reduce risks of being banned:
- Don't leave the bot alone for a long time.
- Don't fish in one place all the time.
- Try to combine gameplay between fishing: run some dungeons, chat with somebody etc.

Anyone who can see you for more than 15m on one spot might suspect something and report you, or might not.  It all depends on many external factors: who, where and why. In my opinion, the biggest problem with people being banned is because they don't know how to cheat, not because of the software. So again, if you decided to step on this path: think and use common sense, no software will do this for you.

After reading all this you are eager to ask the most important *existential* question of the topic:
> **"Am I going to be banned for using this?"**

If we consider **only the software itself**, the very simplified answer you seek depends on where you use the bot:
- on **official servers**:
> **"Probably"**.

- on **unofficial servers**:
> **"Unlikely"**.

## Guide :blue_book:

The bot was tested only with default UI and with default UI scale, without any addons whatsoever. **So turn off all the addons and set UI scale to default before using the bot.**

1. Launch the game *(not as administrator)*.
2. Switch to the **DirectX 11** on retail *(skip for unofficial servers)*.
4. Switch to **Window(maximized)** mode *(skip for Retail/Classic)*.
5. Are you using whitelist?
   - Yes: Turn off **Auto Loot**, set **UI scale** to default, turn on **Open loot window at mouse**.
   - No: Turn on **Auto Loot**
7. Assign your 'fishing' and 'lures' keys in the game and write them in the respective sections in the UI of the bot.
8. Equip a fishpole.
9. Find a good place to fish (check [Fishing zone](#fishing-zone-dart) section).
   - Avoid any red colors in the "Fishing zone" except the red feather of the bobber.
   - Initially the bot will make a preliminary check for red colors before casting, if it finds any, it will stop working: increase Threshold or change the place.
   - The bot will make 3 attempts to cast and find the bobber (you can change this number in the "Advanced Settings"), if it fails it will stop the application.
10. Don't use your keyboard and mouse while the bot is working.
11. You can press **'space'** to **stop the bot**.

**Additional:**

- If the bot can't find a bobber, decrease "Threshold" value. (e.g. 60 -> 40)
- If the bot can't pass the preliminary checks for red colors, increase "Threshold" value (e.g. 60 -> 80)
- If you play on Classic/Vanilla/TBC and want to use lures:
  - Your character window should be assigned to default 'c' key, bot opens it and applies lures to your fishing pole.
  - Your UI scale should be set to default.
- Don't use **Like a human** option if you use more than one window: because of the slow mouse movement some of the bots might not catch up.  
- Don't fish near other players, the bot might confuse their bobber for yours.
- You can turn off all the "sleeping" and random values to make the bot work 2-3 times faster.

## Fishing Zone :dart:

Fishing zone is a an area in the water where your bobber might land. The bot looks for the bobber only in this area.

<img src="https://github.com/olesgeras/AutoFish/blob/main/guide_img/fishing-zone.jpg">

The size of fishing zone is relative to the size of the window. You can change the relative points in the "Advanced settings".

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.0](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) for video explanation.

The rule of thumb here is **the better you can see the red feather the better the bot will see it too**:
- If you can, make your video settings as best as possible, except the weather effects...
- Turn off all the weather effects so that the bot won't confuse rain/fog for jerking of the bobber. But if the weather is *really* bad (like a blizzard), it might drastically reduce the efficiency of the bot *(working on make it better)*. Solution: find another place or wait for the better weather.
- Different direction might make the red feather of the bobber either brighter or darker, bigger or smaller, this all will impact the efficiency of the bot. In most cases the place doesn't matter **it's all about direction and position**.
- Camera position isn't so important, but sometimes, if the place is dark/snowy, closer view to the bobber might help. The best position is just a normal 3rd person view.

Here are quick self-explanatory "good-bad" screenshots of the bobber:

<img src="https://github.com/olesgeras/AutoFish/blob/main/guide_img/good-bad-test1.jpg" width="960">
<img src="https://github.com/olesgeras/AutoFish/blob/main/guide_img/good-bad-test2.jpg" width="960">
<img src="https://github.com/olesgeras/AutoFish/blob/main/guide_img/good-bad-test3.jpg" width="960">

## Download :open_file_folder:

AutoFish 1.8.0 Setup: [Download](https://github.com/olesgeras/AutoFish/releases/download/v1.8.0/AutoFish.1.8.0.Setup.exe)

It's open-source software, so if you are afraid of downloading the executable file,  you can clone the repository, check the code and lanch it from the CLI.

The executable file is a [squirrel](https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig#authors) setup, it will install the bot into a folder under a random name and create a shortcut with a random name on your desktop.

You can uninstall it in the Windows Settings, the name of the uninstall will be the same name as the name of the shortcut.

If you downloaded a new setup, you need to uninstall the previous AutoFish first, because the random names of the application and the folder are generated per install, so it won't automatically re-install a new application in the folder of the previous.

<div align="center">

<a href='https://ko-fi.com/I2I7D2VJ4' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi5.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

 </div>

## Installation :hammer:

If you want to tweak the app and make some changes you need to:

Install [npm](https://docs.npmjs.com/about-npm) and dependencies:

```
install npm
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

## Task list :checkered_flag:

- [x] Autofish 1.0.0
- [x] Multiple windows support
- [x] Fishing lures support
- [x] Advanced settings option
- [x] Fast fishing without waiting for the bobber to disappear (memory of the previous bobber position)
- [x] More convoluted automation (random sleep, random reaction, random sleep after catching, random mouse speed/curvature)
- [x] Custom window suppport.
- [x] Red threshold support.
- [x] Random click on the bobber area.
- [x] Optional loot
- [x] Better Threshold option
