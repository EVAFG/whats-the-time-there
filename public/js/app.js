/**
 * This is the client side script. 
 * This sends the plaintext address to server.
 * This renders the returned location and time data.
 */

console.log('Client side javascript file is loaded!')

const searchForm    = document.querySelector('form')
const searchElement = document.querySelector('input')

const messageOne    = document.querySelector('#message-1')
const messageTwo    = document.querySelector('#message-2')
const messageThree  = document.querySelector('#message-3')
const messageFour   = document.querySelector('#message-4')
const messageFive   = document.querySelector('#message-5')
const messageSix    = document.querySelector('#message-6')

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    const location = searchElement.value

    messageOne.textContent   = "Loading..."
    messageTwo.textContent   = ""
    messageThree.textContent = ""
    messageFour.textContent  = ""

    const getTimeUrl = `/getTime?${new URLSearchParams({location: location})}`

    fetch(getTimeUrl).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                messageOne.textContent = 'There was an error!'
                if(confirm("There was an error! \nWould you like to see the detailed error?")){
                    alert(data.error)
                }
                console.log(data.error)

            } else {
                console.log("1")
                // date time timezone, utc offset, your detected location (from IP), your timezone, timedelta you to target
                /*
                    {
                        "parsedLocation": parsedLocation,
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
                */
				
                messageOne.textContent   = `It is currently ${data.target.time} ${data.target.dayOfWeek}, ${data.target.date} `
                messageTwo.textContent   = ` at ${data.parsedLocation}; in time zone ${data.target.timeZone}`
                messageThree.textContent = `That is at UTC +/- ${(data.target.utcOffset.seconds)/3600} hours.`
                
                if ( (data.ipAddress) && (data.ipAddress !== "::1") ) {
                    messageFour.textContent  = `Offset from your current time ${(data.target.utcOffset.seconds - data.source.utcOffset.seconds)/3600} hours`
                } else {
                    messageFour.textContent  = `Your current time is not available, offset unknown.`
                }

                console.log(temporalAnalysisDataOne)
                console.log(temporalAnalysisDataTwo)
                console.log(temporalAnalysisDataThree)
                console.log(temporalAnalysisDataFour)
            }
        })
    })
})