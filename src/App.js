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
const events = [];

function App() {
  const [newEvent, setNewEvent] = useState({
    jobName: "",
    start: "",
    end: "",
    projectedHours: "",
    perDay: ""
  });

  const [allEvents, setAllEvents] = useState(events);
  const [modalEventIsOpen, setModalEventIsOpen] = useState(false);
  const [modalCreateEventIsOpen, setModalCreateEventIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});

  const [currentTitle, setCurrentTitle] = useState('');
  const [newTitle, setNewTitle] = useState("");
  const [newPerDay, setNewPerDay] = useState('');
  const [newProjection, setNewProjection] = useState('');

  const [formattedDate, setFormattedDate] = useState("");

  const handleModal = (mySetModal, myModal) => {
    console.log('Opening modal');
    mySetModal(!myModal);
  };

  const handleEventClicked = (event) => {
    setCurrentTitle(event.jobName);
    setSelectedEvent(event);
    let currentDate = event.start.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    setFormattedDate(currentDate)
    handleModal(setModalEventIsOpen, modalEventIsOpen);
  };

  const handleAddEvent = (userInput) => {
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
      eventColor: userInput.eventColor,
      events: [{}]
    }
    // I believe here is where we would want to post to the backend
    return job
  }

  const scheduleJob = (myJob, startIndex = 0) => {
    myJob.events = calculateJobEvents(myJob)
    // This updates the calendar for the user
    setAllEvents([...allEvents, ...myJob.events]);
    // Going to need a fetch patch to the database to update the backend
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
          title: `${myJob.jobName} -- ${myJob.perDay} / ${myJob.hoursLeft}`,
          jobName: myJob.jobName,
          start: new Date(myCurrentDate),
          end: new Date(myCurrentDate),
          initalHours: myJob.projectedHours,
          hoursLeft: myHoursLeft,
          perDay: myJob.perDay,
          eventColor: myJob.eventColor,
          eventIndex: myArray.length
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
  };

  const handleProjectionChange = (e) => {
    e.preventDefault();

    changeEventProjections(selectedEvent.jobName, newProjection)
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewProjection(''); // Resets the form
  };

  const changeEventProjections = (titleToFind, userInput) => {

    const updatedEvents = allEvents.map(event => {
      if (event.jobName === titleToFind) {
        let hoursLeft = (userInput - (event.initalHours - event.hoursLeft))
        return {
          ...event,
          title: `${event.jobName} -- ${event.perDay} / ${hoursLeft}`,
          hoursLeft: hoursLeft,
          initalHours: userInput
        };
      }
      return event;
    });
    // update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
  }

  const changeEventPerDayHours = (titleToFind, myIndex, newPerDay) => {
    let previousPerDay = 0;
    let previousHoursLeft = 0;
    const updatedEvents = allEvents.map(event => {
      if(event.jobName === titleToFind){
        if (myIndex === 0 && myIndex === event.eventIndex) {
          previousPerDay = newPerDay
          previousHoursLeft = event.hoursLeft;
          return {
            ...event,
            title: `${event.jobName} -- ${newPerDay} / ${event.hoursLeft}`,
            perDay: newPerDay
          };
        }
        if (myIndex === event.eventIndex) {
            let frank = previousHoursLeft - previousPerDay
            previousPerDay = newPerDay;
            previousHoursLeft = frank
            return {
              ...event,
              title: `${event.jobName} -- ${newPerDay} / ${frank}`,
              perDay: newPerDay
            };
        }
        if (myIndex > event.eventIndex) {
          previousPerDay = event.perDay;
          previousHoursLeft = event.hoursLeft
          return {...event}
        }
        if (myIndex < event.eventIndex) {
            let frank = previousHoursLeft - previousPerDay
            previousPerDay = event.perDay;
            previousHoursLeft = frank
            return {
              ...event,
              title: `${event.jobName} -- ${event.perDay} / ${frank}`
            };
        }

      }
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
      return event;
    });

    // now you can update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
  }

  // const changeEventDates = (titleToFind, newStartDate) => {
  //   const updatedEvents = allEvents.map(event => {
  //     if (event.jobName === titleToFind) {
  //       return {
  //         ...event,
  //         start: newStartDate,
  //         end: newStartDate
  //       };
  //     }
  //     return event;
  //   });

  //   // now you can update the original allEvents array with the updatedEvents array
  //   setAllEvents(updatedEvents);
  // }

  const handleRemoveDay = (event, jobName) => {
    let currentEvents = allEvents.filter(event => event.jobName === jobName);
    let filteredEvents = allEvents.filter((currentEvent) => currentEvent.jobName !== jobName);
    currentEvents.pop();
    const updatedEvents = [...filteredEvents, ...currentEvents];
    setAllEvents(updatedEvents);
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
    let newStartDate = new Date(highestEvent.start.getTime() + (24 * 60 * 60 * 1000));

    // Creates a copy of the previous last event, and adjusts the new info
    let newEvent = Object.assign({}, highestEvent);
    newEvent.eventIndex = highestEvent.eventIndex + 1
    newEvent.hoursLeft = highestEvent.hoursLeft - newEvent.perDay
    newEvent.start = newStartDate;
    newEvent.end = newStartDate;
    newEvent.title = `${newEvent.jobName} -- ${newEvent.perDay} / ${newEvent.hoursLeft}`;

    // Update the state with the new array of events
    const updatedEvents = [...allEvents, newEvent];
    setAllEvents(updatedEvents);

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
    // console.log(start)
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

    // Set the updated events using setAllEvents function
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
    const newEndDate = new Date(e.end);
    newEndDate.setDate(newEndDate.getDate() - 1);
    setNewEvent({ ...newEvent, start: e.start, end: newEndDate });

    if (modalEventIsOpen == false) {
      handleModal(setModalCreateEventIsOpen, modalCreateEventIsOpen)
    }
  }

  // function onDragStart({event}) {
  // }

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
        <button className="closeModalButton" onClick={() => handleModal(setModalEventIsOpen, modalEventIsOpen)}>Close</button>
      </ReactModal>

      <ReactModal overlayClassName="Overlay" className="modalBasic" isOpen={modalCreateEventIsOpen} onRequestClose={() => setModalCreateEventIsOpen(false)}>
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
            onChange={(e) =>
              setNewEvent({ ...newEvent, perDay: e.target.value })
            }
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
          <p>End Date: </p>
          <div className="datePickerContainer">
            <DatePicker
              placeholderText="End Date"
              selected={newEvent.end}
              onChange={(end) => setNewEvent({ ...newEvent, end })}
            />

          </div>
          <br></br>
          <select className="colorDropdown" onChange={handleColorDropdownChange}>
            <option value="blue" >Default Color</option>
            <option value="red" >Red</option>
            <option value="green" >Green</option>
            <option value="blue" >Blue</option>
            <option value="yellow" >Yellow</option>
            <option value="orange" >Orange</option>
            <option value="purple" >Purple</option>
          </select>
          <br></br>
          <button className="addEventButton" onClick={(e) => handleAddEvent(newEvent)}>
            {" "}
            Add Event{" "}
          </button>
        </div>
      </ReactModal>
      <div className="testing">
        <DnDCalendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleEventClicked}
          style={{ height: 700, margin: "20px", zIndex: 1 }}
          selectable={true}
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
                    color: event.eventColor === 'red' || event.eventColor === 'yellow' || event.eventColor === 'orange' ? 'black' : ''
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
