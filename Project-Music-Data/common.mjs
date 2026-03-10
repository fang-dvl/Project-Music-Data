import { getSong } from "./data.mjs";
import { getListenEvents } from "./data.mjs";

//get songs that played everyday
export function checkEveryDaySongs(user) {
  const events = getListenEvents(user);
  const songsByDay = {};
  events.forEach((e) => {
    const day = e.timestamp.slice(0, 10);
    if (!songsByDay[day]) {
  songsByDay[day] = new Set();
  }
  songsByDay[day].add(getSong(e.song_id).title);
  });
  const allDays = Object.keys(songsByDay);
  const allSongs = new Set(events.map((e) => getSong(e.song_id).title));
  const result = {};
  allSongs.forEach((song) => {
    result[song] = allDays.every((day) => songsByDay[day].has(song));
  });
  return Object.keys(result).filter(song => result[song]);
}

//get the most played song by number of listens
export function getMostPlayed(user) {
  const events = getListenEvents(user);
  const listens = {};
  const artists = {};
  const mostPlayed = {};
  let maxTime = 0;
  let fridayListens = {};
  let fridayMaxTime = 0;
  let fridayMaxListens=0;

  events.forEach((e) => {
    //get most played song and artist by listening time
    let songTitle=getSong(e.song_id).title
    let songArtist=getSong(e.song_id).artist

    listens[songTitle] = (listens[songTitle] || 0) + 1;
    artists[songArtist] = (artists[songArtist] || 0) + listens[songTitle];
    const count = listens[songTitle] || 0;
    const totalTime = count * getSong(e.song_id).duration_seconds;

    if (totalTime > maxTime) {
      maxTime = totalTime;
      mostPlayed.mostPlayedSongsByTime= songTitle;
      mostPlayed.mostPlayedArtistByTime= songArtist;
    }
    
    //get most played song on Friday night by number of listens
    const date = new Date(e.timestamp);
    const daysOfWeek = date.getDay();
    const hour = date.getHours();

    if ((daysOfWeek === 5 && hour >= 17 && hour < 24) || (daysOfWeek === 6 && hour >= 0 && hour < 4)) {
      fridayListens[songTitle] = (fridayListens[songTitle] || 0) + 1;
      if (fridayListens[songTitle] > fridayMaxListens) {
        fridayMaxListens = fridayListens[songTitle];
        mostPlayed.mostPlayedSongFridayByListens = songTitle;
      }

    //get most played song on Friday night by listening time
      let fridayTotalTime =fridayListens[songTitle] * getSong(e.song_id).duration_seconds;
      if (fridayTotalTime > fridayMaxTime) {
        fridayMaxTime = fridayTotalTime;
        mostPlayed.mostPlayedSongFridayByTime =songTitle;
      }
    }
});

   if (Object.keys(listens).length === 0) {
    mostPlayed.mostPlayedSongsByListens = null;
    mostPlayed.mostPlayedArtistByListens = null;
    mostPlayed.mostPlayedSongsByTime = null;
    mostPlayed.mostPlayedArtistByTime = null;
    mostPlayed.mostPlayedSongFridayByListens = null;
    mostPlayed.mostPlayedSongFridayByTime = null;
    return mostPlayed;
  }

  //get most played songs and artists by listens
  const maxSongListens = Math.max(...Object.values(listens));
  mostPlayed.mostPlayedSongsByListens = (Object.keys(listens).filter(
    (song) => listens[song] === maxSongListens) );
  const maxArtistListens= Math.max(...Object.values(artists));
  mostPlayed.mostPlayedArtistByListens =(Object.keys(artists).filter(
    (artist) => artists[artist] === maxArtistListens) );
  return mostPlayed;
}

//get 3 most played genres by number of listens
export function getMostGenresByListens(user) {
  const events = getListenEvents(user);
  let genreListens = {};
  events.forEach((e) => {
    genreListens[getSong(e.song_id).genre] =
      (genreListens[getSong(e.song_id).genre] || 0) + 1;
  });
  const result = Object.entries(genreListens).sort((a, b) => b[1] - a[1]);
  const mostPlayedGenres = result.slice(0, 3).map((genre) => genre[0]);
  return mostPlayedGenres;
}

//get most played song in a row and how many times
export function getSongInARow(user) {
  const events = getListenEvents(user);
  let songsInRow = {};
  for (let i = 1; i < events.length; i++) {
    if (events[i].song_id === events[i - 1].song_id) {
      songsInRow[events[i].song_id] =
        (songsInRow[events[i].song_id] || 1) + 1;
    }
  }
  if (Object.keys(songsInRow).length === 0) {
    return null;
  }
  const result = Object.entries(songsInRow).sort((a, b) => b[1] - a[1]);
  return result[0];
}
