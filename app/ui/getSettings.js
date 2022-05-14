const getSettings = async () => {
  return {name: 'MoP',
          timer: Infinity, // (Math.abs(+timerData.value) || Infinity) * 60 * 1000,
          control: 'Virtual',
          autoLoot: true,
          multiple: false,
          instruction: {
           "MoP": `
        1. Launch the game.
        2. Switch to DirectX 11 mode.
        3. Turn off Vertical Sync.
        4. Switch to Windowed(fullscreen) mode
        5. Equip your favorite fishpole.
        6. Assign your 'fishing' skill to the '2' key.
        7. Find a good place to fish (watch the video).
        8. Don't use your keyboard and mouse while the bot is working.
        9. You can press 'space' to stop the bot.
        `,
          "Retail&classic": `
          1. Launch the game.
          2. Switch to DirectX 11 mode.
          3. Turn off Vertical Sync.
          4. Switch to Windowed(fullscreen) mode
          5. Equip your favorite fishpole.
          6. Assign your 'fishing' skill to the '2' key.
          7. You can use either Hardware (with opened game) or Virtual (in the background) mode.
          8. Find a good place to fish (watch the video).
          `
          }
        };
};

module.exports = getSettings;
