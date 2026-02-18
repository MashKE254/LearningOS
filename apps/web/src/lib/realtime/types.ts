/**
 * Real-time Event Types for EduForge
 *
 * Uses Server-Sent Events (SSE) for live updates between clients and server.
 */

// Base event type
export interface RealtimeEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  targetUserId?: string;
  targetClassroomId?: string;
  payload: unknown;
}

// Event types
export type EventType =
  // Student events
  | 'nudge'
  | 'mode_suggestion'
  | 'achievement'
  | 'streak_update'
  | 'concept_mastered'

  // Classroom events
  | 'student_joined'
  | 'student_left'
  | 'student_struggling'
  | 'student_completed'
  | 'question_asked'

  // Learning needs
  | 'need_created'
  | 'need_voted'
  | 'need_addressed'

  // Room events
  | 'room_created'
  | 'room_updated'
  | 'room_message'

  // System events
  | 'connection_established'
  | 'heartbeat';

// Nudge types (proactive interventions)
export interface NudgeEvent extends RealtimeEvent {
  type: 'nudge';
  payload: {
    nudgeType: NudgeType;
    message: string;
    action?: NudgeAction;
    priority: 'low' | 'medium' | 'high';
    dismissible: boolean;
    expiresAt?: Date;
  };
}

export type NudgeType =
  | 'take_break'
  | 'try_hint'
  | 'switch_mode'
  | 'review_concept'
  | 'celebrate'
  | 'encouragement'
  | 'challenge';

export interface NudgeAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

// Mode suggestion event
export interface ModeSuggestionEvent extends RealtimeEvent {
  type: 'mode_suggestion';
  payload: {
    suggestedMode: string;
    reason: string;
    confidence: number;
  };
}

// Achievement event
export interface AchievementEvent extends RealtimeEvent {
  type: 'achievement';
  payload: {
    achievementId: string;
    name: string;
    description: string;
    icon: string;
    xpAwarded: number;
  };
}

// Classroom live view events
export interface StudentActivityEvent extends RealtimeEvent {
  type: 'student_joined' | 'student_left' | 'student_struggling' | 'student_completed';
  payload: {
    studentId: string;
    studentName: string;
    currentTopic?: string;
    currentMode?: string;
    details?: Record<string, unknown>;
  };
}

// Learning need events
export interface LearningNeedEvent extends RealtimeEvent {
  type: 'need_created' | 'need_voted' | 'need_addressed';
  payload: {
    needId: string;
    topic: string;
    votes?: number;
    response?: string;
  };
}

// Connection state
export interface ConnectionState {
  isConnected: boolean;
  lastHeartbeat: Date | null;
  reconnectAttempts: number;
  userId?: string;
  classroomId?: string;
}

// Event handler type
export type EventHandler<T extends RealtimeEvent = RealtimeEvent> = (event: T) => void;

// Subscription options
export interface SubscriptionOptions {
  userId?: string;
  classroomId?: string;
  eventTypes?: EventType[];
}
