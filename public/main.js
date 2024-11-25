// Initialize Socket.io client
const socket = io();

// Initialize xterm.js terminal
const terminalContainer = document.getElementById('terminal-container');
const term = new Terminal();
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer);
fitAddon.fit();

// Identify as client (optional for future authentication)
socket.emit('identify', 'client');

// Initialize input buffer
let commandBuffer = '';

// Handle terminal input
term.onData((data) => {
  switch (data) {
    case '\r': // Enter key
      term.write('\r\n'); // Move to next line
      socket.emit('input', commandBuffer);
      commandBuffer = '';
      break;
    case '\u0003': // Ctrl+C
      term.write('^C');
      commandBuffer = '';
      term.write('\r\n');
      break;
    case '\u007F': // Backspace (DEL)
      if (commandBuffer.length > 0) {
        // Remove last character from buffer
        commandBuffer = commandBuffer.slice(0, -1);
        // Move cursor back, clear character, move cursor back again
        term.write('\b \b');
      }
      break;
    default:
      // Add character to buffer and display it
      commandBuffer += data;
      term.write(data);
  }
});

// Display data from server
socket.on('output', (data) => {
  term.write(data);
});
