type SSEClient = (data: string) => void;

class SSEManager {
  private clients: Set<SSEClient> = new Set();

  subscribe(client: SSEClient) {
    this.clients.add(client);
    return () => {
      this.clients.delete(client);
    };
  }

  broadcast(eventType: string, data: any) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      try {
        client(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();
