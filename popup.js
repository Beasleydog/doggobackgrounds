

renderAlbums();


newAlbum.onclick = function () {
    chrome.storage.local.get(['albums'], function (result) {
        let newAlbums = result.albums;
        newAlbums.push({ url: "", name: "", id: Math.round(Math.random() * 10000000) })
        chrome.storage.local.set({ albums: newAlbums });

        renderAlbums();
    });
}
function renderAlbums() {
    list.innerHTML = ""

    chrome.storage.local.get(['albums'], function (result) {
        const albums = result.albums;
        albums.forEach((album) => {
            renderAlbum(album.id, album.url, album.name, album.wrongLink)
        });
    });

}
function renderAlbum(id, url, name, wrongLink) {
    let albumContainer = document.createElement("div");
    document.getElementById("list").appendChild(albumContainer);

    albumContainer.outerHTML = ` 
    <div class="albumContainer" albumId="${id}">
        <div class="albumStatus">
            <div class="albumDelete">❌</div>
        </div>
        <div class="albumInfo">
            <div class="albumTitle">${name}</div>
            <input class="albumUrl ${(wrongLink ? "wrong" : "valid")}" type="text" value="${url}"></input>
        </div>
    </div>`;

    list.querySelector(`div[albumid="${id}"]`).querySelector("input[type=text]").oninput = function () {
        if (checkInput(this.value)) {
            if (!wrongLink) {
                this.classList.add('valid');
            }
            updateAlbumURL(id, this.value);
        } else {
            this.classList.remove('valid');

        }
    }


    list.querySelector(`div[albumid="${id}"]`).querySelector("div.albumDelete").onclick = function () {
        deleteAlbum(id);
    }
}
function deleteAlbum(id) {
    chrome.storage.local.get(['albums'], function (result) {
        let newAlbums = result.albums;
        newAlbums = newAlbums.filter((album) => {
            return album.id != id;
        })
        chrome.storage.local.set({ albums: newAlbums }, function () {
            renderAlbums();
            chrome.runtime.sendMessage({ msg: "getImages" });
        });
    });
}
function updateAlbumURL(id, url) {
    chrome.storage.local.get(['albums'], function (result) {
        let newAlbums = result.albums;
        newAlbums = newAlbums.map((album) => {
            if (album.id == id) {
                album.url = url;
            }
            return album;
        })
        chrome.storage.local.set({ albums: newAlbums }, function () {
            chrome.runtime.sendMessage({ msg: "getImages" });
        });
    });
}

// album.oninput = input;
let regex = /https:\/\/photos\.app\.goo\.gl\/.*/;

function checkInput(url) {
    return regex.exec(url);
    album.classList.add('valid');
    chrome.storage.local.set({ 'album': album.value });
    album.classList.remove('valid');
}
setTimeout(function () {
    // location.reload();
}, 100)

chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.msg == "updatedAlbums") {
            location.reload();
        }
    }
);