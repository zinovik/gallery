import React from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { IS_LOCAL_DEVELOPMENT } from '../constants';
import {
  apiLoad,
  apiLogin,
  apiLogout,
  selectUser,
  switchEditMode,
} from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';

export const AdminLogin = () => {
  const dispatch = useAppDispatch();

  const clickHandler = async (token: string) => {
    await dispatch(apiLogin(token));
    await dispatch(apiLoad(true));
  };

  const user = useAppSelector(selectUser);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
      }}
    >
      {user ? (
        <>
          <div>
            {user.email}{' '}
            <button
              onClick={async () => {
                dispatch(switchEditMode(false));
                await dispatch(apiLogout());
                await dispatch(apiLoad(true));
              }}
            >
              logout
            </button>
          </div>
          {user.isEditAccess && (
            <>
              <div>
                <button
                  onClick={() => {
                    dispatch(switchEditMode());
                  }}
                >
                  switch edit mode
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {IS_LOCAL_DEVELOPMENT ? (
            <button
              onClick={async () => {
                await clickHandler('mock-google-token');
              }}
            >
              Sign in with Google mock
            </button>
          ) : (
            <GoogleLogin
              onSuccess={async (credentialResponse: CredentialResponse) => {
                if (!credentialResponse.credential) return;
                await clickHandler(credentialResponse.credential);
              }}
              onError={() => {
                console.error('Login Failed');
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
