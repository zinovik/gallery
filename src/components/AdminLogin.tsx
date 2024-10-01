import React, { useContext } from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { apiLoad, apiLogin, apiLogout } from '../services/api';
import { IS_LOCAL_DEVELOPMENT } from '../constants';
import { ForceUpdateContext } from '../routers/MainRouter';
import { getUser, switchEditMode } from '../state';

export const AdminLogin = () => {
  const forceUpdate = useContext(ForceUpdateContext);

  const clickHandler = async (token: string) => {
    const isSuccess = await apiLogin(token);
    await apiLoad();
    alert(isSuccess ? 'success' : 'error');
    forceUpdate();
  };

  const user = getUser();

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
                const isSuccess = await apiLogout();
                await apiLoad();
                alert(isSuccess ? 'success' : 'error');
                forceUpdate();
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
                    switchEditMode();
                    forceUpdate();
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
