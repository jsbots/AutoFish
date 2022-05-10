const Log = require("../logger.js");
const getCurrentTime = require("../getCurrentTime.js");

describe("Log", () => {
  const mockSend = jest.fn((eventName, text, type) => ({
    eventName,
    text,
    type,
  }));

  let date;
  const win = {
    webContents: {
      send(eventName, { text, type }) {
        mockSend(eventName, text, type);
        date = getCurrentTime();
      },
    },
  };

  const log = new Log(win);
  
  it("sends data to the provided window from Electron using win.webContents.send(eventName, data) method", () => {
    log.send("send");
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.results[0].value).toEqual({
      eventName: "log-data",
      text: `[${date.hr}:${date.min}:${date.sec}] send`,
      type: "black",
    });
  });
});
