// Room Model - In-memory storage (production mein database use karo)
class RoomModel {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomData) {
    const room = {
      id: roomData.id,
      name: roomData.name,
      hostName: roomData.hostName,
      createdAt: new Date(),
      participants: [],
      isActive: true
    };
    
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addParticipant(roomId, participantName) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.push({
        name: participantName,
        joinedAt: new Date()
      });
    }
    return room;
  }

  removeParticipant(roomId, participantName) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(p => p.name !== participantName);
    }
    return room;
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

module.exports = new RoomModel();
