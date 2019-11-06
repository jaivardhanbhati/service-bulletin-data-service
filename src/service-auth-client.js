/**
	This module is similar to predix-uaa-client, in terms of getting
	bearer token from oauth provider and maintaining in local cache.
	The token fetched and managed here is non-jwt.
**/
'use strict';
const request = require('request');
const debug = require('debug')('api-auth-client');

const renew_secs_before = 300;
let client_token_cache = {};

let api_auth_utils = {};

api_auth_utils.fetchToken = (authServerURL, clientId, clientSecret, scope) => {
	// Throw exception if required options are missing
	let missingArgs = [];
	if (!authServerURL) missingArgs.push('authServerURL');
	if (!clientId) missingArgs.push('clientId');
	if (!clientSecret) missingArgs.push('clientSecret');
	if (!scope) missingArgs.push('scope');

	if (missingArgs.length > 0) {
		const msg = 'Required argument(s) missing: ' + missingArgs.join();
		debug(msg);
		throw new Error(msg);
	}
	return new Promise((resolve, reject) => {
		let alreadyResolved = false;
		const cache_key = `${authServerURL}__${clientId}`;
		let access_token = null;
		let form = {};
		const now = Date.now();

		access_token = client_token_cache[cache_key];
		if (access_token && access_token.expire_time > now) {
            // Already have it.
			resolve(access_token);
			alreadyResolved = true;
		}

		form.grant_type = 'client_credentials';
		form.scope = scope;

		if (!access_token || access_token.renew_time < now) {
            // Yep, don't have one, or this one will expire soon.
			debug('Fetching new token');
			const options = {
				url: authServerURL,
				headers: {
					'cache-control': 'no-cache',
					'content-type': 'application/x-www-form-urlencoded'
				},
				auth: {
					username: clientId,
					password: clientSecret
				},
				form: form
			};
			request.post(options, (err, resp, body) => {
				const statusCode = (resp) ? resp.statusCode : 502;
				if (err || statusCode !== 200) {
					err = err || 'Error getting token: ' + statusCode;
					debug('Error getting token from', options.url, err);

                    // If we responded with a cached token, don't throw the error
					if (!alreadyResolved) {
						reject(err);
					}
				} else {
					debug('Fetched new token');
					const data = JSON.parse(body);

                    // Extract the token and expires duration
					const newToken = {
						access_token: data.access_token,
						expire_time: now + (data.expires_in * 1000),
						renew_time: now + ((data.expires_in - renew_secs_before) * 1000)
					};

					access_token = newToken;
                    // If we responded with a cached token, don't resolve again
					if (!alreadyResolved) {
						resolve(access_token);
					}

					client_token_cache[cache_key] = access_token;
					debug('Cached new access_token for', clientId);
				}
			});
		}
	});
};

/**
 *  This function clears all the cached access tokens.
 *  Subsequent calls to getToken will fetch a new token from UAA.
 */
api_auth_utils.clearCache = () => {
	client_token_cache = {};
	debug('Cleared token cache');
};

module.exports = api_auth_utils;
