function getImages() {
    chrome.storage.local.get(['albums'], async function (result) {
        const idString = result.albums.filter((x) => { return x.enabled }).filter((x) => { return x.url != "" }).map((albumUrl) => { return albumUrl.url.replace("https://photos.app.goo.gl/", "") }).join(",")
        console.log(idString)

        let newURLS = [];

        var data = await fetch(`https://googlephotos-scraper.glitch.me/V1/${idString}`);

        data = await data.json();

        data.forEach(function (album) {
            album.urls.sort(() => Math.random() - 0.5).forEach(function (url) {
                newURLS.push(url);
            })
        });

        chrome.storage.local.set({ urls: newURLS }, function () { });

        console.log(result.albums);
        result.albums = result.albums.map((album) => {
            if (data.filter((x) => { return x.url == album.url }).length > 0 && data.filter((x) => { return x.url == album.url })[0].urls.length > 0) {
                album.wrongLink = undefined;
                album.name = data.filter((x) => { return x.url == album.url })[0].title;
            } else {
                album.wrongLink = true;
                album.name = "";
            }
            return album;
        });
        console.log(result.albums);

        chrome.storage.local.set({ albums: result.albums }, function () {
            chrome.runtime.sendMessage({
                msg: "updatedAlbums"
            });
        });

    });
}

const defaultAlbums = [{ url: "https://photos.app.goo.gl/9APkeFxFjWWegNmC7", enabled: true, name: "Doggo Backgrounds", id: Math.round(Math.random() * 10000000) }];

chrome.runtime.onInstalled.addListener(e => {
    chrome.storage.local.get(['albums'], function (result) {
        if (!result.albums) {
            chrome.storage.local.set({ albums: defaultAlbums }, function () { getImages(); });
        }
    });
    if (e.reason == "install") {
        chrome.storage.local.set({ albums: defaultAlbums }, function () { getImages(); });
        chrome.storage.local.set({ urls: [] }, function () { });
        chrome.storage.local.set({ count: 0 }, function () { });
    }

});

chrome.runtime.onMessage.addListener(async function (request) {
    if (request.msg == "getImages") {
        getImages();
    }
});

var int = 720;
chrome.alarms.create("getImages", {
    delayInMinutes: int,
    periodInMinutes: int
});
chrome.alarms.onAlarm.addListener(async function (a, b, c) {
    if (a.name == "getImages") {
        getImages();
    }
});
