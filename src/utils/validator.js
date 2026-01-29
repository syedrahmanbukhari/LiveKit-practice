class Validator {
  validateRoomName(roomName) {
    const errors = [];
    
    if (!roomName || roomName.trim().length === 0) {
      errors.push('Room name is required');
    }
    
    if (roomName && (roomName.length < 2 || roomName.length > 50)) {
      errors.push('Room name must be between 2 and 50 characters');
    }
    
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (roomName && !validPattern.test(roomName)) {
      errors.push('Room name contains invalid characters');
    }
    
    return errors;
  }

  validateUserName(userName) {
    const errors = [];
    
    if (!userName || userName.trim().length === 0) {
      errors.push('User name is required');
    }
    
    if (userName && (userName.length < 2 || userName.length > 50)) {
      errors.push('User name must be between 2 and 50 characters');
    }
    
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (userName && !validPattern.test(userName)) {
      errors.push('User name contains invalid characters');
    }
    
    return errors;
  }

  validateInput(roomName, userName) {
    const roomErrors = this.validateRoomName(roomName);
    const userErrors = this.validateUserName(userName);
    return [...roomErrors, ...userErrors];
  }
}

module.exports = new Validator();
