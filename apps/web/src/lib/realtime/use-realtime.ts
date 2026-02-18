'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  RealtimeEvent,
  EventType,
  EventHandler,
  ConnectionState,
  SubscriptionOptions,
} from './types';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_RECONNECT_ATTEMPTS = 10;

interface UseRealtimeOptions extends SubscriptionOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    userId,
    classroomId,
    eventTypes,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    userId,
    classroomId,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<Map<EventType, Set<EventHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Register event handler
  const on = useCallback(<T extends RealtimeEvent>(type: EventType, handler: EventHandler<T>) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(type)?.delete(handler as EventHandler);
    };
  }, []);

  // Remove event handler
  const off = useCallback((type: EventType, handler: EventHandler) => {
    handlersRef.current.get(type)?.delete(handler);
  }, []);

  // Dispatch event to handlers
  const dispatchEvent = useCallback((event: RealtimeEvent) => {
    const handlers = handlersRef.current.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }, []);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    // Build URL with params
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (classroomId) params.set('classroomId', classroomId);
    if (eventTypes?.length) params.set('events', eventTypes.join(','));

    const url = `/api/realtime?${params.toString()}`;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
        }));
        onConnect?.();
      };

      eventSource.onerror = () => {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
        }));

        eventSource.close();
        eventSourceRef.current = null;

        // Schedule reconnect
        scheduleReconnect();
        onError?.(new Error('SSE connection error'));
      };

      // Handle connection_established
      eventSource.addEventListener('connection_established', (e) => {
        const data = JSON.parse(e.data);
        setConnectionState((prev) => ({
          ...prev,
          isConnected: true,
          lastHeartbeat: new Date(),
        }));
        dispatchEvent({
          id: crypto.randomUUID(),
          type: 'connection_established',
          timestamp: new Date(),
          payload: data,
        });
      });

      // Handle heartbeat
      eventSource.addEventListener('heartbeat', (e) => {
        const data = JSON.parse(e.data);
        setConnectionState((prev) => ({
          ...prev,
          lastHeartbeat: new Date(data.timestamp),
        }));
      });

      // Handle all other events
      const allEventTypes: EventType[] = [
        'nudge',
        'mode_suggestion',
        'achievement',
        'streak_update',
        'concept_mastered',
        'student_joined',
        'student_left',
        'student_struggling',
        'student_completed',
        'question_asked',
        'need_created',
        'need_voted',
        'need_addressed',
        'room_created',
        'room_updated',
        'room_message',
      ];

      allEventTypes.forEach((eventType) => {
        eventSource.addEventListener(eventType, (e) => {
          try {
            const data = JSON.parse(e.data);
            dispatchEvent({
              id: (e as MessageEvent).lastEventId || crypto.randomUUID(),
              type: eventType,
              timestamp: new Date(),
              payload: data,
            });
          } catch (err) {
            console.error(`Failed to parse ${eventType} event:`, err);
          }
        });
      });
    } catch (err) {
      onError?.(err as Error);
    }
  }, [userId, classroomId, eventTypes, onConnect, onError, dispatchEvent]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
    }));

    onDisconnect?.();
  }, [onDisconnect]);

  // Schedule reconnect with exponential backoff
  const scheduleReconnect = useCallback(() => {
    setConnectionState((prev) => {
      const attempts = prev.reconnectAttempts;

      if (attempts >= MAX_RECONNECT_ATTEMPTS) {
        onError?.(new Error('Max reconnection attempts reached'));
        return prev;
      }

      const delay = RECONNECT_DELAYS[Math.min(attempts, RECONNECT_DELAYS.length - 1)];

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      return {
        ...prev,
        reconnectAttempts: attempts + 1,
      };
    });
  }, [connect, onError]);

  // Send event (for components that need to trigger events)
  const sendEvent = useCallback(
    async (
      type: EventType,
      payload: unknown,
      target?: { userId?: string; classroomId?: string }
    ) => {
      try {
        const response = await fetch('/api/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            payload,
            targetUserId: target?.userId,
            targetClassroomId: target?.classroomId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send event');
        }

        return await response.json();
      } catch (err) {
        onError?.(err as Error);
        throw err;
      }
    },
    [onError]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    on,
    off,
    sendEvent,
  };
}

// Hook for nudge handling
export function useNudges(userId: string) {
  const [nudges, setNudges] = useState<RealtimeEvent[]>([]);
  const { on, sendEvent, connectionState } = useRealtime({ userId });

  useEffect(() => {
    const unsubscribe = on('nudge', (event) => {
      setNudges((prev) => [...prev, event]);
    });

    return unsubscribe;
  }, [on]);

  const dismissNudge = useCallback(
    (nudgeId: string) => {
      setNudges((prev) => prev.filter((n) => n.id !== nudgeId));
    },
    []
  );

  const clearAllNudges = useCallback(() => {
    setNudges([]);
  }, []);

  return {
    nudges,
    dismissNudge,
    clearAllNudges,
    isConnected: connectionState.isConnected,
    sendEvent,
  };
}

// Hook for classroom live view
export function useClassroomLive(classroomId: string) {
  const [students, setStudents] = useState<Map<string, unknown>>(new Map());
  const { on, connectionState } = useRealtime({ classroomId });

  useEffect(() => {
    const unsubscribes = [
      on('student_joined', (event) => {
        const { studentId } = event.payload as { studentId: string };
        setStudents((prev) => new Map(prev).set(studentId, event.payload));
      }),
      on('student_left', (event) => {
        const { studentId } = event.payload as { studentId: string };
        setStudents((prev) => {
          const next = new Map(prev);
          next.delete(studentId);
          return next;
        });
      }),
      on('student_struggling', (event) => {
        const { studentId } = event.payload as { studentId: string };
        setStudents((prev) => {
          const next = new Map(prev);
          const student = next.get(studentId);
          if (student) {
            next.set(studentId, { ...student as object, isStruggling: true });
          }
          return next;
        });
      }),
    ];

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [on]);

  return {
    students: Array.from(students.values()),
    isConnected: connectionState.isConnected,
  };
}
