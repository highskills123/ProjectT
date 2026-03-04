const API_BASE = '/api';

export class NetworkManager {
  private static instance: NetworkManager;

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  async fetchAlliances(): Promise<Array<{ id: string; name: string; members: number; power: number }>> {
    const res = await fetch(`${API_BASE}/alliances`);
    if (!res.ok) throw new Error('Server error');
    return res.json();
  }

  async joinAlliance(allianceId: string, playerToken: string): Promise<{ success: boolean; reason?: string }> {
    const res = await fetch(`${API_BASE}/alliances/${allianceId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: playerToken }),
    });
    return res.json();
  }

  async createAlliance(name: string, playerToken: string): Promise<{ success: boolean; allianceId?: string; reason?: string }> {
    const res = await fetch(`${API_BASE}/alliances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, token: playerToken }),
    });
    return res.json();
  }

  async syncSave(save: object, playerToken: string): Promise<void> {
    await fetch(`${API_BASE}/players/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ save, token: playerToken }),
    });
  }

  async getLeaderboard(): Promise<Array<{ rank: number; name: string; power: number }>> {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Server error');
    return res.json();
  }
}
