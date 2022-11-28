import http from '../http';
import { Team } from './team';
import { Lookup } from './recim';

export type Participant = {
  Username: string;
  Email: string;
  Role: string;
  Status: string;
  Notification: ParticipantNotification[];
};

type PatchParticipantActivity = {
  ActivityID: number;
  ActivityPrivType: string;
  IsFreeAgent: boolean;
};

type PatchParticipantStatus = {
  StatusDescription: string;
  EndDate: string;
};

type ParticipantStatus = {
  Username: string;
  Status: string;
  StartDate: string;
  EndDate: string;
};

type CreatedParticipantStatus = {
  ID: number;
  ParticipantID: number;
  StatusID: number;
  StartDate: string;
  EndDate?: string;
};

type UploadParticipantNotification = {
  Message: string;
  EndDate: string;
};

type ParticipantNotification = {
  ID: number;
  Message: string;
  DispatchDate: string;
};

type CreatedParticipantNotification = {
  ID: number;
  ParticipantID: number;
  Message: string;
  EndDate: string;
  DispatchDate: string;
};

type CreatedParticipantActivity = {
  ID: number;
  ActivityID: number;
  ParticipantID: number;
  PrivTypeID: number;
  isFreeAgent: boolean;
};

//Participant Routes
const createParticipant = (ID: number): Promise<Participant> =>
  http.put(`recim/participants/${ID}`);

const getParticipants = (): Promise<Participant[]> => http.get(`recim/participants`);

const getParticipantByUsername = (username: string): Promise<Participant> =>
  http.get(`recim/participants/${username}`);

const getParticipantTeams = (username: string): Promise<Team[]> =>
  http.get(`recim/participants/${username}/teams`);

const getParticipantStatusHistory = (username: string): Promise<ParticipantStatus[]> =>
  http.get(`recim/participants/${username}/StatusHistory`);

const getParticipantStatusTypes = (): Promise<Lookup[]> =>
  http.get(`recim/participants/lookup?type=status`);

const getParticipantActivityPrivTypes = (): Promise<Lookup[]> =>
  http.get(`recim/participants/lookup?type=activitypriv`);

const sendNotification = (
  username: string,
  notification: UploadParticipantNotification,
): Promise<CreatedParticipantNotification> =>
  http.post(`participants/${username}/notifications`, notification);

const editParticipantActivity = (
  username: string,
  updatedParticipant: PatchParticipantActivity,
): Promise<CreatedParticipantActivity> =>
  http.patch(`recim/participants/${username}`, updatedParticipant);

const editParticipantStatus = (
  username: string,
  status: PatchParticipantStatus,
): Promise<CreatedParticipantStatus> => http.patch(`recim/participants/${username}`, status);

export {
  createParticipant,
  getParticipants,
  getParticipantByUsername,
  getParticipantTeams,
  getParticipantStatusHistory,
  getParticipantStatusTypes,
  getParticipantActivityPrivTypes,
  sendNotification,
  editParticipantActivity,
  editParticipantStatus,
};
