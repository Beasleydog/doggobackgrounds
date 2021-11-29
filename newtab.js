let current;
chrome.storage.local.get(['count', 'urls', 'albums'], function (result) {
  current = result.count;
  let list = result.urls;
  let albums = result.albums;

  if (list.length == 0) {
    if (albums.length == 0) {
      noAlbums.style.display = "block";
    } else {
      noImg.style.display = "block";
    }
  } else {
    document.getElementById("img").src = list[current % list.length];

    var preLoad = new Image();
    preLoad.src = list[(current + 1) % list.length];
  }
});

document.getElementById("img").onload = imageLoaded;

function imageLoaded() {
  document.getElementById("img").style.transform = "translate(-50%, calc(-50% + 60px))";
  document.getElementById("img").style.opacity = "1";
  chrome.storage.local.set({ count: current + 1 }, function () { });
}
setInterval(setDateTime, 100);
function setDateTime() {
  document.getElementById("date").innerText = (new Date().getMonth() + 1 + "/" + new Date().getDate() + "/" + new Date().getFullYear().toString().slice(2));
  document.getElementById("time").innerText = `${(new Date().getHours() > 12 ? new Date().getHours() - 12 : new Date().getHours())}:${(new Date().getMinutes().toString().length == 1 ? "0" + new Date().getMinutes() : new Date().getMinutes())}`;
}
setDateTime();
async function updateWeather() {
  navigator.geolocation.getCurrentPosition(async function (e) {
    var weather = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${e.coords.latitude}&lon=${e.coords.longitude}&appid=5ba16d20e95982050421599b2de0c854`);
    weather = await weather.text();
    document.getElementById("location").innerText = JSON.parse(weather).name;
    document.getElementById("weather").innerHTML = ((JSON.parse(weather).main.temp - 273.15) * 9 / 5 + 32).toString().slice(0, 4) + '&#176;, ' + JSON.parse(weather).weather[0].main;
  })
}
updateWeather();













backCanvas.width = window.innerWidth;
backCanvas.height = window.innerHeight;
var ctx = backCanvas.getContext("2d");
ctx.shadowBlur = "10";
ctx.shadowColor = "#1F1F1F";
var pieces = [];
var pastSide = 0;
function backCanvasPiece(x, y) {
  this.r = Math.random() * 100 + 15;
  this.rv = Math.random() * 0.1 - 0.05;
  this.a = Math.random() * 360;
  this.av = Math.random() * 0.01 - 0.005;
  this.xv = Math.random() * 1;
  this.yv = Math.random() * 1;
  this.xvv = Math.random() * 0.01 - 0.005;
  this.yvv = Math.random() * 0.01 - 0.005;
  var side = Math.round(Math.random() * 3) + 3;
  while (side == pastSide) {
    side = Math.round(Math.random() * 3) + 3;
  }
  this.sides = side;
  pastSide = side;
  if (Math.round(Math.random()) == 1) {
    if (Math.round(Math.random()) == 1) {
      //top
      this.x = Math.random() * window.innerWidth;
      this.y = -this.r;
    } else {
      //bottom
      this.x = Math.random() * window.innerWidth;
      this.y = window.innerHeight + this.r;
      this.yv *= -1;
    }
  } else {
    if (Math.round(Math.random()) == 1) {
      this.y = Math.random() * window.innerHeight;
      this.x = -this.r;
      //left
    } else {
      //right
      this.y = Math.random() * window.innerHeight;
      this.x = window.innerWidth + this.r;
      this.yv *= -1;
    }
  }
  if (x && y) {
    this.x = x;
    this.y = y;
  }
  this.on = false;
  this.del = false;
  this.c = "#161817";
}
for (var i = 0; i < 20; i++) {
  pieces.push(new backCanvasPiece());
}
for (var i = 0; i < 500; i++) {
  introTick();
  if (Math.random() > .99999) {
    pieces.push(new backCanvasPiece());
  }
}
function backCanvasAddPiece() {
  if (pieces.length < 20) {
    pieces.push(new backCanvasPiece());
  }
  setTimeout(backCanvasAddPiece, Math.random() * 250 + 100);
}
backCanvasAddPiece();
function introTick() {
  ctx.clearRect(0, 0, backCanvas.width, backCanvas.height);
  pieces = pieces.map(function (x) {
    ctx.fillStyle = x.c;
    ctx.beginPath();
    polygon(ctx, x.x, x.y, x.r, x.sides, x.a);
    ctx.fill();
    x.r += x.rv;
    x.a += x.av;
    x.x += x.xv;
    x.y += x.yv;
    x.xv += x.xvv;
    x.yv += x.yvv;
    if (
      x.x - 3 * x.r > window.innerWidth ||
      x.x + 3 * x.r < 0 ||
      x.y - 3 * x.r > window.innerHeight ||
      x.y + 3 * x.r < 0
    ) {
      if (x.on) {
        x.on = false;
        x.del = true;
      }
    } else {
      x.on = true;
    }
    return x;
  });
  pieces = pieces.filter(function (x) {
    return !x.del;
  });
}
setInterval(introTick, 10);
function polygon(ctx, x, y, radius, sides, startAngle) {
  if (sides < 3) return;
  var a = (Math.PI * 2) / sides;
  radius = Math.abs(radius);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(startAngle);
  ctx.moveTo(radius, 0);
  for (var i = 1; i < sides; i++) {
    ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.restore();
}