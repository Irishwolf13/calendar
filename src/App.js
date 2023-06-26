import "./App.css";
import { Calendar, dateFnsLocalizer} from "react-big-calendar";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isWeekend from "date-fns/isWeekend";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import React, { useState, useEffect, useRef } from "react";
// import Modal from "react-modal";
import ReactModal from "react-modal";
import myImage from './images/reliable_design_logo2.jpg';

ReactModal.setAppElement("#root");

const DnDCalendar = withDragAndDrop(Calendar)
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const events = [

];

function App() {
  const [newEvent, setNewEvent] = useState({
    jobName: "",
    start: "",
    end: "",
    projectedHours: "",
    perDay: ""
  });

  const [allEvents, setAllEvents] = useState(events);
  const [selectedEvent, setSelectedEvent] = useState({});

  const [modalEventIsOpen, setModalEventIsOpen] = useState(false);
  const [modalCreateEventIsOpen, setModalCreateEventIsOpen] = useState(false);

  const [currentTitle, setCurrentTitle] = useState('');
  const [newTitle, setNewTitle] = useState("");
  const [newPerDay, setNewPerDay] = useState('');
  const [newProjection, setNewProjection] = useState('');

  const [formattedDate, setFormattedDate] = useState("");
  const [isSelectable, setIsSelectable] = useState(true);

  const handleModal = (mySetModal, myModal) => {
    mySetModal(!myModal);
  };
  const handleEventClicked = (event) => {
    setIsSelectable(false)
    setCurrentTitle(event.jobName);
    console.log("Clicked Event: ", JSON.stringify(event))
    setSelectedEvent(event);
    let currentDate = event.start.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    setFormattedDate(currentDate)
    handleModal(setModalEventIsOpen, modalEventIsOpen);
  };

  const handleAddEvent = (e, userInput) => {
    e.preventDefault()
    if(userInput.jobName === '' ) {
      alert('You must have an Event Title') 
      return}

    if(userInput.projectedHours === '' || userInput.projectedHours === "0") {
      alert('You must have Projected Hours')
      return
    }
    if(userInput.perDay === "" || userInput.perDay === "0") {
      alert('You must have a Per Day Rate')
      return
    }
    // Checks to make sure a job doesn't already exist with the same name
    if (allEvents.some(event => event.jobName === userInput.jobName)) {
      alert(`An event with job name "${userInput.jobName}" already exists`);
      return
    }
    let jobToSchedule = createJob(userInput)
    scheduleJob(jobToSchedule)
    handleModal(setModalCreateEventIsOpen, modalCreateEventIsOpen); // Closes Modal
    setNewEvent({
      jobName: "",
      start: "",
      end: "",
      projectedHours: "",
      perDay: ""
    })
  };

  const createJob = (userInput) => {
    let job = {
      jobName: userInput.jobName,
      start: userInput.start,
      end: userInput.end,
      projectedHours: userInput.projectedHours,
      perDay: userInput.perDay,
      eventColor: userInput.eventColor
    }
    return job
  }

  const scheduleJob = (myJob, startIndex = 0) => {
    myJob.events = calculateJobEvents(myJob)
    console.log('myJob.events: ', myJob.events)
    // Post to back end here
    // This is where the job itself is posting to the backend, without event information
    // I believe the job SHOULD have the event information in it, but I'm not sure I've built
    // this up correctly and here it is hurting.
    let myAdjustedJob = adjustForJSON(myJob)
    saveJob(myAdjustedJob)
    // This is where I have an array of events that I would like to post to the events backend.
    // If I could get this bit to work, I believe the rest of the site would fall into line.
    // It might not be the best solution, but it would work.
    console.log(JSON.stringify(myJob.events))
    fetch('http://localhost:3000/events',{
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(myJob.events)
    })
    .then(res => res.json())
    .then(data => console.log("Data: ",data))

    // This updates the calendar for the user
    setAllEvents([...allEvents, ...myJob.events]);
    // Going to need a fetch patch to the database to update the backend
  }

  const saveJob = (jobToSave) => {
    fetch('http://localhost:3000/jobs',{
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(jobToSave)
    })
    .then(res => {
      if (res.ok) {
        alert('Monster Saved!');
      }
      return res.json();
    })
    .then(data => {
      console.log(data)
    })
    .catch(error => alert(`Error: ${error.message}`))
  }

  const adjustForJSON = (object) => {
    const adjustedObject = {
      job_name: object.jobName,
      start: object.start,
      end: object.end,
      projected_hours: object.projectedHours,
      per_day: object.perDay,
      color: object.eventColor,
      events: object.events
    }
    return adjustedObject;
  }

  const calculateJobEvents = (myJob) => {
    myJob.hoursLeft = myJob.projectedHours;
    let myArray = [];
    let myHoursLeft = myJob.projectedHours;
    let myCurrentDate = myJob.start;
    let isFirstIteration = true;

    while (myHoursLeft >= (0 - myHoursLeft)) {
      myHoursLeft -= myJob.perDay;
      if (!isFirstIteration) {
        myCurrentDate.setDate(myCurrentDate.getDate() + 1);
        myJob.hoursLeft -= myJob.perDay;
      }
      isFirstIteration = false;

      if(isWeekend(myCurrentDate)) {
      myCurrentDate.setDate(myCurrentDate.getDate() + 2);
      }

      if(myHoursLeft < 0) {
        myJob.perDay = parseInt(myJob.perDay) + myHoursLeft
      }

      if(myJob.perDay !== 0) {
        myArray.push({
          job_id: 1,
          title: `${myJob.jobName} -- ${myJob.perDay} / ${myJob.hoursLeft}`,
          job_name: myJob.jobName,
          start: new Date(myCurrentDate),
          end: new Date(myCurrentDate),
          inital_hours: myJob.projectedHours,
          hours_left: myHoursLeft,
          per_day: myJob.perDay,
          color: myJob.eventColor,
          index: myArray.length,
          projected_hours: 0
        });
      }
    }
    return myArray;
  }

  const handleNameChange = (e) => {
    e.preventDefault();
    // Checks to make sure the job name isn't blank or in use
    if (newTitle === '') {
      alert('Name change cannot be blank');
      return
    } else if (allEvents.some(event => event.jobName === newTitle)) {
      alert(`An event with title "${newTitle}" already exists.`);
      return
    }

    changeEventTitles(currentTitle, newTitle);
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewTitle(''); // Resets the form
  };

  const handlePerDayChange = (e) => {
    e.preventDefault();

    let userInput = newPerDay  // Grab the user's input
    changeEventPerDayHours(selectedEvent.jobName, selectedEvent.eventIndex, userInput)
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewPerDay(''); // Resets the form
    setIsSelectable(true)
  };

  const handleProjectionChange = (e) => {
    e.preventDefault();

    changeEventProjections(selectedEvent.jobName, newProjection)
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewProjection(''); // Resets the form
    setIsSelectable(true)
  };

  const changeEventProjections = (titleToFind, userInput) => {
    // We need these two variables for the first iteration
    let titleHours = null
    let titleRemaining = null
    const updatedEvents = allEvents.map(event => {
      if (event.jobName === titleToFind) {
        if(titleHours === null) {
          titleHours = userInput
          // This sets up the next iteration
          titleRemaining = event.perDay
        } else {
          titleHours = titleHours - titleRemaining
          // This sets up the next iteration
          titleRemaining = event.perDay
        }
        let hoursLeft = (userInput - (event.initalHours - event.hoursLeft))
        return {
          ...event,
          title: `${event.jobName} -- ${event.perDay} / ${titleHours}`,
          hoursLeft: hoursLeft,
          initalHours: userInput
        };
      }
      return event;
    });
    // update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
    setIsSelectable(true)
  }

  const changeEventPerDayHours = (titleToFind, myIndex, newPerDay) => {
    newPerDay = parseInt(newPerDay)
    let previousPerDay = 0;
    let hoursRemaining = 0;
    let tempHours = 0;
    const updatedEvents = allEvents.map(event => {
      if(event.jobName === titleToFind){
        if (myIndex === 0 && myIndex === event.eventIndex) {
          hoursRemaining = parseInt(event.initalHours);
          previousPerDay = parseInt(newPerDay)
          return {
            ...event,
            title: `${event.jobName} -- ${newPerDay} / ${parseInt(event.initalHours)}`,
            perDay: parseInt(newPerDay),
            hoursLeft: (parseInt(event.hoursLeft) + (parseInt(event.perDay) - parseInt(newPerDay)))
          };
        }
        if (myIndex > event.eventIndex) {
          hoursRemaining = parseInt(event.hoursLeft)
          previousPerDay = parseInt(event.perDay);
          return {...event}
        }
        if (myIndex === event.eventIndex) {
          hoursRemaining = parseInt(hoursRemaining);
          previousPerDay = parseInt(newPerDay)
          // let frank = (parseInt(event.hoursLeft) + (parseInt(event.perDay) - parseInt(newPerDay)))
          return {
            ...event,
            title: `${event.jobName} -- ${newPerDay} / ${hoursRemaining}`,
            perDay: parseInt(newPerDay),
            hoursLeft: (parseInt(event.hoursLeft) + (parseInt(event.perDay) - parseInt(newPerDay)))
          };
        }
        if (myIndex < event.eventIndex) {
          hoursRemaining = parseInt(hoursRemaining) - parseInt(previousPerDay)
          previousPerDay = parseInt(event.perDay);
          return {
            ...event,
            title: `${event.jobName} -- ${event.perDay} / ${hoursRemaining}`,
            hoursLeft: (parseInt(event.hoursLeft) + (parseInt(event.perDay) - parseInt(newPerDay)))
          };
        }
      }
      setIsSelectable(true)
      return event;
    });
    // update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
  }

  const changeEventTitles = (titleToFind, changeTitle) => {
    const updatedEvents = allEvents.map(event => {
      if (event.jobName === titleToFind) {
        return {
          ...event,
          jobName: changeTitle,
          title: `${changeTitle} -- ${event.perDay} / ${event.hoursLeft}`
        };
      }
      setIsSelectable(true)
      return event;
    });

    // now you can update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
  }

  const handleRemoveDay = (event, jobName) => {
    let currentEvents = allEvents.filter(event => event.jobName === jobName);
    let filteredEvents = allEvents.filter((currentEvent) => currentEvent.jobName !== jobName);
    currentEvents.pop();
    const updatedEvents = [...filteredEvents, ...currentEvents];
    setAllEvents(updatedEvents);
    setIsSelectable(true)
    if(currentEvents.length === 0) {
      handleModal(setModalEventIsOpen, modalEventIsOpen); // Not sure I want this to close yet...
    }
  }

  const handleAddDay = (event, jobName) => {
    const filteredEvents = allEvents.filter(event => event.jobName === jobName);
    const highestEvent = filteredEvents.reduce((highest, current) => {
      if (current.eventIndex > highest.eventIndex) {
        return current;
      } else {
        return highest;
      }
    }, { eventIndex: -1 });

    // Create a new Date object with highestEvent.start and add one day
    let newStartDate = new Date(highestEvent.start.getTime() + (86400000));

    // This will make it skip the weekend dates
    while(isWeekend(newStartDate)) {
      newStartDate = new Date(newStartDate.getTime() + (86400000))
    }


    // Creates a copy of the previous last event, and adjusts the new info
    let newEvent = Object.assign({}, highestEvent);
    newEvent.eventIndex = highestEvent.eventIndex + 1
    newEvent.title = `${newEvent.jobName} -- ${newEvent.perDay} / ${newEvent.hoursLeft}`;
    newEvent.hoursLeft = highestEvent.hoursLeft - newEvent.perDay
    newEvent.start = newStartDate;
    newEvent.end = newStartDate;

    // Update the state with the new array of events
    const updatedEvents = [...allEvents, newEvent];
    setAllEvents(updatedEvents);
    setIsSelectable(true)

    // handleModal(setModalEventIsOpen, modalEventIsOpen); // Not sure I want this to close yet...
  }


  function onEventDrop({event, start, end}) {
    // Make sure events can't have a date earlier than their previous Index
    if(event.eventIndex > 0) {
      const prevEvent = allEvents.find(e => e.jobName === event.jobName && e.eventIndex === event.eventIndex - 1);
      if (start.getTime() <= prevEvent.start.getTime()) {
        return
      }
    }
    // Difference between original event start date and new start date
    const differenceOfDates = start.getTime() - event.start.getTime();

    // Declare updated events as an empty array to avoid a reference error
    let updatedEvents = [];
    // Map over all events and update the start and end dates based on the differenceOfDates
    let newCurrentEvent = '';
    updatedEvents = allEvents.map((currentEvent, index) => {
      if(currentEvent.jobName === event.jobName && currentEvent.eventIndex === event.eventIndex){
        let adjustedStart = new Date(currentEvent.start.getTime() + differenceOfDates);
        let adjustedEnd = new Date(currentEvent.end.getTime() + differenceOfDates);
        newCurrentEvent = {
          ...currentEvent,
          start: adjustedStart,
          end: adjustedEnd
        }
        return {
          ...currentEvent,
          start: adjustedStart,
          end: adjustedEnd
        }
      }
      if(currentEvent.jobName === event.jobName && currentEvent.eventIndex > event.eventIndex) {
        if (newCurrentEvent) {
          const adjustedStart = new Date(newCurrentEvent.start.getTime() + 86400000);
          const adjustedEnd = new Date(newCurrentEvent.start.getTime() + 86400000);

          // Set the updated start and end times
          currentEvent.start = adjustedStart;
          currentEvent.end = adjustedEnd;

          newCurrentEvent = currentEvent;
        }
        adjustForWeekend(currentEvent)
      }
      return {...currentEvent}
    });

    setAllEvents(updatedEvents);
  }

  const adjustForWeekend = (myEvent) => {
    while(isWeekend(myEvent.start)) {
      const adjustedStart = new Date(myEvent.start.getTime() + 86400000);
      const adjustedEnd = new Date(myEvent.start.getTime() + 86400000);
      // Set the updated start and end times
      myEvent.start = adjustedStart;
      myEvent.end = adjustedEnd;
    }
  }

  const handleColorDropdownChange = (e) => {
    setNewEvent({ ...newEvent, eventColor: e.target.value });
  }

  const onSelectSlot = (e) => {
    // The next two lines adjust for onSelectSlot always choosing the end date 1 day after it should... not sure why.
    console.log("e.Start: ",e.start)
    console.log("e.End: ",e.end)
    const newEndDate = new Date(e.end);
    newEndDate.setDate(newEndDate.getDate() - 1);
    setNewEvent({ ...newEvent, start: e.start, end: newEndDate });

    if (modalEventIsOpen == false) {
      handleModal(setModalCreateEventIsOpen, modalCreateEventIsOpen)
    }
  }

  // function onDragStart({event}) {
  // }

  const handleCloseEdit = () => {
    handleModal(setModalEventIsOpen, modalEventIsOpen)
    setIsSelectable(true)
  }

  return (
    <div className="App">
      <img className="mainLogo" src={myImage} alt="Reliable Design Logo"/>
      <button onClick={() => handleModal(setModalCreateEventIsOpen, modalCreateEventIsOpen)}>Create New Event</button>

      <ReactModal overlayClassName="Overlay" className="modalBasic" isOpen={modalEventIsOpen} onRequestClose={() => setModalEventIsOpen(false)}>
        <button className="deleteButton" onClick={(e) => handleAddDay(e, selectedEvent.jobName)}>Add Day</button>
        <button className="deleteButton" onClick={(e) => handleRemoveDay(e, selectedEvent.jobName)}>Remove Day</button>
        <h2>{`${selectedEvent.jobName} - ${formattedDate}`}</h2>
        <div>
        <form onSubmit={handleNameChange}>
          <label>
            Name Change :
            <input
              type="text"
              placeholder={selectedEvent.jobName}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        <form onSubmit={handleProjectionChange}>
          <label>
            Job Projection :
            <input
              type="number"
              placeholder={selectedEvent.initalHours}
              value={newProjection}
              onChange={(e) => setNewProjection(e.target.value)}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        <form onSubmit={handlePerDayChange}>
          <label>
            Hours Per Day :
            <input
              type="number"
              placeholder={selectedEvent.perDay}
              value={newPerDay}
              onChange={(e) => setNewPerDay(e.target.value)}
              autoFocus
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        </div>
        <button className="closeModalButton" onClick={() => handleCloseEdit()}>Close</button>
      </ReactModal>

      <ReactModal overlayClassName="Overlay" className="modalBasic" isOpen={modalCreateEventIsOpen} onRequestClose={() => setModalCreateEventIsOpen(false)}>
        <form>
          <div className="mainContainer">
            <p>Event Title: </p>
            <input
              type="text"
              placeholder="Add Title for Event"
              className="titleInput"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, jobName: e.target.value })
              }
              autoFocus
            />
            <br></br>
            <p>Projected Hours: </p>
            <input
              type="number"
              placeholder="Enter Projected hours"
              value={newEvent.projectedHours}
              onChange={(e) =>
                setNewEvent({ ...newEvent, projectedHours: e.target.value })
              }
            />
            <br></br>
            <p>PerDay Hour Rate: </p>
            <input
              type="number"
              placeholder="Enter Daily Hours"
              value={newEvent.perDay}
              onChange={(e) => setNewEvent({ ...newEvent, perDay: e.target.value })}
            />
            <br></br>
            <p>Start Date: </p>
            <div className="datePickerContainer">
              <DatePicker
                placeholderText="Start Date"
                selected={newEvent.start}
                onChange={(start) => setNewEvent({ ...newEvent, start })}
              />
            </div>
            <br></br>
            {/* <p>End Date: </p>
          <div className="datePickerContainer">
            <DatePicker
              placeholderText="End Date"
              selected={newEvent.end}
              onChange={(end) => setNewEvent({ ...newEvent, end })}
            />

          </div> */}
            <br></br>
            <select className="colorDropdown" onChange={handleColorDropdownChange}>
              <option value="rgb(55, 55, 255)">Default Color</option>
              <option value="rgb(55, 55, 255)">Blue</option>
              <option value="rgb(172, 236, 253)">Light Blue</option>
              <option value="rgb(0, 129, 0)">Green</option>
              <option value="rgb(132, 0, 132)">Purple</option>
              <option value="rgb(255, 63, 172)">Pink</option>
              <option value="rgb(255, 0, 0)">Red</option>
              <option value="rgb(255, 255, 0)">Yellow</option>
              <option value="rgb(255, 166, 0)">Orange</option>
            </select>
            <br></br>
            <button type="submit" className="addEventButton" onClick={(e) => handleAddEvent(e, newEvent)}>
              {" "}
              Add Event{" "}
            </button>
          </div>
        </form>
      </ReactModal>
      <div className="testing">
        <DnDCalendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleEventClicked}
          style={{ height: 700, margin: "20px", zIndex: 1 }}
          selectable={isSelectable}
          resizable={false}
          draggableAccessor={(event) => true}
          onEventDrop={onEventDrop}
          // onDragStart={onDragStart}
          onSelectSlot={onSelectSlot}
          eventPropGetter={(event) =>
            event.eventColor
              ? {
                  style: {
                    background: event.eventColor,
                    color: event.eventColor === 'rgb(172, 236, 253)' || event.eventColor === 'rgb(255, 255, 0)' || event.eventColor === 'orange' ? 'black' : ''
                  }
                }
              : {}
          }
        />
      </div>
    </div>
  );
}

export default App;
