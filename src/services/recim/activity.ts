import http from '../http';
import { sport } from './sport';
import { team } from './team';
import { series } from './series';

export type activity = {
  ID: number;
  Name: string;
  RegistrationStart: string;
  RegistrationEnd: string;
  RegistrationOpen: boolean;
  SportID: sport;
  MinCapacity: number;
  MaxCapacity: number;
  SoloRegistration: boolean;
  Logo: string;
  Series: series[];
  Team: team[];
};

type createdActivity = {
  ID: number;
  Name: string;
  RegistrationStart: string;
  RegistrationEnd: string;
  RegistrationOpen: boolean;
  SportID: sport;
  StatusID: number;
  MinCapacity: number;
  MaxCapacity: number;
  SoloRegistration: boolean;
  Completed: boolean;
};

type uploadActivity = {
  Name: string;
  RegistrationStart: string;
  RegistrationEnd: string;
  SportID: number;
  MinCapacity: number;
  MaxCapacity: number;
  SoloRegistration: boolean;
  Logo: string;
};

type patchActivity = {
  Name: string;
  RegistrationStart: string;
  RegistrationEnd: string;
  SportID: number;
  StatusID: number;
  MinCapacity: number;
  MaxCapacity: number;
  SoloRegistration: boolean;
  Logo: string;
  Completed: boolean;
};

//Activity Routes
const createNewActivity = async (newActivity: uploadActivity): Promise<Object[]> => {
  return await http.post('recim/activities', newActivity);
};

const getActivityByID = async (ID: number): Promise<activity> => {
  return await http.get(`recim/activities/${ID}`);
};

const getAllActivities = async (
  active: boolean,
  time: String,
  registrationOpen: boolean,
): Promise<Object[]> => {
  if (registrationOpen) {
    return await http.get(`recim/activities?registrationOpen=${registrationOpen}`);
  } else {
    if (time) {
      return await http.get(`recim/activities?active=${active}&time=${time}`);
    } else {
      return await http.get(`recim/activities?active=${active}`);
    }
  }
};

const editActivity = async (ID: number, updatedActivity: patchActivity): Promise<Object[]> => {
  return await http.patch(`recim/activities/${ID}`, updatedActivity);
};

export { createNewActivity, getActivityByID, getAllActivities, editActivity };
