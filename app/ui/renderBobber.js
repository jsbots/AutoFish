const { ipcRenderer } = require("electron");

const drawOnCanvas = ({ pos: {x, y}, color: [r, g, b] }, cx) => {
	cx.fillStyle = `rgb(${r}, ${g}, ${b})`;
	cx.fillRect(x, y, 1, 1);
}

const editRedPixels = (pixel, threshold) => {
  	let [r, g, b] = pixel.color;
  	if (r - g > 70 && r - b > 70 && pixel.pos.y < 32) {
  		r = +threshold + 70;
  		return {
  			pos: pixel.pos,
  			color: [r, g, b],
  		};
  	} else {
  		return pixel;
  	}
}

const renderBobber = (cx, threshold) => {
  ipcRenderer.invoke('get-bitmap', `../img/bobber.jpg`).then((bitmap) => {
    bitmap.map((pixel) => editRedPixels(pixel, threshold))
      .forEach((pixel) => drawOnCanvas(pixel, cx));
  })
}

module.exports = renderBobber;
