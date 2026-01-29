// Meeting room functionality
import { Room, RoomEvent, ConnectionState } from 'https://unpkg.com/livekit-client@2.5.8/dist/livekit-client.esm.mjs';

const LIVEKIT_URL = 'wss://practice-am64s12w.livekit.cloud';

let room = null;
let isMicOn = true;
let isVideoOn = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Elements
const videoContainer = document.getElementById('videoContainer');
const roomTitle = document.getElementById('roomTitle');
const participantCount = document.getElementById('participantCount');
const micBtn = document.getElementById('micBtn');
const videoBtn = document.getElementById('videoBtn');
const leaveBtn = document.getElementById('leaveBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const notification = document.getElementById('notification');

// Get meeting data from sessionStorage
const token = sessionStorage.getItem('meetingToken');
const roomId = sessionStorage.getItem('roomId');
const roomName = sessionStorage.getItem('roomName');
const userName = sessionStorage.getItem('userName');

// Show notification
function showNotification(message, duration = 3000) {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Check if we have required data
if (!token || !roomId) {
  showNotification('Invalid meeting session. Redirecting...');
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
} else {
  // Join meeting automatically
  joinMeeting();
}

async function joinMeeting() {
  try {
    roomTitle.textContent = roomName || 'Meeting Room';

    // Connect to room
    room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 }
      }
    });

    setupRoomEvents();

    await room.connect(LIVEKIT_URL, token);

    // Enable camera and mic
    try {
      await room.localParticipant.enableCameraAndMicrophone();
    } catch (error) {
      console.error('Camera/Mic error:', error);
      showNotification('Could not access camera/microphone. Please check permissions.');
    }

    // Add local video
    setTimeout(() => {
      addLocalVideo();
      updateParticipantCount();
    }, 500);

    // Add existing participants
    if (room.remoteParticipants && room.remoteParticipants.size > 0) {
      room.remoteParticipants.forEach(participant => {
        addVideoTile(participant);
      });
    }

    reconnectAttempts = 0;

  } catch (error) {
    console.error('Error joining meeting:', error);
    showNotification('Failed to join meeting: ' + error.message);
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }
}

function addLocalVideo() {
  const participant = room.localParticipant;
  
  const existingTile = document.getElementById(`tile-${participant.identity}`);
  if (existingTile) existingTile.remove();

  const tile = document.createElement('div');
  tile.className = 'video-tile';
  tile.id = `tile-${participant.identity}`;

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Loading video...';

  const name = document.createElement('div');
  name.className = 'participant-name';
  name.textContent = `${participant.identity} (You)`;

  const micStatus = document.createElement('div');
  micStatus.className = 'mic-status';
  micStatus.textContent = '🎤';
  micStatus.id = `mic-${participant.identity}`;

  tile.appendChild(loading);
  tile.appendChild(name);
  tile.appendChild(micStatus);
  videoContainer.appendChild(tile);

  if (participant.videoTrackPublications && participant.videoTrackPublications.size > 0) {
    participant.videoTrackPublications.forEach(publication => {
      if (publication.track) {
        attachVideoTrack(tile, publication.track, true);
      }
    });
  }

  participant.on('trackPublished', (publication) => {
    if (publication.kind === 'video' && publication.track) {
      const existingVideo = tile.querySelector('video');
      if (!existingVideo) {
        attachVideoTrack(tile, publication.track, true);
      }
    }
  });
}

function attachVideoTrack(tile, track, isLocal = false) {
  const loading = tile.querySelector('.loading');
  if (loading) loading.remove();

  const videoEl = track.attach();
  if (isLocal) {
    videoEl.style.transform = 'scaleX(-1)';
  }
  videoEl.style.width = '100%';
  videoEl.style.height = '100%';
  videoEl.style.objectFit = 'cover';
  
  const name = tile.querySelector('.participant-name');
  tile.insertBefore(videoEl, name);
}

function addVideoTile(participant) {
  const existingTile = document.getElementById(`tile-${participant.identity}`);
  if (existingTile) return;

  const tile = document.createElement('div');
  tile.className = 'video-tile';
  tile.id = `tile-${participant.identity}`;

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Waiting for video...';

  const name = document.createElement('div');
  name.className = 'participant-name';
  name.textContent = participant.identity;

  const micStatus = document.createElement('div');
  micStatus.className = 'mic-status';
  micStatus.textContent = '🎤';
  micStatus.id = `mic-${participant.identity}`;

  tile.appendChild(loading);
  tile.appendChild(name);
  tile.appendChild(micStatus);
  videoContainer.appendChild(tile);
}

function removeVideoTile(participant) {
  const tile = document.getElementById(`tile-${participant.identity}`);
  if (tile) tile.remove();
}

function setupRoomEvents() {
  room.on(RoomEvent.ConnectionStateChanged, (state) => {
    if (state === ConnectionState.Connected) {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Connected';
      reconnectAttempts = 0;
    } else if (state === ConnectionState.Reconnecting) {
      statusDot.className = 'status-dot reconnecting';
      statusText.textContent = 'Reconnecting...';
      showNotification('Connection lost. Reconnecting...');
    } else if (state === ConnectionState.Disconnected) {
      statusDot.className = 'status-dot';
      statusDot.style.background = '#ea4335';
      statusText.textContent = 'Disconnected';
    }
  });

  room.on(RoomEvent.Reconnecting, () => {
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      showNotification('Unable to reconnect. Please refresh the page.');
      setTimeout(() => {
        handleLeave();
      }, 3000);
    }
  });

  room.on(RoomEvent.Reconnected, () => {
    showNotification('Reconnected successfully!');
    reconnectAttempts = 0;
  });

  room.on(RoomEvent.ParticipantConnected, (participant) => {
    addVideoTile(participant);
    updateParticipantCount();
    showNotification(`${participant.identity} joined`);
  });

  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    removeVideoTile(participant);
    updateParticipantCount();
    showNotification(`${participant.identity} left`);
  });

  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    const tile = document.getElementById(`tile-${participant.identity}`);
    if (!tile) {
      addVideoTile(participant);
      return;
    }

    if (track.kind === 'video') {
      const existingVideo = tile.querySelector('video');
      if (existingVideo) existingVideo.remove();
      attachVideoTrack(tile, track, false);
    } else if (track.kind === 'audio') {
      track.attach();
    }
  });

  room.on(RoomEvent.TrackUnsubscribed, (track) => {
    track.detach();
  });

  room.on(RoomEvent.TrackMuted, (publication, participant) => {
    if (publication.kind === 'audio') {
      const micStatus = document.getElementById(`mic-${participant.identity}`);
      if (micStatus) micStatus.textContent = '🔇';
    }
  });

  room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
    if (publication.kind === 'audio') {
      const micStatus = document.getElementById(`mic-${participant.identity}`);
      if (micStatus) micStatus.textContent = '🎤';
    }
  });

  room.on(RoomEvent.Disconnected, (reason) => {
    if (reason) {
      showNotification('Disconnected: ' + reason);
    }
  });
}

function updateParticipantCount() {
  if (!room || !room.remoteParticipants) {
    participantCount.textContent = '1 participant';
    return;
  }
  const count = room.remoteParticipants.size + 1;
  participantCount.textContent = `${count} participant${count > 1 ? 's' : ''}`;
}

// Toggle Microphone
micBtn.onclick = async () => {
  try {
    isMicOn = !isMicOn;
    await room.localParticipant.setMicrophoneEnabled(isMicOn);
    micBtn.classList.toggle('muted', !isMicOn);
    micBtn.textContent = isMicOn ? '🎤' : '🔇';
  } catch (error) {
    console.error('Mic toggle error:', error);
    showNotification('Failed to toggle microphone');
  }
};

// Toggle Video
videoBtn.onclick = async () => {
  try {
    isVideoOn = !isVideoOn;
    await room.localParticipant.setCameraEnabled(isVideoOn);
    videoBtn.classList.toggle('off', !isVideoOn);
    videoBtn.textContent = isVideoOn ? '📹' : '📷';
  } catch (error) {
    console.error('Video toggle error:', error);
    showNotification('Failed to toggle camera');
  }
};

// Leave Meeting
leaveBtn.onclick = handleLeave;

async function handleLeave() {
  if (room) {
    await room.disconnect();
    room = null;
  }
  
  // Clear session storage
  sessionStorage.removeItem('meetingToken');
  sessionStorage.removeItem('roomId');
  sessionStorage.removeItem('roomName');
  sessionStorage.removeItem('userName');
  
  // Redirect to home
  window.location.href = '/';
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (room) {
    room.disconnect();
  }
});
