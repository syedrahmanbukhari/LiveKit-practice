// Home page - Create Room functionality

const createRoomForm = document.getElementById('createRoomForm');
const createBtn = document.getElementById('createBtn');
const roomModal = document.getElementById('roomModal');
const notification = document.getElementById('notification');

let createdRoomData = null;

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

// Validate inputs
function validateInputs(roomName, hostName) {
  clearErrors();
  let isValid = true;

  if (!roomName || roomName.trim().length < 2) {
    showError('roomNameError', 'Meeting name must be at least 2 characters');
    isValid = false;
  }

  if (!hostName || hostName.trim().length < 2) {
    showError('hostNameError', 'Name must be at least 2 characters');
    isValid = false;
  }

  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (roomName && !validPattern.test(roomName)) {
    showError('roomNameError', 'Only letters, numbers, spaces, - and _ allowed');
    isValid = false;
  }

  if (hostName && !validPattern.test(hostName)) {
    showError('hostNameError', 'Only letters, numbers, spaces, - and _ allowed');
    isValid = false;
  }

  return isValid;
}

// Create room
createRoomForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const roomName = document.getElementById('roomName').value.trim();
  const hostName = document.getElementById('hostName').value.trim();

  if (!validateInputs(roomName, hostName)) {
    return;
  }

  try {
    createBtn.textContent = 'Creating...';
    createBtn.disabled = true;

    const response = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, hostName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create room');
    }

    // Store room data
    createdRoomData = data;

    // Show modal with room details
    document.getElementById('modalRoomName').textContent = data.room.name;
    document.getElementById('modalRoomId').textContent = data.room.id;
    document.getElementById('joinLink').value = data.joinLink;
    
    roomModal.classList.add('show');

  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to create meeting: ' + error.message);
  } finally {
    createBtn.textContent = 'Create Meeting';
    createBtn.disabled = false;
  }
});

// Copy link
document.getElementById('copyBtn').addEventListener('click', () => {
  const linkInput = document.getElementById('joinLink');
  linkInput.select();
  document.execCommand('copy');
  showNotification('Link copied to clipboard!');
});

// Start meeting
document.getElementById('startMeetingBtn').addEventListener('click', () => {
  if (createdRoomData) {
    // Store token in sessionStorage
    sessionStorage.setItem('meetingToken', createdRoomData.token);
    sessionStorage.setItem('roomId', createdRoomData.room.id);
    sessionStorage.setItem('roomName', createdRoomData.room.name);
    sessionStorage.setItem('userName', createdRoomData.room.hostName);
    
    // Redirect to meeting room
    window.location.href = `/room/${createdRoomData.room.id}`;
  }
});

// Close modal
document.getElementById('closeModalBtn').addEventListener('click', () => {
  roomModal.classList.remove('show');
  createRoomForm.reset();
});
