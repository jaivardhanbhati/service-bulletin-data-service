'use strict';
const express = require('express');
const bearerToken = require('express-bearer-token');
const predixFastToken = require('predix-fast-token');
const router = express.Router();
const logger = require('./logger')('ServiceBulletinAuthEnforcer');

const trustedIssuers = process.env.TRUSTED_ISSUERS;

// TODO: Add ACS checks here when ready
// Ensure Authorization header has a bearer token
router.all('*', bearerToken(), (req, res, next) => {
	if (req.token) {
		predixFastToken.verify(req.token, trustedIssuers).then((decoded) => {
			// Check if client has proper scope
			if (decoded.grant_type === 'client_credentials') {
				if (decoded.scope && Array.isArray(decoded.scope) &&
					decoded.scope.indexOf(process.env.RESOURCE_ACCESS_SCOPE) > -1) {
					req.userName = decoded.client_id;
					next();
				} else {
					logger.error('Access Denied - Invalid scope', decoded.scope);
					res.status(403).send('Unauthorized');
				}
			} else {
				req.userName = decoded.user_name;
				next();
			}
		}).catch((err) => {
			logger.error('Invalid or expired token', err);
			res.status(403).send('Unauthorized');
		});
	} else {
		// TODO: Not enforcing token presence yet, will do soon
		logger.error('Request has no Authorization header.');
		next();
	}
});
module.exports = router;
