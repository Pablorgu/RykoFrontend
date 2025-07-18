import { GENDERS } from "../(config)/_genders";

export interface UserProfileDto {
  username?: string;
  email?: string;
  birthdate?: string;
  gender?: string;
  country?: string;
  weight?: number;
  height?: number;
  aim?: string;
  calorieGoal?: number;
  proteinPct?: number;
  carbsPct?: number;
  fatPct?: number;
  intolerances?: string[];
}
