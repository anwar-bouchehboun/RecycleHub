import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ user: User }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',

);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ profile: any }>()
);

export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: User }>()
);

export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: string }>()
);

export const deleteAccount = createAction('[Auth] Delete Account');
export const deleteAccountSuccess = createAction(
  '[Auth] Delete Account Success'
);
export const deleteAccountFailure = createAction(
  '[Auth] Delete Account Failure',
  props<{ error: string }>()
);
