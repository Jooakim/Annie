var exports = module.exports = {};

exports.getMedications = function(userId) {
    // Connect to database and extract medictions
    
    // Used for testing
<<<<<<< HEAD
    var medJson = {"name":"Weed", "dosage":"1g", "timePerDay":"20:00"};
    return getTimeForMedication(medJson);
=======
    var medJson = {name:"Weed", dosage:"1g", timePerDay:"20:00"};
    return getTimeForMedication(medJson);
}

exports.getDummyJson = function(userId){
    var medJson = {name:"rolf", dosage:"1g"};
    return medJson;
>>>>>>> 15db65b1e75b9922e91d1828d0844e12c636e0aa
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
        if (timeInMinutes < 0) {
            timeInHours--;
            timeInMinutes += 60;
        }

        timeToNotify = timeInHours >= 0 && timeToNotifyUser(timeInHours, timeInMinutes);
    }

    if (timeToNotify) {
        var timeToNextMedication = timeInHours + " hours and " + timeInMinutes + " minutes";
        return createScheduleResponse(medicationSchedule, timeToNextMedication);
    }
    return currentHour + "hours " + currentMinute + "minutes";
}

function timeToNotifyUser(timeInHours, timeInMinutes) {
    const hoursLeftForNotification = 3;
    const minutesLeftForNotification = 30;

    return timeInHours*60 + timeInMinutes <= hoursLeftForNotification*60 + minutesLeftForNotification;
}
function createScheduleResponse(medicationSchedule, timeToNextMedication) {
   var message;
   if (timeToNextMedication != "") {
       message = "Time to take " + medicationSchedule.name + " in " + timeToNextMedication;
   }
   return message;

}

