import fetch from 'node-fetch';
import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1' });

function getSecret(SecretId, callback) {
	var secretsManager = new AWS.SecretsManager();
    secretsManager.getSecretValue({ SecretId: SecretId }, (err, data) => {
		// Handle error
        if (err) {
            console.error('Error retrieving secret:', err);
            callback(err, null);
            return;
        }
		
		// Handle missing SecretString
        if (!data || !data.SecretString) {
            const error = new Error('SecretString is missing in the response');
            console.error(error.message);
            callback(error, null);
            return;
        }

		// Return the secret
        const secret = data.SecretString;
        callback(null, secret);
    });
}


const geocode = (location, callback) => {
	/**
	 * This is the function that gets the location,
	 *  given a plaintext location.
	 * Input is a string location.
	 * Outputs either an error as string or the 
	 *  number coordinates and string name.
	 */

	// Get Mapbox token from AWS Secrets Manager
	getSecret("WT3-Mapbox-API-Token", (err, res) => {
		// Handle error
        if (err) {
            console.error('Error retrieving mapbox data - could not get access token:', err);
            callback(err, null);
            return;
        }

		// Handle missing access token
		if (!res) {
			const error = new Error('Access token is missing in the response');
			console.error(error.message);
			callback(error, null);
			return;
		}

		// Ensure the location is proper:
		// Properly encoding:
		location = encodeURIComponent(location)
	
		// Lack of semicolons:
		// If any then remove them
		location = location.replace(/%3B/g, '');
	
		// Only UTF-8 chars
	
		// <= 20 words:
		if (location.split("+").length > 20){
			// If so then remove the rest of the words
			location = ((location.split("+")).slice(0, 20)).join("+")
		} 
	
		// <= 256 characters
		if (location.length > 256) {
			location = location.slice(0, 256)
		}
	
		// If there are no characters left in string:
		if (location.length === 0) {
			return callback('Invalid input.', undefined)
		}
	
		// Define the base URL
		const baseUrl = new URL('https://api.mapbox.com');
		const geocodingUrl = new URL(`geocoding/v5/mapbox.places/${location}.json`, baseUrl);
	
		// Define the query parameters
		var access_token = JSON.parse(res)["access_token"];
		const params = {
			access_token: access_token,
			limit: 1
		};
	
		// Append query parameters to the URL
		Object.keys(params).forEach(key => geocodingUrl.searchParams.append(key, params[key]));
	
		// Fetch the data
		fetch(geocodingUrl)
			.then(response => {
				if (!response.ok) {
					throw new Error('Unable to connect to location services!');
				}
				return response.json();
			})
			.then(data => {
				if (data.features === undefined) {
					throw new Error('Oh no! Either the mapbox service is down or we have run out of free uses of their service! My apologies!');
				} else if (data.features.length === 0) {
					throw new Error('Unable to find location. Try another search.');
				} else {
					callback(undefined, {
						latitude: data.features[0].center[1],
						longitude: data.features[0].center[0],
						parsedLocation: data.features[0].place_name
					});
				}
			})
			.catch(error => {
				callback(error.message, undefined);
			});
	});
}

export default geocode;