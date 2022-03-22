import { isAuthenticated } from './auth';
import { createError } from './error';
import storage from './storage';

const base = process.env.REACT_APP_API_URL;

type HttpRequest = <TResponse>(
  url: string,
  body?: Object,
  headerOptions?: Object,
) => Promise<TResponse>;

/**
 * Make a headers object with authentication options for use with the API
 *
 * @param headerOptions Options to put in the Header. If empty, only auth is added
 * @returns Headers for the request
 */
const makeHeaders = (headerOptions: any): Headers => {
  if (isAuthenticated()) {
    if (headerOptions === undefined) {
      try {
        const token = storage.get('token');
        return new Headers({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });
      } catch (err) {
        throw new Error('Token is not available');
      }
    } else {
      try {
        const token = storage.get('token');
        return new Headers({
          Authorization: `Bearer ${token}`,
        });
      } catch (err) {
        throw new Error('Token is not available');
      }
    }
  } else {
    return new Headers({
      Authorization: `Bearer `,
      'Content-Type': 'application/json',
    });
  }
};

/**
 * Parse an HTTP response
 *
 * @param res the response to parse
 * @returns Resolves with the response body; Rejects on a non-2xx response code
 */
export const parseResponse = async <TResponse>(res: Response): Promise<TResponse> => {
  try {
    const json = await res.text();
    const data: TResponse = json.length ? JSON.parse(json) : {};

    // Throw error when response status code is bad
    if (!res.ok) {
      // @ts-ignore
      return Promise.reject(createError(data, res));
    }

    return data;
  } catch (err) {
    // Handle error if response body is not valid JSON
    return Promise.reject(err instanceof Error ? createError(err, res) : err);
  }
};

/**
 * Make a request to the API
 *
 * @param url URL to request, relative to base, ex: `activity/023487` (no leading slash)
 * @param method HTTP method to use
 * @param body Body of the request
 * @param headerOptions Options to put in the Header
 * @returns The parsed response to the request
 */
const makeRequest = async <TResponse>(
  url: string,
  method: string,
  body?: any,
  headerOptions?: any,
): Promise<TResponse> => {
  const request = new Request(`${base}api/${url}`, {
    method,
    body,
    headers: makeHeaders(headerOptions),
  });
  const response = await fetch(request);
  return parseResponse(response);
};

const get: HttpRequest = (url) => makeRequest(url, 'get');

const put: HttpRequest = (url, body) => makeRequest(url, 'put', JSON.stringify(body));

const post: HttpRequest = (url, body, headerOptions?) => {
  if (headerOptions !== undefined) {
    return makeRequest(url, 'post', body, headerOptions);
  } else {
    return makeRequest(url, 'post', JSON.stringify(body));
  }
};

const del: HttpRequest = (url) => makeRequest(url, 'delete');

const httpUtils = {
  del,
  get,
  post,
  put,
};

export default httpUtils;
