import playList from './playList.js';

const playBtn = document.querySelector('.play');
const playPrevBtn = document.querySelector('.play-prev');
const playNextBtn = document.querySelector('.play-next');

const progressRange = document.querySelector('#progressRange');
const timerElement = document.querySelector('.timer');
const durationElement = document.querySelector('.duration');

const volumeBtn = document.querySelector('.volume-icon');
const soundVolumeRange = document.querySelector('#soundVoulume');

const playListContainer = document.querySelector('.play-list');

const audio = new Audio();
audio.volume = 0.6;
setVolume();
let isPlay = false;
let playNum = 0;
let isMuted = false;

playList.forEach(el => {
  const li = document.createElement('li');
  li.classList.add('play-item');
  li.textContent = el.title;
  playListContainer.append(li);
});

function setActiveItemStyle() {
  const activeLi = playListContainer.querySelector(`li:nth-child(${playNum + 1})`);
  activeLi.classList.add('item-active');
}

function removeActiveItemStyle() {
  const activeLi = playListContainer.querySelector(`li:nth-child(${playNum + 1})`);
  activeLi.classList.remove('item-active');
}

function toggleBtn() {
  playBtn.classList.toggle('pause');
  if (!playBtn.classList.contains('pause'))
    removeActiveItemStyle();
}

function formatTime(secs) {
  let minutes = Math.floor(secs / 60) || 0;
  let seconds = Math.floor(secs - minutes * 60) || 0;

  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateProgress() {
  const currentTime = audio.currentTime || 0;
  const trackDuration = audio.duration;
  const percentageProgress = (((currentTime * 100) / trackDuration) || 0);

  timerElement.textContent = formatTime(currentTime);
  progressRange.style.background = `linear-gradient(to right ,#fff 0%, #fff ${percentageProgress}%, rgba(255, 255, 255, .6) ${percentageProgress}%, rgba(255, 255, 255, .6) 100%)`;
  progressRange.value = percentageProgress;
}

function setVolume() {
  soundVolumeRange.style.background = `linear-gradient(to right ,#fff 0%, #fff ${audio.volume * 100}%, rgba(255, 255, 255, .6) ${audio.volume * 100}%, rgba(255, 255, 255, .6) 100%)`;
  soundVolumeRange.value = audio.volume;
}

function updateVolume() {
  audio.volume = soundVolumeRange.value;
  setVolume();
}

function preLoad() {
  if (!isPlay) {
    if (audio.src) {
      playAudio();
    } else {
      loadAudio();
    }
  } else {
    pauseAudio();
  }
}

function loadAudio() {
  const track = playList[playNum];
  audio.src = track.src;
  audio.onloadedmetadata = () => {
    playAudio();
    progressRange.setAttribute('data-content', track.title);
    durationElement.textContent = formatTime(audio.duration);
  }
}

function playAudio() {
  audio.play();
  isPlay = true;

  setActiveItemStyle();
  updateProgress();
}

function pauseAudio() {
  audio.pause();
  isPlay = false;
}

function playPrevAudio() {
  removeActiveItemStyle();
  playNum = playNum > 0 ? playNum -= 1 : playList.length - 1;
  loadAudio();
  playBtn.classList.add('pause');
}

function playNextAudio() {
  removeActiveItemStyle();
  playNum = playNum < playList.length - 1 ? playNum += 1 : 0;
  loadAudio();
  playBtn.classList.add('pause');
}

playBtn.addEventListener('click', preLoad);

playBtn.addEventListener('click', toggleBtn);

playPrevBtn.addEventListener('click', playPrevAudio);
playNextBtn.addEventListener('click', playNextAudio);

audio.addEventListener('ended', playNextAudio);
audio.addEventListener('timeupdate', updateProgress);

progressRange.addEventListener('input', function() {
  if (!audio.currentTime) return;
  audio.currentTime = (this.value * audio.duration) / 100;
  updateProgress();
});

function toggleVolume() {
  volumeBtn.classList.toggle('mute');
  if (isMuted) {
    audio.muted = false;
    isMuted = false;
  } else {
    audio.muted = true;
    isMuted = true;
  }
}

volumeBtn.addEventListener('click', toggleVolume);

soundVolumeRange.addEventListener('input', updateVolume);

playListContainer.addEventListener('click', function(event) {
  const target = event.target;
  if (target.nodeName === 'LI') {
    const nodeOrder = Array.from(target.parentNode.children).indexOf(target);
    if (playNum === nodeOrder) {
      preLoad();
      toggleBtn();
    } else {
      removeActiveItemStyle();
      playNum = nodeOrder;
      loadAudio();
      playBtn.classList.add('pause');
    }
  }
})
