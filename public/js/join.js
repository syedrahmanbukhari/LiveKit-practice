// Join page functionality

const joinForm = document.getElementById('joinForm');
const joinBtn = document.getElementById('joinBtn');
const notification = document.getElementById('notification');
const roomInfo = document.getElementById('roomInfo');

// Get room ID from URL
const pathParts = window.location.pathname.split('/');
const roomId = pathParts[pathParts.length - 1];

// Show notification
function showNotification(message, duration = 3000) {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Show error
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

// Clear errors
function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.style.display = 'none';
  });
}

// Load room details
async function loadRoomDetails() {
  try {
    const response = await fetch(`/api/room/${roomId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Room not found');
    }

    roomInfo.textContent = `You're joining: ${data.room.name}`;
    
  } catch (error) {
    console.error('Error:', error);
    roomInfo.textContent = 'Room not found or expired';
    roomInfo.style.color = '#ea4335';
    joinBtn.disabled = true;
  }
}

// Join room
joinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const userName = document.getElementById('userName').value.trim();

  if (!userName || userName.length < 2) {
    showError('userNameError', 'Name must be at least 2 characters');
    return;
  }

  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validPattern.test(userName)) {
    showError('userNameError', 'Only letters, numbers, spaces, - and _ allowed');
    return;
  }

  try {
    joinBtn.textContent = 'Joining...';
    joinBtn.disabled = true;

    const response = await fetch('/api/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to join room');
    }

    // Store token in sessionStorage
    sessionStorage.setItem('meetingToken', data.token);
    sessionStorage.setItem('roomId', data.room.id);
    sessionStorage.setItem('roomName', data.room.name);
    sessionStorage.setItem('userName', userName);

    // Redirect to meeting room
    window.location.href = `/room/${roomId}`;

  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to join meeting: ' + error.message);
    joinBtn.textContent = 'Join Meeting';
    joinBtn.disabled = false;
  }
});

// Load room details on page load
loadRoomDetails();
