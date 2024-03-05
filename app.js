
const tunesURL = "http://localhost:3000/";
let isRecording = false;
let recordedNotes = [];

const synth = new Tone.Synth().toDestination();
document.addEventListener('DOMContentLoaded', async () => {
  allSongs = await getSongs(tunesURL);
  addSong(allSongs);
});

const dict = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
  'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
  'u': 'Bb4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
  'p': 'D#5', ';': 'E5'
};

document.addEventListener("keydown", (event) => {
  if (dict[event.key]) {
    playNoteAndRecord(dict[event.key], "8n");
  }
});

function playNoteAndRecord(note, duration) {
  synth.triggerAttackRelease(note, duration);
  if (isRecording) {
    const time = Tone.now();
    recordedNotes.push({ note, duration, time });
  }
}

async function getSongs(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function addSong(songsArray) {
  const dropdown = document.getElementById("tunesDrop");
  songsArray.forEach((song) => {
    const option = document.createElement("option");
    option.value = song.id;
    option.textContent = song.name;
    dropdown.appendChild(option);
  });
}

function getSelectedSongNotes(selectedSongId, songsArray) {
  const song = songsArray.find((song) => song.id === selectedSongId);
  return song ? song.tune : [];
}

function playSelectedSong(songNotesArray) {
  Tone.Transport.cancel();
  const now = Tone.now();
  songNotesArray.forEach((noteObj) => {
    synth.triggerAttackRelease(noteObj.note, noteObj.duration, now + noteObj.timing);
  });
}

const playButton = document.getElementById("tunebtn");
playButton.addEventListener("click", () => {
  const selectedSongId = document.getElementById("tunesDrop").value;
  const selectedSongNotes = getSelectedSongNotes(selectedSongId, allSongs);
  playSelectedSong(selectedSongNotes);
});

document.getElementById("recordbtn").addEventListener("click", () => {
  isRecording = true;
  recordedNotes = []; // Reset the recorded notes array
});

document.getElementById("stopbtn").addEventListener("click", async () => {
  isRecording = false;

  await axios.post(tunesURL, { tune: recordedNotes });
});
