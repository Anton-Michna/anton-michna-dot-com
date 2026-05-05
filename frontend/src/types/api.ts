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
  data?: GetAthleteResults[];
  error?: string;
}

export interface GetAthleteResults {
  sport: string;
  gender: string;
  teamName: string;
  meetName: string;
  event: string;
  time: string;
  place: number;
}
