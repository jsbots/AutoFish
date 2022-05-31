<p align="center"> <img src="https://github.com/olesgeras/AutoFish/blob/008c1ca000ba17729aa0b5dae2453a4fbf737f22/app/img/main-logo.png"> </p>
<div align="center">
 
 <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/olesgeras/autofish"> [![GitHub license](https://img.shields.io/github/license/olesgeras/AutoFish)](https://github.com/olesgeras/AutoFish/blob/4c5f0fdb5af0f1378f3318d563c5738fa7580e2f/LICENSE)
<a href="https://youtu.be/e0D5dBptQUg"><img alt="" src="https://img.shields.io/youtube/views/e0D5dBptQUg?style=social"></a>
 
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
- [Tests](#tests-straight_ruler)
- [Task list](#task-list-checkered_flag)


## Fishing bot :fish:

A fishing bot for World of Warcraft, wrapped in [Electron](https://github.com/electron/electron) it uses [keysender](https://github.com/Krombik/keysender) library to analyze the screen and automate a fishing process in a human-like manner in **one** or **multiple** windows of the game at the same time.

For more detailed review you can watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.0](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) and <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20">  [AutoFish 1.1](https://youtu.be/o1i_cgZzuHc).

This is so called "pixel bot", it doesn't change anything in the processes memory nor use any vision libraries like OpenCV, it uses a more simple solution (and much faster): it analyzes the window of the game for condensed red colors and then sticks to them checking their position for changes. It moves with the bober while the bober slowly wobbles, but when the bobber is jerked, the bot sees this as a change of the color and understands it as time to hook.

The bot doesn't work in the background and requires the window of the game to be opened all the time, to get around this you can use a **virtual machine** (like [VirtualBox](https://www.virtualbox.org/)) with installed World of Warcraft and launch AutoFish there. *(tested)*


## Servers tests :video_game:

The bot was tested on official servers: **Retail, Classic and Classic TBC**.

Also on unofficial servers:
- [x] **MoP**: stormforge.gg
- [x] **Cataclysm**: apollo-wow.com
- [x] **WoTLK**: warmane.com 
- [x] **TBC**: atlantiss.org
- [x] **Vanilla**: kronos-wow.com

On custom servers:
- [x] ~~**Ascension**: ascension.gg~~ - doesn't work!

## Warning :warning: 

Using bots in most of the games is prohibited, by doing so you should understand all the risks such an act entails: being banned, losing account, losing real money etc. 

The bot is written in JavaScript, when writting the bot I didn't have acess to low-level operations like utilizing mouse, keyboard and screen. It's done by [keysender](https://github.com/Krombik/keysender), so I can't guarantee anything that comes from this particular low-level domain.

To prevent detection all the delay values were randomised: mouse clicks, key pressing, delays of casting and hooking, the curvature and the speed of the mouse (optional), the names of the processes, the names of the folder where the bot is installed are generated per install, the names of the title of the bot window are generated per launch.

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
> **"Unlikely"**. *(forgot to turn off the bot on Warmane once, it worked for 6 hours straight)*



## Guide :blue_book:

**Following the guide step by step will drastically reduce the number of problems you might run into by using this software.** 

1. Launch the game *(not as administrator, keysender won't be able to get colors from it)*.
2. Switch to the **DirectX 11** on retail *(skip if you use the bot on unofficial servers)*.
4. Switch to **Windowed or Window(maximized)** mode *(skip if you use the bot on Retail/Classic)*.
5. Turn on **Auto Loot** option or check **Shift+click** option in the UI of the bot if you don't have **Auto Loot** option in the game *(Vanilla)*. 
6. Assign your 'fishing' and 'lures' keys in the game and write them in the respective sections in the UI of the bot.
7. Equip a fishpole.
8. Find a good place to fish (check [Fishing zone](#fishing-zone-dart) section).
   - All sides of the "Fishing zone" should be in the water.
   - Avoid any red and yellow colors in the "Fishing zone" except the bobber itself.
     - Initially the bot will make a preliminary check for red colors before casting.
     - Yellow colors in the fishing zone won't break anything except that every fish you caught will count as missed.  
   - After casting the bot will make 3 attempts to find the bobber, if it fails it will stop the application. It mostly means that the fishing zone isn't good enough. 
9. Don't use your keyboard and mouse while the bot is working *(the bot directly utilizes drivers of your mouse and keyboard)*.
10. You can press **'space'** to **stop the bot**.

## Fishing Zone :dart:

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.0](https://www.youtube.com/watch?v=e0D5dBptQUg&ab_channel=olesgeras) for video explanation. 

The rule of thumb here is **the better you can see the red feather the better the bot will see it too**: 
- The better your video settings the better it's for the bot too. 
- Turn off all the weather effects so that the bot won't confuse rain/fog for jerking of the bobber.
- Different direction might make the bobber either brighter or darker, bigger or smaller (feathers), this all will impact the bot too. In most cases the place doesn't matter **it's all about direction and position**. 
- Camera position is important too, the closer you see the bobber the better. So make it from the first person if possible (especially if the place is dark/snowy).

I know, that's a lot of conditions to make the bot work properly, but it's a **pixel** bot after all.

<img src="https://github.com/olesgeras/AutoFish/blob/bcb00d84fb04a3968950ee1dc6e119bcf1b4a555/app/img/fishing-zone-example.jpg" width="1000">

## Download :open_file_folder:

AutoFish Setup: [Download](https://drive.google.com/file/d/1k5lLZJSA3KyTRO8YVVjnKyYsIPbjpzbo/view?usp=sharing)

It's a [squirrel](https://js.electronforge.io/maker/squirrel/interfaces/makersquirrelconfig#authors) type of installation, it will install the bot into a folder under a random name and create a shortcut with a random name on your destkop. You can uninstall it in the Windows Settings the name of the uninstall will be the same name as the name of the shortcut.

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


## Tests :straight_ruler:

```
npm test
```

## Task list :checkered_flag:

- [x] Autofish 1.0.0
- [x] Multiple windows support
- [x] Fishing lures support
- [x] Advanced settings option
- [x] More convoluted automation
