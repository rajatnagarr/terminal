const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io on the server
const io = socketIO(server);

// Serve static files from 'public' directory
app.use(express.static('public'));

// Store connected agent socket
let agentSocket = null;

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Handle identification from clients and agent
  socket.on('identify', (role) => {
    if (role === 'agent') {
      agentSocket = socket;
      console.log('Agent connected:', socket.id);
    }
  });

  // Handle input from frontend terminal
  socket.on('input', (data) => {
    if (agentSocket) {
      agentSocket.emit('execute', data);
    } else {
      socket.emit('output', 'Agent not connected.\r\n');
    }
  });

  // Handle output from agent
  socket.on('output', (data) => {
    // Send output to all connected clients
    io.emit('output', data);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket === agentSocket) {
      agentSocket = null;
      console.log('Agent disconnected.');
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
