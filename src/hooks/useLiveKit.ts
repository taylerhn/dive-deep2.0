import { useState, useEffect, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  LocalParticipant,
  Participant as LiveKitParticipant,
} from 'livekit-client';
import { liveKitService } from '../services/liveKitService';
import type { Participant } from '../types/livekit';

interface UseLiveKitOptions {
  roomName: string;
  participantName: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export function useLiveKit(options: UseLiveKitOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  const updateParticipants = useCallback((room: Room) => {
    const participantList: Participant[] = [];

    // Add local participant
    const local = room.localParticipant;
    participantList.push({
      identity: local.identity,
      name: local.name || local.identity,
      isSpeaking: local.isSpeaking,
      audioEnabled: local.isMicrophoneEnabled,
      videoEnabled: local.isCameraEnabled,
    });

    // Add remote participants
    room.remoteParticipants.forEach((participant) => {
      participantList.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        isSpeaking: participant.isSpeaking,
        audioEnabled: participant.isMicrophoneEnabled,
        videoEnabled: participant.isCameraEnabled,
      });
    });

    setParticipants(participantList);
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Generate token (in production, call your backend)
      const token = await liveKitService.generateToken(
        options.roomName,
        options.participantName
      );

      const wsUrl = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880';

      // Connect to room
      const connectedRoom = await liveKitService.connect({
        url: wsUrl,
        token,
      });

      setRoom(connectedRoom);
      setIsConnected(true);
      updateParticipants(connectedRoom);

      // Setup event listeners
      liveKitService.setupEventListeners({
        onParticipantConnected: () => {
          updateParticipants(connectedRoom);
        },
        onParticipantDisconnected: () => {
          updateParticipants(connectedRoom);
        },
        onActiveSpeakersChanged: () => {
          updateParticipants(connectedRoom);
        },
        onDisconnected: () => {
          setIsConnected(false);
          setRoom(null);
          options.onDisconnected?.();
        },
      });

      // Enable mic and camera by default
      await liveKitService.setMicrophoneEnabled(true);
      await liveKitService.setCameraEnabled(true);

      options.onConnected?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsConnecting(false);
    }
  }, [
    isConnecting,
    isConnected,
    options.roomName,
    options.participantName,
    updateParticipants,
  ]);

  const disconnect = useCallback(async () => {
    if (!room) return;

    try {
      await liveKitService.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  }, [room]);

  const toggleMicrophone = useCallback(async () => {
    if (!room) return;

    try {
      const newState = !isMicEnabled;
      await liveKitService.setMicrophoneEnabled(newState);
      setIsMicEnabled(newState);
      updateParticipants(room);
    } catch (err) {
      console.error('Error toggling microphone:', err);
    }
  }, [room, isMicEnabled, updateParticipants]);

  const toggleCamera = useCallback(async () => {
    if (!room) return;

    try {
      const newState = !isCameraEnabled;
      await liveKitService.setCameraEnabled(newState);
      setIsCameraEnabled(newState);
      updateParticipants(room);
    } catch (err) {
      console.error('Error toggling camera:', err);
    }
  }, [room, isCameraEnabled, updateParticipants]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    room,
    participants,
    isConnected,
    isConnecting,
    error,
    isMicEnabled,
    isCameraEnabled,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
  };
}
