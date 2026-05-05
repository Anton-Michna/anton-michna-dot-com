import type {
  SearchTeamsResponse,
  Team,
  GetFastestTeamAveragesResponse,
  GetAthleteResultsResponse,
  SearchAthletesResponse,
  Athlete,
} from "../types/api-types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Team Search
export async function searchTeams(query: string): Promise<Team[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/searchTeams?query=${encodeURIComponent(query)}`,
  );
  const data: SearchTeamsResponse = await handleResponse(response);
  return data.success && data.data ? data.data : [];
}

// Athlete Search
export async function searchAthletes(query: string): Promise<Athlete[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/searchAthletes?query=${encodeURIComponent(query)}`,
  );
  const data: SearchAthletesResponse = await handleResponse(response);
  return data.success && data.data ? data.data : [];
}

// Get Team Distance Possibilities
export async function getTeamDistancePossibilities(
  teamId: number,
): Promise<string[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/getTeamDistancePossibilities?teamId=${teamId}`,
  );
  const data = await handleResponse<{ success: boolean; data?: string[] }>(
    response,
  );
  return data.success && data.data ? data.data : [];
}

// Get Fastest Team Averages
export async function getFastestTeamAverages(params: {
  teamId: number;
  distance: string;
  athleteCount?: 5 | 7 | 9;
  resultCount?: number;
}): Promise<GetFastestTeamAveragesResponse> {
  const searchParams = new URLSearchParams({
    teamId: String(params.teamId),
    distance: params.distance,
    athleteCount: String(params.athleteCount ?? 5),
    resultCount: String(params.resultCount ?? 10),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/getFastestTeamAverages?${searchParams.toString()}`,
  );
  return handleResponse<GetFastestTeamAveragesResponse>(response);
}

// Get Athlete Results
export async function getAthleteResults(
  athleteId: string,
): Promise<GetAthleteResultsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/getAthleteResults?athleteId=${athleteId}`,
  );
  return handleResponse<GetAthleteResultsResponse>(response);
}

// Get Earliest Meet
export async function getEarliestMeet(): Promise<{
  success: boolean;
  message: string;
  earliestMonth?: string;
  earliestYear?: string;
  error?: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/earliestMeet`);
  return handleResponse(response);
}
