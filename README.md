<p align="center"> <img src="app/img/logo.png" width="400px"> </p>
<div align="center">

 <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/olesgeras/autofish"> [![GitHub license](https://img.shields.io/github/license/olesgeras/AutoFish)](https://github.com/olesgeras/AutoFish/blob/4c5f0fdb5af0f1378f3318d563c5738fa7580e2f/LICENSE)
<a href="https://youtu.be/A3W8UuVIZTo"><img alt="" src="https://img.shields.io/youtube/views/A3W8UuVIZTo?style=social"></a>

</div>

## Table of Contents :page_with_curl:

- [Fishing bot](#fishing-bot-fish)
- [Disclaimer](#disclaimer-warning)
- [Guide](#guide-blue_book)
- [Threshold](#threshold-red_circle)
- [Fishing zone](#fishing-zone-dart)
- [Applying Lures](#applying-lures-pushpin)
- [Interactive key](#interactive-key)
- [Soulbound items](#soulbound-items-auto-confirmation-large_blue_diamond)
- [Download](#download-open_file_folder)
- [AutoFish Premium](#autofish-premiumcrown)

## Fishing bot :fish:

This is a fishing bot designed for wow-like fishing logic (when a model of a bobber has red/blue feather and plunging animation, for example it can work even with Minecraft). It is built using the [Electron](https://github.com/electron/electron) and leverages [keysender](https://github.com/Krombik/keysender) and [nut.js](https://github.com/nut-tree/nut.js) libraries to analyze the screen and automate the fishing process in a manner that mimics human behavior with various elements of randomness, including random sleep intervals, random reactions, random delays after catching, randomized mouse speed and curvature, and random bobber highlighting.

This bot is capable of simultaneously handling one or multiple game windows. Additionally, it incorporates the use of [tesseract.js](https://github.com/naptha/tesseract.js) for loot filtering.

<p align="center">
<img src="guide_img/UI.jpg" width="640">
</p>

For more detailed review you can watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.12](https://youtu.be/A3W8UuVIZTo)

This is commonly referred to as a "pixel bot." It operates without modifying the game's memory or utilizing vision libraries like OpenCV. Instead, it employs a simpler approach: it analyzes the game window for concentrated red colors and monitors that area for any changes. As the bobber moves and gently sways, the bot follows its motion. However, when the bobber suddenly jerks, the bot clicks on it and catches the fish.

## Disclaimer :warning:

**This project was solely developed for educational purposes, aiming to explore the feasibility of creating a functional gaming bot using web-development technologies only. The software provided should never be used with real-life applications, games and servers**

If you still want to use it outside educational sandbox, it is crucial to understand and accept the associated risks. You assume full responsibility for any outcomes that may arise, as no one else can be held accountable. It's essential to acknowledge that this software is not designed to be "undetectable" in any way, nor was it ever intended for such purposes as stated above. As a result, **no guarantees or assurances can be made regarding the functionality or outcomes of the bot**.

## Guide :blue_book:

1. Launch the game.
2. Are you using **Filter** feature?
   - Yes: Turn off **Auto Loot** in the game, set **UI scale** in the game to default, turn on **Open loot window at mouse** in the game.
   - No: Turn on **Auto Loot** in the game.
3. Assign your 'fishing' and 'lures' keys in the game and assign the same keys for the bot.
4. Find a place to fish.
5. Set up your **Fishing Zone** by clicking the **Set Fishing Zone** button. Adjust the size and position of the **Fishing Zone** window to exclude any reddish or bluish elements (depending on the switch you selected). Keep in mind that the **Fishing Zone** functions as an overlay, so it will also recognize colors from your character and the game's user interface, including texts and health bars.
6. Press the Start button and refrain from using your mouse and keyboard (if you require the bot to function in the background, consider using a **virtual machine** such as VirtualBox or VMware Player).
7. To stop the bot, press your designated stop key (default: space).


### Hints and Issues

- The bot has been exclusively tested with the default user interface (UI) and default UI scale, without any addons. Therefore, before using the bot, ensure that all addons are turned off and the UI scale is set to default. This is particularly important for fishing addons like Fishing Buddy and others. Disable any UI features they provide.
- The bot will make 5 attempts to cast and find the bobber (default: 5). If it fails, it will stop the application.
- If you use Filter feature in different from English languages for the first time, wait until the bot downloads the data for your language. Also read about [Soulbound items](#soulbound-items-auto-confirmation-large_blue_diamond).
- With older games the bot might run into "Interrupted" loop: it's when the bot will confuse the previous bobber for the current one and after the bobber dissappeared the bot will think that it caught the fish and will recast, after that the whole process will repeat again and again. To bypass this issue use **Manual Threshold** or increase **Cast Animation Delay** value to make the bot wait until the previous bobber will disappear completely.  
- If the bot doesn't move/press/clicks your mouse, try to launch it as administrator.
- The bot works properly only with 1 monitor, so if you use multiple monitors, launch the bot and the game on **the primary one**.
- Sound Detection feature might not work with some audio devices, in that case you need to switch to another device (e.g. you are using headphones and sound detection doesn't work, then plug in speakers and test again).
- You can turn off all the "sleeping" and random values to make the bot work **2-3 times** faster.
- Don't fish near other players, the bot might confuse their bobber for yours.

## Threshold :red_circle:

*Since 2.0.0 Threshold value is obsolete and available only in Manual mode*

The Threshold value represents an RGB value of a red or blue color, depending on the switch used. It serves as a color threshold below which the bot will ignore all corresponding colors.

For instance, if the red switch is used and the threshold is set to 60, the bot will only recognize colors that are redder than this threshold value. This allows the bot to focus on the reddest parts of the screen, such as a red feather on the bobber.

Increasing the threshold value will result in the bot recognizing fewer red colors, while decreasing the threshold value will cause the bot to recognize more red colors on the screen.

### Errors (Manual mode only)

Are you encountering an error?

> Yes, it says: *Found red/blue colors before casting. Change your Fishing Zone or increase the Threshold value or change the fishing place.*

Adjust the position or size of your **Fishing Zone** to exclude any reddish or bluish elements. If you are certain there are none, you may need to increase the **Threshold** or switch to the other color.

> No, but the bot recasts all the time and can't find the bobber. (as says in the log)

It indicates that you may have set the **Threshold** value too high. Try decreasing it. If the error persists, there might be an issue with the size or position of your **Fishing Zone**.

> No, but the bot clicks too early before fish is even hooked.

There are a couple of solutions for this. First, try switching to the 1st person view. If that doesn't help, navigate to the **Advanced Settings** and adjust either the **Bobber Sensitivity** (disable the Auto adjust Sensitivity and Density option) or the **Bobber Density** (particularly if it's not Retail) values in the **Critical** section.

> No, the bot finds the bobber (as says in the log) but it doesn't react to the bobber being hooked.

Then you do the opposite to the previous issue: navigate to the **Advanced Settings** and decrease either the **Bobber Sensitivity** (particularly if it's Retail) or the **Bobber Density** (especially if it's not Retail) values in the **Critical** section. In the case of Vanilla (splash), you can decrease the Splash Color value."

## Fishing Zone :dart:

The Fishing Zone is an adjustable area in the water where your bobber may land. The bot specifically searches for the bobber within this designated area.

The Fishing Zone is displayed as an overlay window, meaning that the bot will also recognize the colors of your character and user interface.

To assist you in assessing the presence of red or blue colors within the Fishing Zone, there is a "Check" button. This feature relies on the Threshold value. If, upon pressing the Check button, the window turns red, close the window, gradually increase the Threshold value, and test again. Repeat this process until the window turns green.

A general guideline to follow is that the better you can perceive the red or blue feather, the better the bot will be able to detect it as well. Consider the following tips:

- Optimize your video settings to enhance visibility, excluding weather effects.
- Disable weather effects to prevent the bot from confusing rain or fog with bobber movements. However, note that extremely harsh weather conditions, such as blizzards, may significantly reduce the bot's efficiency. In such cases, you can either find an alternative fishing spot, switch between blue and red feathers, or wait for better weather.
- Keep in mind that different camera directions can affect the brightness, size, and visibility of the red feather on the bobber, subsequently impacting the bot's performance. While the specific location may not be critical, the direction and positioning are crucial.
- Although camera position is not highly significant, in dark or snowy areas, a closer view of the bobber might improve visibility. Generally, a normal third-person view is ideal.
- Adjust gamma, brightness, and contrast settings to enhance the brightness and vibrancy of the bobber.
- In very dark zones, consider using alternative bobbers with distinctive red or blue colors instead of the default one.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AutoFish 1.12](https://youtu.be/A3W8UuVIZTo) for video explanation.

## Applying Lures :pushpin:
For **Retail** and **Classic/Vanilla** type of fishing you need to use a macro that will apply the lures onto your fishpole and **assign that macro to **Lures Key** option**:

**retail**:

```
/use *lure_name*
/use *fishpole_name*
```

**Classic**:

```
/equip *fishpole_name*
/use *lure_name*
/use 16
```

**Vanilla**:

```
/script UseAction(*your lures key*);
/script PickupInventoryItem(16);
/script ReplaceEnchant();
```

## Interactive key

In **Retail**-like games You can use interactive key to catch your fish, if you want to use it with the bot, turn on Int. Key option and assign the same key you use for interactive key in the game.

<p align="center">
<img src="guide_img/intkey.jpg" align="center">
</p>

To make the interactive key work, you use this commands (write them in the chat and press enter, one by one):
```
/console SoftTargetInteractArc 2  - This will allow you to interact with the bobber no matter which way you are facing.
/console SoftTargetInteractRange 30  - This increases the interaction range to 30 yards. Adjust to your needs
```

## Soulbound items auto-confirmation :large_blue_diamond:

If the item requires confirmation on looting, the bot will confirm it automatically. **This won't work with AutoLoot turned on**, so if you need such items always use **whitelist**. **This feature also doesn't work with any other language except English**. As a solution (both if you need AutoLoot on and if your WoW isn't in English) use [AutoLooter](https://www.curseforge.com/wow/addons/autolooter) instead.


## AutoFish Premium	:crown:

AutoFish Premium is the same application only with some additional features available for supporters of the project.

<p align="center">
<img src="guide_img/Premium_UI.jpg" width="640">
</p>

**Premium Features/Content:**
- [Remote Control](#remote-control-iphone)
- [Arduino Control](#arduino-control-joystick)
- [Multiple Fishing Mode](#multiple-fishing-mode-rocket)
- [Alt-Tab Fishing Mode](#alt-tab-fishing-mode-sleeping)
- [Sound Detection](#sound-detection-loud_sound)
- [Mount Selling](#mount-selling-elephant)
- [Motion Detection](#motion-detection-runner)
- [Additional Actions](#additional-actions-mage)
- [Random camera/character movements](#random-cameracharacter-movements-robot)
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

The Multiple Windows feature enables you to fish simultaneously in multiple game windows, with support for up to four windows. The bot will seamlessly switch between the game windows as needed for casting and catching fish. This feature enhances your fishing efficiency by allowing you to manage multiple fishing spots or engage in multi-character fishing activities.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Multiple Windows Test Video](https://youtu.be/ih-xoQcByz8)

## Alt-Tab Fishing Mode :sleeping:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

To facilitate the use of the bot when you have a single monitor and cannot run it in the background or set up a virtual machine, the AFK Fishing mode is available. This mode enables the bot to focus on the game window only during the casting and fish-catching process. After that, it will automatically switch back to the previous window using the Alt + Tab keys.

With AFK Fishing mode, you can engage in other activities such as watching videos, browsing the internet, or reading a book while the bot continues to monitor the bobber in the background. It's important to note that this mode requires DirectX11 (turned on in the game) for proper functionality.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [AFK Fishing Test Video](https://youtu.be/lQi6fSxMyL0)

## Sound Detection :loud_sound:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/sound-detection.jpg" align="center">
</p>

Sound Detection is an alternative to pixel recognition logic. The bot will hook the bobber only after "splash" sound and won't rely on checking the animation of the bobber plunging.

With both Int. Key and Sound Detection turned on you can be completely independent from Threshold and Fishing Zone options. If you don't use Int. key or the game doesn't support it, the bot still needs to find a bobber first but checking will be done by sound recognition if you turn on Sound Detection option.

Before using sound detection turn off Music and Ambient Sounds in the game, leave only Sound Effects. Your volume should be at normal/default level. Try to find a place secluded from the sounds made by other players to avoid false detections.

You can also use AFK Fishing Mode in DX12 now, with Int.Key + Sound Detection the bot will focus the window only when it needs to cast and when it detects splash sound (turn on Sound in Background for that).

**Warning!** Sound Detection feature might not work with some audio devices, in that case you need to switch to another device (e.g. you are using headphones and sound detection doesn't work, then plug in speakers and test again).

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Sound Detection Test Video](https://youtu.be/ZggOy8tA32A)

## Mount Selling :elephant:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/mammoth.jpg" align="center">
</p>

As an alternative to filtering you can use a trader on your mammoth mount to sell all the junk items during the fishing. The bot will summon your mount, target your trader, interact with it by using interaction key in the game, unsummon the mount and go on fishing.

Because of the novelty of the interaction key this feature is available only for Retail.

Depends on the mount the name of your trader might be different, so change the default value.

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Mammoth Selling Test Video](https://youtu.be/zY2LqAPszdg)

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

You will be able to add as many additional actions which require repetition as you want (e.g. applying additional lures or using different bobbers).

## Random Camera/Character Movements :robot:

*This feature is available only for [Premium version](https://www.buymeacoffee.com/jsbots/e/96734) of the app*

<p align="center">
<img src="guide_img/rngMove.jpg" align="center">
</p>

The bot will randomly move and change your camera view from time to time within the given value. It will also balance itself every n minutes (default: 5) and return to the initial camera and character position.  

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

Watch <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png" width="20"> [Arduino Control Test Video](https://youtu.be/yE-qARS73oo)

## Download :open_file_folder:

<p align="center">
<a href="https://www.buymeacoffee.com/jsbots"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=jsbots&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

AutoFish 2.2.6 Public: [Download](https://www.buymeacoffee.com/jsbots/e/95380)

AutoFish 2.4.1 Premium: [Download](https://www.buymeacoffee.com/jsbots/e/96734)

The software is open-source, allowing you to clone the repository, review the code, and launch it directly from the command-line interface if you have concerns about downloading the executable file.

If you choose to download the executable file, it functions as a setup file that installs the bot in the following directory: *c:/users/your_user/App Data/Local/random_folder/*. Additionally, a shortcut with a randomly generated name will be created on your desktop.

If you wish to uninstall the bot, you can do so through the Windows Settings. The uninstaller will have the same name as the shortcut on your desktop.

Please note that if you download a new setup file, it is necessary to uninstall the previous version of AutoFish before proceeding. The application and folder names are generated randomly during each installation, preventing automatic installation of a new version in the previous folder.
