export interface AthleteResult {
  sport: string;
  gender: string;
  teamName: string;
  meetName: string;
  event: string;
  time: string;
  place: number;
}

export interface TopKAverageResult {
  meetName: string;
  averageTime: string; // MM:SS.ms format
  athleteResults: SingleMeetAthleteResult[];
}

export interface SingleMeetAthleteResult {
  athleteName: string;
  athleteId: number;
  time: string;
  place: number;
}
