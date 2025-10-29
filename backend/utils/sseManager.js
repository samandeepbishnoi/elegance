/**
 * SSE Manager
 * Manages Server-Sent Events connections and broadcasts
 * Handles client connections, event broadcasting, and cleanup
 */

class SSEManager {
  constructor() {
    // Store active SSE connections
    this.clients = new Set();
    
    // Event log for debugging
    this.eventLog = [];
    this.maxLogSize = 100;
    
    console.log('SSE Manager initialized');
  }

  /**
   * Add a new SSE client connection
   * @param {Object} res - Express response object
   * @param {String} clientId - Unique client identifier
   */
  addClient(res, clientId) {
    const client = {
      id: clientId,
      res,
      connectedAt: new Date(),
    };
    
    this.clients.add(client);
    console.log(`[SSE] Client connected: ${clientId} (Total clients: ${this.clients.size})`);

    // Send initial connection event
    this.sendToClient(client, {
      type: 'connected',
      data: {
        message: 'SSE connection established',
        clientId,
        timestamp: new Date().toISOString(),
      }
    });

    return client;
  }

  /**
   * Remove a client connection
   * @param {Object} client - Client object to remove
   */
  removeClient(client) {
    this.clients.delete(client);
    console.log(`[SSE] Client disconnected: ${client.id} (Total clients: ${this.clients.size})`);
  }

  /**
   * Send event to a specific client
   * @param {Object} client - Client object
   * @param {Object} event - Event object with type and data
   */
  sendToClient(client, event) {
    try {
      const eventData = {
        type: event.type,
        data: event.data,
        timestamp: new Date().toISOString(),
      };

      // Format SSE message
      client.res.write(`event: ${event.type}\n`);
      client.res.write(`data: ${JSON.stringify(eventData.data)}\n`);
      client.res.write(`id: ${Date.now()}\n`);
      client.res.write('\n');
    } catch (error) {
      console.error(`[SSE] Error sending to client ${client.id}:`, error.message);
      this.removeClient(client);
    }
  }

  /**
   * Broadcast event to all connected clients
   * @param {String} eventType - Type of event (store_status, product_update, etc.)
   * @param {Object} data - Event data
   */
  broadcast(eventType, data) {
    const event = {
      type: eventType,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      }
    };

    // Log event
    this.logEvent(eventType, data);

    // Broadcast to all clients
    console.log(`[SSE] Broadcasting ${eventType} to ${this.clients.size} clients`);
    
    const disconnectedClients = [];
    
    for (const client of this.clients) {
      try {
        this.sendToClient(client, event);
      } catch (error) {
        console.error(`[SSE] Failed to send to client ${client.id}:`, error.message);
        disconnectedClients.push(client);
      }
    }

    // Clean up disconnected clients
    disconnectedClients.forEach(client => this.removeClient(client));
  }

  /**
   * Log event for debugging
   * @param {String} eventType - Type of event
   * @param {Object} data - Event data
   */
  logEvent(eventType, data) {
    const logEntry = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      clientCount: this.clients.size,
    };

    this.eventLog.unshift(logEntry);

    // Keep only last N events
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(0, this.maxLogSize);
    }
  }

  /**
   * Get event log for debugging
   * @param {Number} limit - Maximum number of events to return
   */
  getEventLog(limit = 50) {
    return this.eventLog.slice(0, limit);
  }

  /**
   * Get connected clients count
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Send heartbeat to all clients to keep connections alive
   */
  sendHeartbeat() {
    this.broadcast('heartbeat', {
      message: 'Connection alive',
      activeClients: this.clients.size,
    });
  }
}

// Create singleton instance
const sseManager = new SSEManager();

// Send heartbeat every 30 seconds to keep connections alive
setInterval(() => {
  if (sseManager.getClientCount() > 0) {
    sseManager.sendHeartbeat();
  }
}, 30000);

export default sseManager;
