module.exports = typeof window !== 'undefined' ? window.WebSocket : require('ws');
