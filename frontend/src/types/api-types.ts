// Shared types for API responses

export interface SingleMeetAthleteResult {
  athleteName: string;
  athleteId: number;
  time: string;
  place: number;
}

export interface TopKAverageResult {
  meetName: string;
  averageTime: string; // MM:SS.ms format
  athleteResults: SingleMeetAthleteResult[];
}

export interface GetFastestTeamAveragesResponse {
  message: string;
  success: boolean;
  data?: TopKAverageResult[];
  error?: string;
}

export interface GetAthleteResultsResponse {
  message: string;
  success: boolean;
  data?: Record<string, GetAthleteResults[]>;
  error?: string;
}

export interface GetAthleteResults {
  athleteName: string;
  sport: string;
  gender: string;
  teamId: number;
  teamName: string;
  meetName: string;
  event: string;
  time: string;
  place: number;
}

export interface Team {
  id: number;
  name: string;
  gender: string;
  sport: string;
}

export interface SearchTeamsResponse {
  success: boolean;
  data?: Team[];
  message?: string;
  error?: string;
}

export interface Athlete {
  id: number;
  name: string;
  gender: string;
  teamName: string;
}

export interface SearchAthletesResponse {
  success: boolean;
  data?: Athlete[];
  message?: string;
  error?: string;
}
