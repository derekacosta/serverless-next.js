import React from 'react'
import { tryGetApi, setHeaders } from '../../utils/fetch-helpers'
// import { getAccessToken, setAccessToken } from "../accessToken";
import { validateJwt } from '../../server/jwt';
import { has } from '../../utils/error';
import { parseCookies } from 'nookies';
import redirect from '../../utils/redirect';

const isServer = () => typeof window === "undefined";

export const withData = (PageComponent: any) => {

  const wrapper = (props) => {
    console.log(props)
    return (
      <PageComponent {...props} />
    )
  }

  if (isServer) {
    PageComponent.getInitialProps = async (ctx) => {
      const cookies = parseCookies(ctx);
      const uid = cookies['uid'];
  
      if (uid) {
        console.log(uid)
          // shouldn't expire anytime soon so return
          try {
              // const user = await validateJwt(uid)
              const props = PageComponent.getInitialProps &&
                  (await PageComponent.getInitialProps(ctx));
                return { ...props, ...JSON.parse(uid)};
          } catch (_) {
              // if cookie, but expired, prompt to relogin
              // stripe makes this seamless without leaving the page
              // in development mode, this will bring
              // rather than saving stale data in cookie
              redirect(ctx, process.env.LOGIN_URL)
          }
      }
      else if (typeof window === "undefined") redirect(ctx, '/'); //if cookie is not longer available, redirect home not much can be donez
      return {}
    }
  }  
  
  return wrapper;
}

// /**
//  * Always creates a new client session for every request
//  * @param initState 
//  * @param serverAccessToken 
//  */
