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
    function showHours(heure, minutes) {
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

    // Récupérer les occurrences d'un événement
    function getEventOccurrences(event, fromDate, toDate) {
        let occurrences = [];
        let start = new Date(event.startDate);
        let end = new Date(event.endDate);

        while (start <= toDate) {
            if (start >= fromDate && start <= toDate) {
                occurrences.push({
                    startDate: new Date(start),
                    endDate: new Date(end)
                });
            }
            start.setDate(start.getDate() + 7);
            end.setDate(end.getDate() + 7);
        }

        return occurrences;
    }

    let openings = [];
    let busySlots = [];

    // Récupérer les événements récurrents et non récurrents
    for (let event of eventList) {
        if (event.recurring) {
            let occurrences = getEventOccurrences(event, fromDate, toDate);
            if (event.opening) {
                openings.push(...occurrences);
            } else {
                busySlots.push(...occurrences);
            }
        } else {
            if (event.startDate >= fromDate && event.endDate <= toDate) {
                if (event.opening) {
                    openings.push(event);
                } else {
                    busySlots.push(event);
                }
            }
        }
    }

    if (openings.length === 0) {
        console.log('The company is not available');
        return;
    }

    let availabilities = [];

    // Créer les créneaux horaires
    for (let opening of openings) {
        let startHourOpening = opening.startDate.getHours();
        let startMinutesOpening = opening.startDate.getMinutes();
        let endHourOpening = opening.endDate.getHours();
        let endMinutesOpening = opening.endDate.getMinutes();

        let slots = [];
        for (let for_startHour = startHourOpening, for_startMinutes = startMinutesOpening;
            for_startHour < endHourOpening || (for_startHour === endHourOpening && for_startMinutes < endMinutesOpening);) {

            slots.push({
                time: showHours(for_startHour, for_startMinutes),
                hour: for_startHour,
                minutes: for_startMinutes
            });

            for_startMinutes += 30;
            if (for_startMinutes >= 60) {
                for_startMinutes -= 60;
                for_startHour++;
            }
        }

        availabilities.push({
            date: opening.startDate,
            slots: slots
        });
    }

    // Supprimer les créneaux horaires occupés
    for (let busySlot of busySlots) {
        for (let availability of availabilities) {
            if (busySlot.startDate.toDateString() === availability.date.toDateString()) {
                let startTimeInMinutes = busySlot.startDate.getHours() * 60 + busySlot.startDate.getMinutes();
                let endTimeInMinutes = busySlot.endDate.getHours() * 60 + busySlot.endDate.getMinutes();
                let differenceInMinutes = endTimeInMinutes - startTimeInMinutes;
                let numberOfSlotsScheduled = Math.floor(differenceInMinutes / 30);

                for (let i = 0; i < availability.slots.length; i++) {
                    let slotTime = availability.slots[i];
                    let currentHour = slotTime.hour;
                    let currentMinutes = slotTime.minutes;

                    if (currentHour === busySlot.startDate.getHours() && currentMinutes === busySlot.startDate.getMinutes()) {
                        availability.slots.splice(i, numberOfSlotsScheduled);
                        break;
                    }
                }
            }
        }
    }

    // Afficher les créneaux horaires disponibles
    for (let availability of availabilities) {
        if (availability.slots.length === 0) {
            console.log("The company is not available on " + availability.date.toDateString());
        } else {
            console.log("I'm available on " + getMonthString(availability.date.getMonth()) + " " + availability.date.getDate() + "th, at " + showHoursAvailabilities(availability.slots.map(slot => slot.time)));
        }
    }

    console.log("I'm not available any other time!");
};


// Tests

let startDate = new Date(2023, 5, 2, 9, 0); // June 2nd, 09:00
let endDate = new Date(2023, 5, 2, 17, 0); // June 2nd, 17:00
new Event(true, true, startDate, endDate); // weekly recurring opening

startDate = new Date(2023, 5, 2, 10, 0); // June 2th, 10:00
endDate = new Date(2023, 5, 2, 12, 0); // June 2th, 12:00
new Event(false, false, startDate, endDate); // one-time event

startDate = new Date(2023, 5, 2, 14, 0); // June 2nd, 14:00
endDate = new Date(2023, 5, 2, 15, 0); // June 2nd, 15:00
new Event(false, true, startDate, endDate); // weekly recurring event

// // Tests de vérification des disponibilités
let fromDate = new Date(2023, 5, 1, 0, 0); // June 1st, 00:00
let toDate = new Date(2023, 5, 15, 23, 59); // June 15th, 23:59
Event.prototype.availabilities(fromDate, toDate);

// I'm available on June 2th, at 09:00, 09:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm available on June 9th, at 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm not available any other time!

fromDate = new Date(2023, 5, 8, 0, 0); // June 8th, 00:00
toDate = new Date(2023, 5, 14, 23, 59); // June 14th, 23:59
Event.prototype.availabilities(fromDate, toDate);

// I'm available on June 9th, at 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm not available any other time!

fromDate = new Date(2023, 5, 1, 0, 0); // June 1st, 00:00
toDate = new Date(2023, 5, 30, 23, 59); // June 30th, 23:59
Event.prototype.availabilities(fromDate, toDate);

// I'm available on June 2th, at 09:00, 09:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm available on June 9th, at 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm available on June 16th, at 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm available on June 23th, at 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm available on June 30th, at 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 15:00, 15:30, 16:00 and 16:30
// I'm not available any other time!