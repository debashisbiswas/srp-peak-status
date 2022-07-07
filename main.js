// https://www.srpnet.com/prices/home/tou.aspx

// false is off-peak, true is on-peak.
// prices: in kWh
// times: the hour that the associated peak status begins.
// times assume MST (GMT-7)
const timePlans = {
    "winter": {
        "prices": {
            false: 7.38,
            true: 9.98,
        },
        "times": {
            00: false,
            05: true,
            09: false,
            17: true,
            21: false,
        }
    },
    "summer": {
        "prices": {
            false: 7.56,
            true: 21.23,
        },
        "times": {
            00: false,
            14: true,
            20: false,
        }
    },
    "summerPeak": {
        "prices": {
            false: 7.59,
            true: 24.38,
        },
        "times": {
            00: false,
            14: true,
            20: false,
        }
    },
}

const months = {
    /* JAN */ 00: timePlans["winter"],
    /* FEB */ 01: timePlans["winter"],
    /* MAR */ 02: timePlans["winter"],
    /* APR */ 03: timePlans["winter"],
    /* MAY */ 04: timePlans["summer"],
    /* JUN */ 05: timePlans["summer"],
    /* JUL */ 06: timePlans["summerPeak"],
    /* AUG */ 07: timePlans["summerPeak"],
    /* SEP */ 08: timePlans["summer"],
    /* OCT */ 09: timePlans["summer"],
    /* NOV */ 10: timePlans["winter"],
    /* DEC */ 11: timePlans["winter"],
}

const updateState = () => {
    const now = new Date()
    const month = now.getMonth()
    const hour = now.getHours()
    const outputElement = document.getElementById("output")

    const currentTimePlan = months[month]
    const isWeekend = now.getDay() == 0 || now.getDay() == 6

    let message = ""
    let footer = ""

    // Defaults for weekends and specific holidays.
    let currentPeakStatus = false
    let currentPrice = currentTimePlan["prices"][false]

    // TODO: Also skip if it's one of the holidays listed on their website.
    if (!isWeekend) {
        let nextPeakTime = 0
        for (time in currentTimePlan["times"]) {
            if (time > hour) {
                nextPeakTime = time
                break
            }
            currentPeakStatus = currentTimePlan["times"][time]
        }

        currentPrice = currentTimePlan["prices"][currentPeakStatus]
        const nextPeakStatus = currentTimePlan["times"][nextPeakTime]
        nextPrice = currentTimePlan["prices"][nextPeakStatus]

        // Set relevant properties on the date so they are properly subtracted.
        nextPeakAsDate = new Date()
        nextPeakAsDate.setHours(nextPeakTime)
        nextPeakAsDate.setMinutes(0)
        nextPeakAsDate.setSeconds(0)

        const secondsToNextPeak = (nextPeakAsDate - now) / 1000
        const hoursToNextPeak = Math.floor(secondsToNextPeak / 3600)
        const minutesToNextPeak = Math.ceil(
            (secondsToNextPeak - (hoursToNextPeak * 3600))
            / 60
        )

        if (nextPeakTime == 0) {
            footer = '<p class="italic-sub">for the rest of the day</p>'
        }
        else {
            footer = `
                <hr>
                <h2 class="${nextPeakStatus ? 'text-red' : 'text-green'}">
                    NEXT ${nextPeakStatus ? 'ON-PEAK' : 'OFF-PEAK'}:
                    ${nextPeakTime % 12} ${nextPeakTime > 12 ? 'PM' : 'AM'}
                    <br>
                    (in ${hoursToNextPeak ? hoursToNextPeak + ' hr, ' : ''} ${minutesToNextPeak} min)
                </h2>
                <p class="italic-sub-small">
                    ${nextPrice} ¢/kWh
                </p>
            `
        }
    }

    const currentTime = now.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
    });

    message = `
        <h1 id="time">
            ${currentTime}
        </h1>
        <h1 class="${currentPeakStatus ? 'text-red' : 'text-green'}">
            NOW ${currentPeakStatus ? 'ON-PEAK' : 'OFF-PEAK'}
        </h1>
        <p class="italic-sub">
            ${currentPrice} ¢/kWh
        </p>
    `
    message += footer
    outputElement.innerHTML = message
}

updateState()
setInterval(updateState, 1000)
