<p align="center"> <img src="app/img/logo.png" width="400px"> </p>
<div align="center">

 <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/olesgeras/autofish"> [![GitHub license](https://img.shields.io/github/license/olesgeras/AutoFish)](https://github.com/olesgeras/AutoFish/blob/4c5f0fdb5af0f1378f3318d563c5738fa7580e2f/LICENSE)
<a href="https://youtu.be/A3W8UuVIZTo"><img alt="" src="https://img.shields.io/youtube/views/A3W8UuVIZTo?style=social"></a>

</div>

## Table of Contents :page_with_curl:

- [Fishing bot](#fishing-bot-fish)
- [Disclaimer](#disclaimer-warning)
- [Guide](#guide-blue_book)
  - [Hints and Issues](#hints-and-issues)
  - [Intensity](#intensity)
  - [Sensitivity](#sensitivity)
  - [Interactive Key](#interactive-key)
- [Applying Lures](#applying-lures-pushpin)
- [Interactive key](#interactive-key)
- [Download](#download-open_file_folder)
- [AutoFish Premium](#autofish-premiumcrown)

## Fishing bot :fish:

This is a fishing bot for wow-like fishing logic (when a model of a bobber has red/blue feather and plunging animation, for example with some tweaks in the code it can work even with Minecraft). It is built using the [Electron](https://github.com/electron/electron), [keysender](https://github.com/Krombik/keysender) and [nut.js](https://github.com/nut-tree/nut.js) libraries to analyze the screen and automate the fishing process in a manner that mimics human behavior, and also [tesseract.js](https://github.com/naptha/tesseract.js) for loot filtering.

This is a so-called "pixel bot": it works with pixels only, without modifying the game's memory, addons or additional programs.

<p align="center">
<img src="guide_img/UI.jpg" width="640">
</p>

For video review you can watch this (pretty old) <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.12](https://youtu.be/A3W8UuVIZTo)

## Disclaimer :warning:

**This small project was developed for educational purposes ONLY, aiming to explore the feasibility of creating a functional gaming bot using web-development technologies.**

**The software provided should NEVER be used with real-life applications, games, servers etc.**

**This software is not designed to be "undetectable" in any way, nor was it ever intended for such purposes. All randomness functionality is added for educational purposes only.**

**No guarantees or assurances can be made regarding the functionality or outcomes of the bot, you assume full responsibility for any outcomes that may arise from using this software.**.

## Guide :blue_book:

1. Launch the game and the bot.
2. Choose the game you want the bot to work with.

<p align="center">
<img src="guide_img/chooseGame.jpg">
</p>

3. Set up your **Fishing Zone** by clicking the **Set Fishing Zone** button. Adjust the size and position of the **Fishing Zone** window to exclude any reddish or bluish elements (depending on the color you selected). Keep in mind that **Fishing Zone** is an overlay window, so it will also recognize colors from your character and the game's user interface, including texts and health bars.

<p align="center">
<img src="guide_img/chooseFishZone.jpg">
</p>

4. Set up your **Fishing Key** by clicking on Fishing Key section and then pressing the key you want to bind. Your Fishing Key is the same key you bind your fishing skill to in the game.

<p align="center">
<img src="guide_img/chooseFishKey.jpg">
</p>

5. You can press **Advanced Settings** and find there a lot of useful features and options.

<p align="center">
<img src="guide_img/advancedSettings.jpg">
</p>

6. Press the Start button and don't use your mouse and keyboard.
7. To stop the bot, press your designated stop key (default: delete).

### Hints and Issues

- Avoid aggro mobs (with red names) in the Fishing Zone, if you use red color. Or turn them off in the settings (Interface -> Names -> NPC Names -> None)
- If the bot can't find the bobber, try from the 1st person view.
- If the bot doesn't react to animation, try from the 3rd person view.
- The bot works only with default UI: no UI scaling, no UI addons and so on. (Especially ElvUI)
- If the bot doesn't cast, though key is correct, launch it as admin.
- The bot works only on a primary monitor.
- Different camera directions can affect the brightness, size, and visibility of the bobber.
- You can Adjust gamma, brightness, and contrast settings to enhance the brightness of the bobber.
- The bot will auto-confirm lures application if such confirmation is needed.  
- The bot can auto-confirm *Soulbound* items. For that go to Advanced Settings and turn this option on.
- If you use an addon that removes loot window (like Fishing Buddy), you can set *Loot Window Closing Delay* value to 0 to make it work faster.
- The bot works at 50% efficiency on Turtle WoW and won't work better unless you use sound detection available in Premium.

### Intensity

*If in manual mode*

Intensity value serves as a color threshold below which the bot will ignore all the corresponding colors.

Increasing the intensity value will make the bot recognize fewer red colors, while decreasing this value will cause the bot to recognize more red colors on the screen.

Simply put: decrease this value, if the bot can't find the bobber (e.g. at night, bad weather). Increase this value if you want the bot to ignore some reddish/bluish elements in the Fishing Zone and recognize only the bobber.`

### Sensitivity

*If in manual mode*

If the bot clicks too early, decrease this value. If the bot clicks too late or doesn't click at all, increase this value.

### Interactive key

You can fish with interactive key in the game. If you want the bot to use it instead of mouse movement, turn on Int. Key option and assign the same key you use for interactive key in the game.

<p align="center">
<img src="guide_img/intkey.jpg" align="center">
</p>

To make the interactive key work, you should use this commands (write them in the chat and press enter, one by one):
```
/console SoftTargetInteractArc 2  - This will allow you to interact with the bobber no matter which way you are facing.
/console SoftTargetInteractRange 30  - This increases the interaction range to 30 yards. Adjust to your needs
```

## Applying Lures :pushpin:

Go to **Advanced Settings** and check **Use Lures**. Bind your key to the same key you bind your lures or **macro**.

<p align="center">
<img src="guide_img/lures.jpg" align="center">
</p>

For **Retail** and **Classic/Vanilla** you need to use a special macro that will apply the lures onto your fishing pole. The names of the lures and fishing pole here only an example, you need to substitute them for your names:

**Retail**:

```
/use Aquadynamic Fish Attractor
/use Big Iron Fishing Pole
```

**Classic**:

```
/equip Big Iron Fishing Pole
/use Aquadynamic Fish Attractor
/use 16
/click StaticPopup1Button1
```

**Vanilla**:

```
/script UseAction(your lures key);
/script PickupInventoryItem(16);
/script ReplaceEnchant();
```
Or
```
/script UseContainerItem(0,2); PickupInventoryItem(16);
```

## AutoFish Premium	:crown:

AutoFish Premium is just my token of gratitude to you for your support.

<p align="center">
<img src="guide_img/Premium_UI.jpg" width="640">
</p>

**Premium Features/Content:**
- [Remote Control](#remote-control-iphone)
- [Multiple Fishing Mode](#multiple-fishing-mode-rocket)
- [Alt-Tab Fishing Mode](#alt-tab-fishing-mode-sleeping)
- [Sound Detection](#sound-detection-loud_sound)
- [Additional Actions](#additional-actions-mage)
- [Check For Players Around](#check-for-players-around-telescope)
- [Attacking / Running away](#attackingrunning-away-crossed_swords)
- [Random camera/character movements](#random-cameracharacter-movements-robot)
- [Arduino Control](#arduino-control-joystick)
- [Mount Selling](#mount-selling-elephant)
- [Motion Detection](#motion-detection-runner)
- Profiles

## Remote Control :iphone:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

1. Get the token from [BotFather](https://t.me/BotFather) by using /newbot command and following the instruction. Imagine some long and random name for the bot so that someone won't accidentally join your bot and gain control over your fishing process.
2. Paste the token to **Telegram token** input field in **Remote Control** section in the **Advanced Settings** and press enter.

<p align="center">
<img src="guide_img/tmtoken.jpg" align="center">
</p>

3. Press **Connect** button and wait until the name of the button changes to either **done** or **error* (*might take awhile*).
4. Open the bot in your Telegram and either press /start or write /start command.
5. If evertyhing is OK, the bot will reply with:

<p align="center">
<img src="guide_img/tmmenu.jpg" width="416px" align="center">
</p>

6. Now set your **Chat Zone** as on the screenshot below by pressing **Set Chat Zone** button on the main window of the AutoFish.

7. If you want to make the bot notify you about any errors or whipser messeges, *you need to start it from Telegram* (*not by pressing Start on the bot's interface*). Whisper detection will work much better and reliable if you **turn off all the other chat messages**.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Telegram remote control Test Video](https://youtu.be/aKulvFK6ubg)

## Multiple Fishing Mode :rocket:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

Multiple Fishing mode feature enables you to fish simultaneously in multiple game windows. The bot will switch between the game windows as needed for casting and catching fish. The bot should work well with up to 10 windows at the same time.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Multiple Windows Test Video](https://youtu.be/ih-xoQcByz8)

## Alt-Tab Fishing Mode :sleeping:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

Alt-Tab Fishing Mode will simulate so-called "afk fishing": the bot will focus the window only when your character needs to cast, catch or perform any action and then it will lose focus and return you to the previous window by pressing alt-tab.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Alt-Tab Fishing Test Video](https://youtu.be/lQi6fSxMyL0)

## Sound Detection :loud_sound:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/sound-detection.jpg" align="center">
</p>

Sound Detection is an alternative to pixel recognition logic. The bot will hook the bobber only after "splash" sound and won't rely on checking the animation of the bobber plunging.

With both Int. Key and Sound Detection turned on you can be completely independent from Threshold and Fishing Zone options. If you don't use Int. key or the game doesn't support it, the bot still needs to find a bobber first but checking will be done by sound recognition if you turn on Sound Detection option.

Before using sound detection turn off Music and Ambient Sounds in the game, leave only Sound Effects. Your volume should be at normal/default level. Try to find a place secluded from the sounds made by other players to avoid false detections.

You can also use Alt-Tab Fishing Mode in DX12 now, with Int.Key + Sound Detection the bot will focus the window only when it needs to cast and when it detects splash sound (turn on **Sound in Background** for that).

**Warning!** Sound Detection feature might not work with some audio devices, in that case you need to switch to another device (e.g. you are using headphones and sound detection doesn't work, then plug in speakers and test again).

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Sound Detection Test Video](https://youtu.be/ZggOy8tA32A)

## Motion Detection :runner:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/motiondetection.jpg" align="center">
</p>

You can set a zone for motion detection and the bot will notifiy you via Telegram of any events happening in this zone/area. It will also send a screenshot of the motion occured. This feature might help against griefing.  

## Additional Actions :mage:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/additionalactions.jpg" align="center">
</p>

With Additional Actions module you can perform basically any automation you need during the fishing process. You can automate any mouse or keyboard movements as well as add some additional pixel conditions. It can be used for different things: applying additional lures, opening or deleting some items, automating sending caught fish in the process and so on.


## Mount Selling :elephant:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/mammoth.jpg" align="center">
</p>

As an alternative to filtering you can use a trader on your mammoth mount to sell all the junk items during the fishing. The bot will summon your mount, target your trader, interact with it by using interaction key in the game, unsummon the mount and go on fishing.

Because of the novelty of the interaction key this feature is available only for Retail.

Depends on the mount the name of your trader might be different, so change the default value.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Mammoth Selling Test Video](https://youtu.be/zY2LqAPszdg)

## Check For Players Around :telescope:

With some additional configuration you can set the bot to check for other players around. If it finds any it will notify you via telegram and sends a screenshot of the player found. It will search for players in front of you every second and players around you every minute (default).

*For now it works only with players within 40 yd. range, because it relies on a target key.*

Before using it you need to make some simple preliminary configuration:

1. Click on color picker icon from "Target HP" option and set it somewhere on the green field of your target health bar. You can target yourself before setting if there's no other player/NPC around.
  *vanilla* - If you play on Vanilla server you might need to set "Target HP Exception" value, because on Vanilla servers "Target Nearest Friend" also targets your own character, it should be a unique to your character target window pixel (some pixel on your name or your avatar).
2. Bind your "Target Key" to the same targeting key you use in the game (if you wish to target other players, it should be something like "Target Nearest Friendly Player").  
3. Choose what the bot should do after it finds a player in "Do After Player Found" option.

### Hints and issues
- Tweak rotation time if the 360 degree turn isn't correct.
- You can turn on "Target of target", in that case you will see on the screenshot recieved whether the found player is targeting you specifically.
- This functionality won't work for non-hostile enemy players on Retail, because target friendly/enemy key doesn't target them in the game nor they have any names above if they aren't targeted first.   

## Attacking/Running away :crossed_swords:

This module isn't "plug&play" and requires proper initial configuration and testing before using.

*It definitely won't defeat anyone except for mobs, so choose a simple class for that role and make your rotation as simple as possible (some range class with simple spells that works both in melee and in range would do perfectly).*

*For now it works only with players within 40 yd. range, because it relies on a target key.*

The bot will notify you via telegram of any aggro events.

Guide:
1. Turn off the nameplates (ctrl + v) and turn on Enemy Names (Options -> Interface -> Enemy Players), you can also set NPC names to "None" to make the bot avoid mobs names.
2. Click on color picker icon from Combat Indication Pixel and point it at the place which changes when your character switches to combat mode. Usually it should be a place which changes when the character is in combat mode: for example the place where character level is, which usually changes to "double swords" or the rim around the avatar which changes to red when in the combat mode.
3. Choose what to do after the bot is being attacked: Attack, Run Away or Stop. (Run Away is the most stable choice for now).
4. Click on color picker icon from Enemy HP Pixel and point it somewhere on the green field of your target health bar.
5. Bind your "Target Key" to the same targeting key you use in the game (if you wish to target other enemy players, it should be something like "Target Nearest Enemy Player", or "Target Nearest Enemy" if you want to target mobs too).  
6. Click "+" button, if you chose "Attack" mode:
  1. If your skill works only at range but doesn't work in melee, turn "Range Only" on. (But better choose another, more universal and simpler skill)
  2. Bind the same key the skill is bound to in the game.
  3. Click on color picker icon from Skill Position and point it exactly at the number of the skill (the color should be whitish/greyish), this number is usually used for range indication and the bot will check it to determine how far it is from the enemy and how much it should come up to it.
  4. Execution time and cooldown you can find in the description of the skill and set them in the respective values.

Use "Test Rotation" button to see what will happen if you are attacked during fishing and check whether your rotation and the bot works properly for you.

### Hints and issues:
- You can change the size of enemy names in Accessibility section -> "Minimum Character Name Size". You can make it bigger to make the bot recognize enemies easier.  

## Random Camera/Character Movements :robot:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/rngMove.jpg" align="center">
</p>

The bot will randomly move and change your camera direction from time to time within the provided radius.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Random Camera/Character Movements Test Video](https://youtu.be/o1hU3fNn4uk)

## Arduino Control :joystick:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/arduino.jpg" align="center">
</p>

The bot is able to connect to your Arduino Board and use it to emulate a mouse/keyboard device, it will look like a real keyboard or mouse to the OS and the game. What you need to do to make it possible:

1. Get an Arduino with an ATmega32U4 on board (any cheap copies for 2-3$ will do too, you can find them on Chinese online markets).
2. Connect it to your computer.
3. Install [Arduino IDE](https://www.arduino.cc/en/software).
4. Click **New Sketch** and replace everything there with this sketch: [Arduino Sketch](https://github.com/jsbots/Clicker/blob/main/clicker_sketch/clicker_sketch.ino).
5. Click **Tools** -> **Port** and choose the port your Arduino Board connected to.
6. Click **Sketch** -> **Upload** and wait until the code uploads to your board.
7. Launch AutoFish, click **Advanced Settings** turn on **Use Arduino Board** option and choose the port your Arduino Board connected to, press **Connect** button.

### Hints and issues
- If your cursor either overshoots or doesn't reach the destination properly, turn off **Enhance pointer precision** in mouse settings (in Windows).

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Arduino Control Test Video](https://youtu.be/yE-qARS73oo)
