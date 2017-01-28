export function getMedications(userId) {
    // Connect to database and extract medictions
    
    // Used for testing
    var medJson = {"name":"Weed", "dosage":"1g", "timePerDay":"08:00"};
    getTimeForMedication(medJson);
}

function getTimeForMedication(medicationSchedule) {
    var date = new Date();

    var currentHour = date.getHours();
    var currentMinute = date.getMinutes();
    var timeToNotify = false;

    if (medicationSchedule.timePerDay != "") {
        var tmpTime = medicationSchedule.timePerDay.split(":");
        var timeInHours = parseInt(tmpTime[0]) - currentHour;
        var timeInMinutes = parseInt(tmpTime[1]) - currentMinute;

        timeToNotify = timeInHours >= 0 && timeToNotifyUser(timeInHours, timeInMinutes);
    }

    if (timeToNotify) {
        var timeToNextMedication = timeInHours + " hours and " + timeInMinutes + " minutes";
        createScheduleResponse(medicationSchedule, timeToNextMedication);
    }
}

function timeToNotifyUser(timeInHours, timeInMinutes) {
    const hoursLeftForNotification = 0;
    const minutesLeftForNotification = 30;

    return timeInHours*60 + timeInMinutes <= hoursLeftForNotification*60 + minutesLeftForNotification;
}
function createScheduleResponse(medicationSchedule, timeToNextMedication) {
   var message;
   if (timeToNextMedication != "") {
       message = "Time to take " + medicationSchedule.name + " in " + timeToNextMedication;
   }

   console.log(message);
}


var exports = module.exports = {};
