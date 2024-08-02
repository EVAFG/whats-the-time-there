import fetch from 'node-fetch';

async function makeRequest(url) {
    try {
        // Make request
        const response = await fetch(url);

        // Handle response
        if (!response.ok) {
            console.error('Error:', response.statusText);
            console.error('Status:', response.status);
            console.error('URL:', url);
            throw new Error('Unable to connect to time API service!');
        }
        const data = await response.json();
        
        // Handle data
        if (data.error) {
            console.error('Error:', data.error);
            console.error('Message:', data.message);
            console.error('URL:', url);
            throw new Error('Unable to find location or IP');
        } else {
            return [undefined, data];
        }
    } catch (error) {
        return [error.message, undefined];
    }
}

async function temporalAnalysis(latitude, longitude, ipAddress, callback) {
	/** 
	 * This is the function that gets the forecasted
	 *  data, given a location.
	 * Inputs are numbers latitude and longitude.
	 * Outputs either an error or a formatted 
	 *  array with the string data requested split
	 *  into lines. It is ready to be displayed.
	 */
    
    console.log("latitude: " + latitude)
    console.log("longitude: " + longitude)
    console.log("ipAddress: " + ipAddress)

    // Define base urls and API urls
    const baseUrlStr = "https://timeapi.io"
    const baseUrl    = new URL("/", baseUrlStr)
    
    const coordinateTimePath = "api/Time/current/coordinate"
    const IPTimePath         = "api/Time/current/ip"
    const timeZoneInfoPath   = "api/TimeZone/zone"

    ////////////////
    //// Target ////
    ////////////////
    console.log("Getting target time and data using coordinates")
    // Get target time and data using coordinates
    // Define parameter
    const coordinateTimeUrlParams = new URLSearchParams({
        longitude: longitude,
        latitude: latitude
    });

    // Get Request URL
    const coordinateTimeRequestParamsString = coordinateTimeUrlParams.toString();
    const coordinateTimeRequestUrl          = new URL(`${coordinateTimePath}?${coordinateTimeRequestParamsString}`, baseUrl);
    
    // Execute Get Request
    var temp = await makeRequest(coordinateTimeRequestUrl)
    const coordinateErr = temp[0]
    const coordinateRes = temp[1]
    
    // Handle result
    if (coordinateErr) {
        return callback(coordinateErr, undefined)  
    } 
    
    const targetTime      = coordinateRes.time
    const targetDate      = coordinateRes.date
    const targetTimeZone  = coordinateRes.timeZone
    const targetDayOfWeek = coordinateRes.dayOfWeek
    const targetDstActive = coordinateRes.dstActive

    // Get TimeZone data
    console.log("Getting target time zone data")
    // Define parameter
    const coordinateTimeZoneUrlParams = new URLSearchParams({
        timeZone: targetTimeZone
    });

    // Get Request URL
    const coordinateTimeZoneRequestParamsString = coordinateTimeZoneUrlParams.toString();
    const coordinateTimeZoneRequestUrl          = new URL(`${timeZoneInfoPath}?${coordinateTimeZoneRequestParamsString}`, baseUrl);


    // Execute Get Request
    var temp = await makeRequest(coordinateTimeZoneRequestUrl)
    const coordinateTimeZoneErr = temp[0]
    const coordinateTimeZoneRes = temp[1]
    
    // Handle result
    if (coordinateTimeZoneErr) {
        return callback(coordinateTimeZoneErr, undefined)  
    } 

    const targetUtcOffset = coordinateTimeZoneRes.currentUtcOffset


    ////////////////
    //// Source ////
    ////////////////
    console.log("Getting source time and data using IP address")

    // If the IP address is not provided or is localhost
    if ( (!ipAddress) || (ipAddress === "::1") ) {
        console.log("IP address not provided or is localhost")

        return callback(
            undefined, {
                "target": {
                    "time":      targetTime,
                    "date":      targetDate,
                    "timeZone":  targetTimeZone,
                    "dayOfWeek": targetDayOfWeek,
                    "dstActive": targetDstActive,
                    "utcOffset": targetUtcOffset
                }
            }
        )
    }

    // Get user's current time and data using IP address
    // Define parameter
    const IPTimeUrlParams  = new URLSearchParams({
        ipAddress: ipAddress
    });
    
    // Get Request URL
    const IPTimeUrlParamsString = IPTimeUrlParams.toString();
    const IPTimeRequestUrl      = new URL(`${IPTimePath}?${IPTimeUrlParamsString}`, baseUrl);

    // Execute Get Request
    console.log("IPTimeRequestUrl: " + IPTimeRequestUrl)
    var temp = await makeRequest(IPTimeRequestUrl)
    const IPErr = temp[0]
    const IPRes = temp[1]
    
    // Handle result
    if (IPErr) {
        return callback(IPErr, undefined)
    }

    const sourceTime      = IPRes.time
    const sourceDate      = IPRes.date
    const sourceTimeZone  = IPRes.timeZone
    const sourceDayOfWeek = IPRes.dayOfWeek
    const sourceDstActive = IPRes.dstActive


    // Get TimeZone data
    console.log("Getting source time zone data")
    // Define parameter
    const IPTimeZoneUrlParams = new URLSearchParams({
        timeZone: sourceTimeZone
    });

    // Get Request URL
    const IPTimeZoneUrlParamsString = IPTimeZoneUrlParams.toString();
    const IPTimeZoneRequestUrl          = new URL(`${timeZoneInfoPath}?${IPTimeZoneUrlParamsString}`, baseUrl);

    // Execute Get Request
    var temp = await makeRequest(IPTimeZoneRequestUrl)
    const IPTimeZoneErr = temp[0]
    const IPTimeZoneRes = temp[1]
    
    // Handle result
    if (IPTimeZoneErr) {
        return callback(IPZoneErr, undefined)
    } 
    
    const sourceUtcOffset = IPTimeZoneRes.currentUtcOffset
    

    return callback(
        undefined, {
            "target": {
                "time":      targetTime,
                "date":      targetDate,
                "timeZone":  targetTimeZone,
                "dayOfWeek": targetDayOfWeek,
                "dstActive": targetDstActive,
                "utcOffset": targetUtcOffset
            },
            "source": {
                "time":      sourceTime,
                "date":      sourceDate,
                "timeZone":  sourceTimeZone,
                "dayOfWeek": sourceDayOfWeek,
                "dstActive": sourceDstActive,
                "utcOffset": sourceUtcOffset
            }
        }
    )
}

export default temporalAnalysis;