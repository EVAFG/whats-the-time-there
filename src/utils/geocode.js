const request = require('request')

const geocode = (location, callback) => {
	/**
	 * This is the function that gets the location,
	 *  given a plaintext location.
	 * Input is a string location.
	 * Outputs either an error as string or the 
	 *  number coordinates and string name.
	 */

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
		callback('Invalid input.', undefined)
	}

    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + location + '.json?access_token=pk.eyJ1IjoidHJpY2t5LWN1dGxlcnktNyIsImEiOiJjazR1YjV4Zjgzbm5tM2tuc2VjemRxa3I5In0.pJit0UFF58qsn--5BoSe0w&limit=1'

    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to location services!', undefined)
        } else if (body.features === undefined) {
            callback('Oh no! Either the mapbox service is down or we have run out of free uses of their service! My apologies!', undefined)
        } else if (body.features.length === 0) {
            callback('Unable to find location. Try another search.', undefined)
        } else {
            callback(undefined, {
                latitude: body.features[0].center[1],
                longitude: body.features[0].center[0],
                parsedLocation: body.features[0].place_name
            })
        }
    })
}

module.exports = geocode