const request = require('request')

function temporalAnalysis(latitude, longitude, ipAddress, callback) {
	/** 
	 * This is the function that gets the forecasted
	 *  data, given a location.
	 * Inputs are numbers latitude and longitude.
	 * Outputs either an error or a formatted 
	 *  array with the string data requested split
	 *  into lines. It is ready to be displayed.
	 */

    function makeRequest(url) {
        return request({ url, json: true }, (error, { body }) => {
            if (error) {
                return ['Unable to connect to time API service!', undefined]
            } else if (body.error) {
                return ['Unable to find location or IP', undefined]
            } else {
                return [undefined, body]
            }
        })
    }
    console.log("2")

    
    // Define base urls and API urls
    const baseUrlStr = "https://timeapi.io"
    const baseUrl    = new URL("/", baseUrlStr)
    
    const coordinateTimeUrl = new URL("api/Time/current/coordinate", baseUrl)
    const IPTimeUrl         = new URL("api/Time/current/ip", baseUrl)
    const timeZoneInfoUrl   = new URL("api/TimeZone/zone", baseUrl)

    ////////////////
    //// Target ////
    ////////////////
    // Get target time and data using coordinates
    // Define parameter
    const coordinateTimeUrlParams = new URLSearchParams({
        longitude: latitude,
        latitude: longitude
    });

    // Get Request URL
    const coordinateTimeRequestUrl = new URL(coordinateTimeUrlParams, coordinateTimeUrl)
    
    // Execute Get Request
    temp = makeRequest(coordinateTimeRequestUrl)
    console.log(temp.callback())
    coordinateErr = temp[0]
    coordinateRes = temp[1]
    
    // Handle result
    if (coordinateErr) {
        return [coordinateErr, undefined]
    } 
    //console.log(temp)
    
    targetTime      = coordinateRes.time
    targetDate      = coordinateRes.date
    targetTimeZone  = coordinateRes.timeZone
    targetDayOfWeek = coordinateRes.dayOfWeek
    targetDstActive = coordinateRes.dstActive

    // Get TimeZone data
    // Define parameter
    const coordinateTimeZoneUrlParams = new URLSearchParams({
        timeZone: targetTimeZone
    });

    // Get Request URL
    const coordinateTimeZoneRequestUrl = new URL(coordinateTimeZoneUrlParams, timeZoneInfoUrl)


    // Execute Get Request
    temp = makeRequest(coordinateTimeZoneRequestUrl)
    coordinateTimeZoneErr = temp[0]
    coordinateTimeZoneRes = temp[1]
    
    // Handle result
    if (coordinateTimeZoneErr) {
        return [coordinateTimeZoneErr, undefined]
    } 
    targetUtcOffset = coordinateTimeZoneRes.currentUtcOffset


    ////////////////
    //// Source ////
    ////////////////
    // Get user's current time and data using IP address
    // Define parameter
    const IPTimeUrlParams  = new URLSearchParams({
        ip: ipAddress
    });
    
    // Get Request URL
    const IPTimeRequestUrl = new URL(IPTimeUrlParams, baseIPTimeUrlUrl)

    // Execute Get Request
    temp = makeRequest(coordinateTimeRequestUrl)
    IPErr = temp[0]
    IPRes = temp[1]
    
    // Handle result
    if (IPErr) {
        return [IPErr, undefined]
    }
    sourceTime      = IPRes.time
    sourceDate      = IPRes.date
    sourceTimeZone  = IPRes.timeZone
    sourceDayOfWeek = IPRes.dayOfWeek
    sourceDstActive = IPRes.dstActive


    // Get TimeZone data
    // Define parameter
    const IPTimeZoneUrlParams = new URLSearchParams({
        timeZone: sourceTimeZone
    });

    // Get Request URL
    const IPTimeZoneRequestUrl = new URL(IPTimeZoneUrlParams, timeZoneInfoUrl)

    // Execute Get Request
    temp = makeRequest(IPTimeZoneRequestUrl)
    IPTimeZoneErr = temp[0]
    IPTimeZoneRes = temp[1]
    
    // Handle result
    if (IPTimeZoneErr) {
        return [IPZoneErr, undefined]
    } 
    sourceUtcOffset = IPTimeZoneRes.currentUtcOffset
    

    return [undefined, {
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
    }]
}

module.exports = temporalAnalysis