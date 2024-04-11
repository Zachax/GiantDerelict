// script.js
alert('This is JavaScript from an external file running on GitHub Pages!');

const app = new PIXI.Application({ width: 800, height: 600 });
document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();

app.stage.addChild(graphics);
