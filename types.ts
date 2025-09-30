export interface HabiticaUser {
  userId: string;
  apiToken: string;
}

export interface Challenge {
  id: string;
  name: string;
  tasks: string[];
  usedTasks: string[];
  habiticaTaskId: string;
  schedule: {
    type: 'daily' | 'weekly';
    repeats: { [key: string]: boolean }; // e.g., { m: true, t: false, ... }
  };
  startDate: string;
}

// Custom preset type for user-uploaded task banks
export interface CustomPreset {
  name: string;
  tasks: string[];
}

// Simplified Habitica Daily task structure for API interaction
export interface HabiticaDaily {
  _id?: string;
  text: string;
  notes: string;
  type: 'daily';
  priority?: number;
  frequency: 'daily' | 'weekly';
  everyX?: number;
  startDate?: Date;
  repeat?: { [key: string]: boolean };
}