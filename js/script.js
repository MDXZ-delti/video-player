'use strict'



// VIDEO SELECTION
// ---------------

// DRAG AND DROP
const dragPanel = document.querySelector('#drag-panel')
const dropOverlay = document.querySelector('#drop-overlay')
const droppableElements = document.querySelectorAll('.droppable')
const fileName = document.querySelector('#file-name')
const video = document.querySelector('video')
var localStorageKey

droppableElements.forEach(droppable => {
	droppable.addEventListener('dragenter', function (e) {
		if (e.dataTransfer.items[0].type.startsWith('video/')) {
			this.dataset.fileHover = true
			dropOverlay.hidden = false
		}
	})
})

dropOverlay.addEventListener('dragover', function (e) {
	e.preventDefault()
})

dropOverlay.addEventListener('drop', async (e) => {
	e.preventDefault()

	// The type check is done in dragenter and in manageFileHandle
	const fileHandle = await e.dataTransfer.items[0].getAsFileSystemHandle()

	manageFileHandle(fileHandle)
	handleDragEnd()
})

dropOverlay.addEventListener('dragleave', handleDragEnd)

function handleDragEnd() {
	dropOverlay.hidden = true
	droppableElements.forEach(droppable => {
		delete droppable.dataset.fileHover
	})
}


// FILE INPUT
const filePicker = document.querySelector('#file-picker')
filePicker.addEventListener('click', async () => {
	try {
		const [fileHandle] = await window.showOpenFilePicker({
			excludeAcceptAllOption: true,
			types: [
				{
					description: 'Videos',
					accept: {
						'video/*': ['.avi', '.mp4', '.mpeg', '.ogv', '.ts', '.webm', '.3gp', '.3g2']
					}
				}
			],
			multiple: false
		})

		manageFileHandle(fileHandle)
	} catch (abortError) { }
})

async function manageFileHandle(fileHandle) {
	const file = await fileHandle.getFile()

	if (!file.type.startsWith('video/'))
		return

	if (video.src) {
		localStorage.setItem(localStorageKey, video.currentTime)
		URL.revokeObjectURL(video.src)
	} else { // Show the player
		dragPanel.hidden = true
		player.hidden = false
	}

	video.src = URL.createObjectURL(file)

	// Remove the file extension
	fileName.textContent = file.name.replace(/\.[^.]+$/, '')
	localStorageKey = `Timer for ${file.name}`
}



// CONTROL PLAYBACK
// ----------------

// NAVIGATION
const player = document.querySelector('.player')
const playBtn = document.querySelector('.play-btn')
const fullscreenBtn = document.querySelector('.fullscreen-btn')
const zoomBtn = document.querySelector('.zoom-btn')
const speedControls = document.querySelector('#speed-controls')

// Play/pause
playBtn.onclick = togglePlay
video.onclick = togglePlay
video.onpause = () => { playBtn.textContent = 'play_arrow' }
video.onplay = () => { playBtn.textContent = 'pause' }

// Fullscreen
fullscreenBtn.onclick = toggleFullScreen
document.onfullscreenchange = function () {
	fullscreenBtn.textContent = (document.fullscreenElement) ?
		'fullscreen_exit' :
		'fullscreen'
}

video.addEventListener('dblclick', toggleFullScreen)

// Speed
video.onratechange = function () {
	speedControls.value = this.playbackRate
}

speedControls.onchange = function () {
	video.playbackRate = clamp(0.1, this.value, 16)
}

// Zoom
zoomBtn.onclick = toggleZoom


// TIME
const videoBar = document.querySelector('#video-bar')
const timeIndicator = document.querySelector('#time-indicator')
const currentTime = document.querySelector('.current-time')
const timeRemaining = document.querySelector('.time-remaining')
const replayBtn = document.querySelector('.replay-btn')
const forwardBtn = document.querySelector('.forward-btn')
const duration = document.querySelector('.duration')
var metadataAvailable = true // Used to prevent the time indicator from updating when the metadata is not loaded

video.addEventListener('loadedmetadata', function () {
	metadataAvailable = true

	// Restore video position from local storage
	this.currentTime = localStorage.getItem(localStorageKey)

	timeRemaining.textContent = `-${secondsToTime(this.duration - this.currentTime)}`
	duration.textContent = secondsToTime(this.duration)

	videoBar.setAttribute('max', this.duration)
})

video.addEventListener('emptied', function () {
	metadataAvailable = false
})

video.addEventListener('timeupdate', function () {
	if (!metadataAvailable)
		return

	// Update video bar position
	videoBar.value = this.currentTime
	videoBar.style.setProperty("--progress", (videoBar.valueAsNumber * 100 / video.duration) + "%")

	// Update time indicator
	updateTimeIndicator()
})

// Seek to the point clicked on the progress bar
videoBar.addEventListener('input', function () {
	videoBar.style.setProperty("--progress", (this.valueAsNumber * 100 / video.duration) + "%")

	video.currentTime = this.value

	// Needed to show live the time when the progress bar is dragged
	updateTimeIndicator()
})

function updateTimeIndicator() {
	currentTime.textContent = secondsToTime(video.currentTime)
	timeRemaining.textContent = `-${secondsToTime(video.duration - video.currentTime)}`
}

// videoBar also has tabindex="-1"
videoBar.onfocus = function () { this.blur() }

replayBtn.onclick = replay
forwardBtn.onclick = forward

// Toggle current time/remaining time
timeIndicator.addEventListener('click', function () {
	[timeRemaining.hidden, currentTime.hidden] = [currentTime.hidden, timeRemaining.hidden]
})

// Save time in local storage when the window is closed
window.onbeforeunload = () => {
	localStorage.setItem(localStorageKey, video.currentTime)
}

// Delete video position from local storage
video.onended = () => {
	localStorage.removeItem(localStorageKey)
}


// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
	var modifier = e.shiftKey
	if (modifier) {
		replayBtn.textContent = 'replay_30'
		forwardBtn.textContent = 'forward_30'
	}

	switch (e.key) {
		case ' ': // Toggle play
			if (document.activeElement.tagName == 'BUTTON')
				break
		case 'k':
			togglePlay()
			break
		case 's': // Slow down
		case 'S':
			addToSpeed(modifier ? -1 : -0.1)
			break
		case 'd': // Speed up
		case 'D':
			addToSpeed(modifier ? 1 : 0.1)
			break
		case 'z': // Rewind
		case 'Z':
		case 'ArrowLeft':
		case 'ArrowDown':
			if (document.activeElement.tagName !== 'INPUT')
				replay(modifier)
			break
		case 'x': // Advance
		case 'X':
		case 'ArrowRight':
		case 'ArrowUp':
			if (document.activeElement.tagName !== 'INPUT')
				forward(modifier)
			break
		case 'r': // Reset speed
			video.playbackRate = video.defaultPlaybackRate
			break
		case 't': // Toggle time indicator
			toggleTimeIndicator()
			break
		case 'a': // Preferred speed
			video.playbackRate = 2
			break
		case 'm': // Toggle mute
			toggleMute()
			break
		case 'c': // Toggle zoom
			toggleZoom()
			break
		case 'p': // Toggle PiP
			togglePictureInPicture()
			break
		case 'f':
		case 'Enter':
			if (document.activeElement.tagName !== 'BUTTON' && document.activeElement.tagName !== 'INPUT')
				toggleFullScreen()
	}
})

document.addEventListener('keyup', (e) => {
	var modifier = e.shiftKey
	if (!modifier) {
		replayBtn.textContent = 'replay_10'
		forwardBtn.textContent = 'forward_10'
	}
})

function togglePlay() {
	video.paused ? video.play() : video.pause()
}

function toggleMute() {
	video.muted = !video.muted
}

function clamp(min, value, max) {
	return Math.min(Math.max(value, min), max)
}

function addToSpeed(delta) {
	// Clamp speed between 0.1 and 16 (Chrome range is [0.0625, 16])
	video.playbackRate = clamp(0.1, (video.playbackRate + delta).toFixed(2), 16)
}

function replay(modifier) {
	video.currentTime -= modifier ? 30 : 10
}

function forward(modifier) {
	video.currentTime += modifier ? 30 : 10
}

function togglePictureInPicture() {
	(document.pictureInPictureElement) ?
		document.exitPictureInPicture() :
		video.requestPictureInPicture()
}

function toggleFullScreen() {
	(document.fullscreenElement) ?
		document.exitFullscreen() :
		player.requestFullscreen()
}

function toggleZoom() {
	if (zoomBtn.textContent === 'zoom_out_map') {
		video.style.objectFit = 'cover'
		zoomBtn.textContent = 'crop_free'
	} else {
		video.style.objectFit = 'contain'
		zoomBtn.textContent = 'zoom_out_map'
	}
}

function toggleTimeIndicator() {
	[currentTime.hidden, timeRemaining.hidden] = [timeRemaining.hidden, currentTime.hidden]
}

// Convert seconds to time in format (h:)mm:ss
// Use https://tc39.es/proposal-temporal/docs/duration.html when available
function secondsToTime(seconds) {
	return new Date(seconds * 1000).toISOString().substring((seconds >= 3600) ? 12 : 14, 19)
}
