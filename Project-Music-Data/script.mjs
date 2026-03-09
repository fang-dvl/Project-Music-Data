// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.
import { getUserIDs } from "./data.mjs";
import { getListenEvents,getSong } from "./data.mjs";
import { checkEveryDaySongs } from "./common.mjs";
import { getMostPlayed} from "./common.mjs";
import { getMostGenresByListens, getSongInARow } from "./common.mjs";

window.onload = function () {
  selectAnUser();
};

//select an user
function selectAnUser() {
  const userSelectBar = document.getElementById("user-source");
  getUserIDs().forEach((user) => {
    const option = document.createElement("option");
    option.textContent = `User ${user}`;
    option.value = user;
    userSelectBar.append(option);
  });
  userSelectBar.addEventListener("change", (event) => {
    const selectedUser = event.target.value;
    createUserPage(selectedUser);
  });
}

//create a page for selected user
const main = document.createElement("main");
function createUserPage(user) {
  main.innerHTML = "";
  if (getListenEvents(user).length === 0) {
    main.innerHTML = "This user listens no songs.";
    document.body.appendChild(main);
  } 
  else {
    const everydaySong = document.createElement("p");
    everydaySong.id = "everyday-song";
    everydaySong.textContent = `Songs that played everyday: ${checkEveryDaySongs(user)}`;
    main.appendChild(everydaySong);
    if (Object.keys(checkEveryDaySongs(user)).length === 0) {
      everydaySong.remove();
    }

    const mostPlayedSong1 = document.createElement("p");
    mostPlayedSong1.innerHTML = `The most played song (by number of listens): ${getMostPlayed(user).mostPlayedSongsByListens}`;

    const mostPlayedSong2 = document.createElement("p");
    mostPlayedSong2.innerHTML = `The most played song (by listening time): ${getMostPlayed(user).mostPlayedSongsByTime}`;

    const mostPlayedArtist1 = document.createElement("p");
    mostPlayedArtist1.innerHTML = `The most played artist (by number of listens): ${getMostPlayed(user).mostPlayedArtistByListens}`;

    const mostPlayedArtist2 = document.createElement("p");
    mostPlayedArtist2.innerHTML = `The most played artist (by listening time): ${getMostPlayed(user).mostPlayedArtistByTime}`;

    const songFriday1 = document.createElement("p");
    songFriday1.innerHTML = `The most played song on Friday night (by number of listens): ${getMostPlayed(user).mostPlayedSongFridayByListens}`;

    const songFriday2 = document.createElement("p");
    songFriday2.innerHTML = `The most played song on Friday night (by listening time): ${getMostPlayed(user).mostPlayedSongFridayByTime}`;

    const mostPlayedGenres = document.createElement("p");
    mostPlayedGenres.innerHTML = `${getMostGenresByListens(user).length} most played genres (by number of listens): ${getMostGenresByListens(user)}`;

    const songInARow = document.createElement("p");
    songInARow.innerHTML = `The most played song in a row: ${getSong(getSongInARow(user)[0]).title}, ${getSongInARow(user)[1]} times`;

    main.append(
      mostPlayedSong1,
      mostPlayedSong2,
      mostPlayedArtist1,
      mostPlayedArtist2,
      songFriday1,
      songFriday2,
      mostPlayedGenres,
      songInARow,
    );
    if (getMostPlayed(user).mostPlayedSongsByListens===null) {songFriday1.remove()};
    if (getMostPlayed(user).mostPlayedSongsByTime===null) {songFriday2.remove()};
    if (getMostPlayed(user).getMostPlayedArtistByListens===null) {mostPlayedArtist1.remove()};
    if (getMostPlayed(user).mostPlayedArtistByTime===null) {mostPlayedArtist2.remove()};
    if (getMostPlayed(user).mostPlayedSongFridayByListens===null) {songFriday1.remove()};
    if (getMostPlayed(user).mostPlayedSongFridayByTime===null) {songFriday2.remove()};
    if (getMostGenresByListens(user).length === 0) {mostPlayedGenres.remove()};
    if (getSongInARow(user)[0]===null) {songInARow.remove()};
    
    document.body.appendChild(main);
  }
}
