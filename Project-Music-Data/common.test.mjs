import assert from "node:assert";
import test from "node:test";
import { checkEveryDaySongs,getMostPlayed,getSongInARow,getMostGenresByListens } from "./common.mjs";

const songs = {
  "song-1": {
    title: "Short Song",
    artist: "ArtistA",
    duration_seconds: 60,
    genre: "Pop",
  },
  "song-2": {
    title: "Long Song",
    artist: "ArtistB",
    duration_seconds: 300,
    genre: "Rock",
  },
  "song-3": {
    title: "Jazz Hit",
    artist: "ArtistC",
    duration_seconds: 200,
    genre: "Jazz",
  },
  "song-4": {
    title: "Extra Pop",
    artist: "ArtistD",
    duration_seconds: 180,
    genre: "Pop",
  },
};

const events = {
  user1: [
    { song_id: "song-1", timestamp: "2024-08-01T10:00:00" },
    { song_id: "song-1", timestamp: "2024-08-01T10:05:00" },
    { song_id: "song-1", timestamp: "2024-08-01T10:10:00" },

    { song_id: "song-2", timestamp: "2024-08-01T12:00:00" },
    { song_id: "song-2", timestamp: "2024-08-01T13:00:00" },

    { song_id: "song-3", timestamp: "2024-08-02T18:00:00" },
    { song_id: "song-3", timestamp: "2024-08-02T19:00:00" },

    { song_id: "song-2", timestamp: "2024-08-02T20:00:00" },

    { song_id: "song-4", timestamp: "2024-08-03T10:00:00" },
  ],
  user2: [],
};

function getSong(id) {
  return songs[id];
}
function getListenEvents(user) {
  return events[user] || [];
}

function getSongInARowTest(user) {
  const events = getListenEvents(user);
  let songsInRow = {};
  for (let i = 1; i < events.length; i++) {
    if (events[i].song_id === events[i - 1].song_id) {
      const title = getSong(events[i].song_id).title;
      songsInRow[title] = (songsInRow[title] || 1) + 1;
    }
  }
  if (Object.keys(songsInRow).length === 0) {
    return null;
  }
  return Object.entries(songsInRow).sort((a, b) => b[1] - a[1])[0];
}

function getMostGenresByListensTest(user) {
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

function checkEveryDaySongsTest(user) {
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
  return Object.keys(result).filter((song) => result[song]);
}

function getMostPlayedTest(user) {
  const events = getListenEvents(user);
  const listens = {};
  const artists = {};
  const mostPlayed = {};
  let maxTime = 0;
  let fridayListens = {};
  let fridayMaxTime = 0;
  let fridayMaxListens = 0;

  events.forEach((e) => {
    const song = getSong(e.song_id);
    const songTitle = song.title;
    const songArtist = song.artist;

    listens[songTitle] = (listens[songTitle] || 0) + 1;
    artists[songArtist] = (artists[songArtist] || 0) + 1;

    const totalTime = listens[songTitle] * song.duration_seconds;
    if (totalTime > maxTime) {
      maxTime = totalTime;
      mostPlayed.mostPlayedSongsByTime = songTitle;
      mostPlayed.mostPlayedArtistByTime = songArtist;
    }
    
    // Friday night
    const date = new Date(e.timestamp);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    if ((dayOfWeek === 5 && hour >= 17 && hour < 24) ||(dayOfWeek === 6 && hour >= 0 && hour < 4)) {
      fridayListens[songTitle] = (fridayListens[songTitle] || 0) + 1;

      if (fridayListens[songTitle] > fridayMaxListens) {
        fridayMaxListens = fridayListens[songTitle];
        mostPlayed.mostPlayedSongFridayByListens = songTitle;
      }

      const fridayTotalTime = fridayListens[songTitle] * song.duration_seconds;
      if (fridayTotalTime > fridayMaxTime) {
        fridayMaxTime = fridayTotalTime;
        mostPlayed.mostPlayedSongFridayByTime = songTitle;
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

  const maxSongListens = Math.max(...Object.values(listens));
  mostPlayed.mostPlayedSongsByListens = Object.keys(listens).filter(
    (song) => listens[song] === maxSongListens,
  );

  const maxArtistListens = Math.max(...Object.values(artists));
  mostPlayed.mostPlayedArtistByListens = Object.keys(artists).filter(
    (artist) => artists[artist] === maxArtistListens,
  );

  return mostPlayed;
}

// getSongInARow
test("song played most times in a row for user1", () => {
  assert.deepEqual(getSongInARowTest("user1"), ["Short Song", 3]);
});
test("song played most times in a row for user2 (no events)", () => {
  assert.equal(getSongInARowTest("user2"), null);
});

// getMostGenresByListens
test("top 3 genres for user1", () => {
  assert.deepEqual(getMostGenresByListensTest("user1"), [
    "Pop",
    "Rock",
    "Jazz",
  ]);
});
test("top 3 genres for user2 (no events)", () => {
  assert.deepEqual(getMostGenresByListensTest("user2"), []);
});

// checkEveryDaySongs
test("songs played every day for user1", () => {
  assert.deepEqual(checkEveryDaySongsTest("user1"), []);
});
test("songs played every day for user2", () => {
  assert.deepEqual(checkEveryDaySongsTest("user2"), []);
});

// getMostPlayed
test("most played song by listens", () => {
  const result = getMostPlayedTest("user1");
  assert.deepEqual(result.mostPlayedSongsByListens.sort(), [
    "Long Song",
    "Short Song",
  ]);
});

test("most played song by listening time", () => {
  const result = getMostPlayedTest("user1");
  assert.equal(result.mostPlayedSongsByTime, "Long Song");
});

test("most played artist by listens", () => {
  const result = getMostPlayedTest("user1");
  assert.deepEqual(result.mostPlayedArtistByListens.sort(), [
    "ArtistA",
    "ArtistB",
  ]);
});

test("most played artist by listening time", () => {
  const result = getMostPlayedTest("user1");
  assert.equal(result.mostPlayedArtistByTime, "ArtistB");
});

test("most played Friday night song by listens", () => {
  const result = getMostPlayedTest("user1");
  assert.equal(result.mostPlayedSongFridayByListens, "Jazz Hit");
});

test("most played Friday night song by time", () => {
  const result = getMostPlayedTest("user1");
  assert.equal(result.mostPlayedSongFridayByTime, "Jazz Hit");
});

test("most played song/artist for user2 (no events)", () => {
  const result = getMostPlayedTest("user2");
  assert.equal(result.mostPlayedSongsByListens, null);
  assert.equal(result.mostPlayedArtistByListens, null);
  assert.equal(result.mostPlayedSongsByTime, null);
  assert.equal(result.mostPlayedArtistByTime, null);
  assert.equal(result.mostPlayedSongFridayByListens, null);
  assert.equal(result.mostPlayedSongFridayByTime, null);
});
