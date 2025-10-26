import { Room, RoomEvent, Track } from 'livekit-client';
import type { LiveKitConfig } from '../types/livekit';

export class LiveKitService {
  private room: Room | null = null;

  /**
   * Generate a LiveKit access token
   * In production, this should be done server-side
   */
  async generateToken(
    roomName: string,
    participantName: string
  ): Promise<string> {
    // In development, use local token server
    const tokenServerUrl =
      import.meta.env.VITE_TOKEN_SERVER_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${tokenServerUrl}/api/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating LiveKit token:', error);
      throw new Error(
        'Failed to generate LiveKit token. Make sure the token server is running (npm run server)'
      );
    }
  }

  /**
   * Connect to a LiveKit room
   */
  async connect(config: LiveKitConfig): Promise<Room> {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: {
          width: 1280,
          height: 720,
          frameRate: 30,
        },
      },
    });

    await room.connect(config.url, config.token);
    this.room = room;
    return room;
  }

  /**
   * Disconnect from the room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }

  /**
   * Enable/disable microphone
   */
  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (!this.room) return;
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
  }

  /**
   * Enable/disable camera
   */
  async setCameraEnabled(enabled: boolean): Promise<void> {
    if (!this.room) return;
    await this.room.localParticipant.setCameraEnabled(enabled);
  }

  /**
   * Get current room
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Setup event listeners for room
   */
  setupEventListeners(callbacks: {
    onParticipantConnected?: (participant: any) => void;
    onParticipantDisconnected?: (participant: any) => void;
    onTrackSubscribed?: (track: any, publication: any, participant: any) => void;
    onTrackUnsubscribed?: (track: any, publication: any, participant: any) => void;
    onActiveSpeakersChanged?: (speakers: any[]) => void;
    onDisconnected?: () => void;
  }): void {
    if (!this.room) return;

    if (callbacks.onParticipantConnected) {
      this.room.on(RoomEvent.ParticipantConnected, callbacks.onParticipantConnected);
    }

    if (callbacks.onParticipantDisconnected) {
      this.room.on(RoomEvent.ParticipantDisconnected, callbacks.onParticipantDisconnected);
    }

    if (callbacks.onTrackSubscribed) {
      this.room.on(RoomEvent.TrackSubscribed, callbacks.onTrackSubscribed);
    }

    if (callbacks.onTrackUnsubscribed) {
      this.room.on(RoomEvent.TrackUnsubscribed, callbacks.onTrackUnsubscribed);
    }

    if (callbacks.onActiveSpeakersChanged) {
      this.room.on(RoomEvent.ActiveSpeakersChanged, callbacks.onActiveSpeakersChanged);
    }

    if (callbacks.onDisconnected) {
      this.room.on(RoomEvent.Disconnected, callbacks.onDisconnected);
    }
  }
}

export const liveKitService = new LiveKitService();
