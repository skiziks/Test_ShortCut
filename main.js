var eventList = [];

var Event = function (opening, recurring, startDate, endDate) {
    this.opening = opening;
    this.recurring = recurring;
    this.startDate = startDate;
    this.endDate = endDate;

    eventList.push(this);
};

Event.prototype.availabilities = function (fromDate, toDate) {

    // Formattage de l'heure pour l'afficher correctement avec 2 chiffres et les ":""
    function afficherHeure(heure, minutes) {
        var d = new Date();
        d.setHours(heure);
        d.setMinutes(minutes);
        return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }

    function getMonthString(month) {
        switch (month) {
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
        }
    }

    // Afficher les heures avec des virgules et un "and" pour la dernière heure
    function showHoursAvailabilities(availabilities) {
        if (availabilities.length <= 1) {
            return availabilities.join(", ");
        } else {
            return availabilities.slice(0, -1).join(", ") + " and " + availabilities.slice(-1);
        }
    }

    // Savoir le nombre d'évènements de chaque type
    let eventsCount_notOpening = eventList.filter(event => event.opening === false).length;
    let eventsCount_opening = eventList.filter(event => event.opening === true).length;

    // Afficher les messages de bases si il n'y a pas d'évènements ou pas de créneaux d'ouvert
    if (eventsCount_notOpening === 0) {
        console.log('No events scheduled');
        return;
    } else if (eventsCount_opening === 0) {
        console.log('The company is not available');
        return;
    }

    let startHourOpening = eventList[0].startDate.getHours();
    let startMinutesOpening = eventList[0].startDate.getMinutes();
    let endHourOpening = eventList[0].endDate.getHours();
    let endMinutesOpening = eventList[0].endDate.getMinutes();

    let availabilities = [];
    for (var for_startHour = startHourOpening, for_startMinutes = startMinutesOpening;
        for_startHour < endHourOpening || (for_startHour === endHourOpening && for_startMinutes < endMinutesOpening);) {

        availabilities.push(afficherHeure(for_startHour, for_startMinutes));

        for_startMinutes += 30;
        if (for_startMinutes >= 60) {
            for_startMinutes -= 60;
            for_startHour++;
        }
    }

    // Parcourir les évènements pour les enlever des créneaux disponibles
    for (let i = 0; i < eventList.length; i++) {
        let event = eventList[i];
        if (event.startDate >= fromDate && event.endDate <= toDate && !event.opening) {

            let startHour = event.startDate.getHours();
            let startMinutes = event.startDate.getMinutes();
            let endHour = event.endDate.getHours();
            let endMinutes = event.endDate.getMinutes();

            let startTimeInMinutes = startHour * 60 + startMinutes;
            let endTimeInMinutes = endHour * 60 + endMinutes;
            let differenceInMinutes = endTimeInMinutes - startTimeInMinutes;
            let numberOfSlotsScheduled = Math.floor(differenceInMinutes / 30);

            for (let j = 0; j < availabilities.length; j++) {
                let currentHour = parseInt(availabilities[j].split(":")[0]);
                let currentMinutes = parseInt(availabilities[j].split(":")[1]);

                if (currentHour === startHour && currentMinutes === startMinutes) {
                    availabilities.splice(j, numberOfSlotsScheduled);
                    break;
                }
            }
        }
    }

    // Afficher les créneaux disponibles
    if (availabilities.length === 0) {
        console.log("The company is not available");
        return;
    } else {
        console.log("I'm available from " + getMonthString(eventList[1].startDate.getMonth()) + " " + eventList[1].startDate.getDate() + "th, at " + showHoursAvailabilities(availabilities));
        console.log("I'm not available any other time !");
    }
};

let startDate = new Date(2016, 6, 1, 10, 30); // July 1st, 10:30
let endDate = new Date(2016, 6, 1, 14, 0); // July 1st, 14:00
new Event(true, true, startDate, endDate); // weekly recurring opening in calendar

startDate = new Date(2016, 6, 8, 10, 30); // July 8th 10:30
endDate = new Date(2016, 6, 8, 11, 30); // July 8th 12:30
new Event(false, false, startDate, endDate); // intervention scheduled

let fromDate = new Date(2016, 6, 4, 10, 0);
let toDate = new Date(2016, 6, 10, 10, 0);

Event.prototype.availabilities(fromDate, toDate);
