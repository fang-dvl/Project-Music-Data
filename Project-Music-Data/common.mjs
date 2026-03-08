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
  return Object.keys(result);
}

//get the most played song by number of listens
export function getMostPlayedSongByListens(user) {
  const events = getListenEvents(user);
  const listens = {};
  events.forEach((e) => {
    let songTitle=getSong(e.song_id).title
    listens[songTitle] = (listens[songTitle] || 0) + 1;
  });
  const maxListens = Math.max(...Object.values(listens));
  const mostPlayedSongs = Object.keys(listens).filter(
    (song) => listens[song] === maxListens,
  );
  return mostPlayedSongs;
}

//get the most played song by listening time
export function getMostPlayedSongByTime(user) {
  const events = getListenEvents(user);
  const listens = {};
  let maxTime = 0;
  let mostPlayedSong = null;
  events.forEach((e) => {
    let songTitle=getSong(e.song_id).title
    listens[songTitle] = (listens[songTitle] || 0) + 1;;
    const count = listens[songTitle] || 0;
    const totalTime = count * getSong(e.song_id).duration_seconds;
    if (totalTime > maxTime) {
      maxTime = totalTime;
      mostPlayedSong = songTitle;
    } });
  return mostPlayedSong;
}

//get the most played artist by number of listens
export function getMostPlayedArtistByListens(user) {
  const listens = {};
  const artists = {};
  const events = getListenEvents(user);
  events.forEach((e) => {
    listens[e.song_id] = (listens[e.song_id] || 0) + 1;
    let artName = getSong(e.song_id).artist;
    artists[artName] = (artists.artName || 0) + listens[e.song_id];
  });
  const maxListens = Math.max(...Object.values(artists));
  const mostPlayedArtist = Object.keys(artists).filter(
    (artist) => artists[artist] === maxListens,
  );
  return mostPlayedArtist;
}

//get the most played artist by listening time
export function getMostPlayedArtistByTime(user) {
  const listens = {};
  let artists = {};
  const events = getListenEvents(user);
  events.forEach((e) => {
    listens[e.song_id] = (listens[e.song_id] || 0) + 1;
    const count = listens[e.song_id] || 0;
    const totalTime = count * getSong(e.song_id).duration_seconds;
    artists[getSong(e.song_id).artist] = (artists[getSong(e.song_id).artist] || 0) + totalTime;
  });
  let maxTime = 0;
  let mostPlayedArtist = null;
  for (let artist in artists) {
    if (artists[artist] > maxTime) {
      maxTime = artists[artist];
      mostPlayedArtist = artist;
    }
  }
  return mostPlayedArtist;
}

//get most played song on Friday night by number of listens
export function getMostPlayedSongFridayByListens(user) {
  let fridayListens = {};
  let mostPlayedSong = null;
  let maxListens = 0;
  const events = getListenEvents(user);
  events.forEach((e) => {
    const date = new Date(e.timestamp);
    const daysOfWeek = date.getDay();
    if (daysOfWeek === 5) {
      fridayListens[e.song_id] = (fridayListens[e.song_id] || 0) + 1;
      if (fridayListens[e.song_id] > maxListens) {
        maxListens = fridayListens[e.song_id];
        mostPlayedSong = e.song_id;
      }
    }
  });
  return mostPlayedSong;
}

//get most played song on Friday night by listening time
export function getMostPlayedSongFridayByTime(user) {
  const events = getListenEvents(user);
  let fridayListens = {};
  let mostPlayedSong = null;
  let maxTime = 0;
  let totalTime = 0;
  events.forEach((e) => {
    const date = new Date(e.timestamp);
    const daysOfWeek = date.getDay();
    if (daysOfWeek === 5) {
      fridayListens[e.song_id] = (fridayListens[e.song_id] || 0) + 1;
      totalTime =
        fridayListens[e.song_id] * getSong(e.song_id).duration_seconds;
      if (totalTime > maxTime) {
        maxTime = totalTime;
        mostPlayedSong = e.song_id;
      }
    }
  });
  return mostPlayedSong;
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
    return ["No song played in a row", 0];
  }
  const result = Object.entries(songsInRow).sort((a, b) => b[1] - a[1]);
  return result[0];
}
