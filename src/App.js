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
    job_name: "",
    start: "",
    end: "",
    projected_hours: "",
    per_day: ""
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
    console.log(selectedEvent)
    setIsSelectable(false)
    setCurrentTitle(event.job_name);
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
    if(userInput.job_name === '' ) {
      alert('You must have an Event Title') 
      return}

    if(userInput.projected_hours === '' || userInput.projected_hours === "0") {
      alert('You must have Projected Hours')
      return
    }
    if(userInput.per_day === "" || userInput.per_day === "0") {
      alert('You must have a Per Day Rate')
      return
    }
    // Checks to make sure a job doesn't already exist with the same name
    if (allEvents.some(event => event.job_name === userInput.job_name)) {
      alert(`An event with job name "${userInput.job_name}" already exists`);
      return
    }
    let jobToSchedule = createJob(userInput)
    scheduleJob(jobToSchedule)
    handleModal(setModalCreateEventIsOpen, modalCreateEventIsOpen); // Closes Modal
    setNewEvent({
      job_name: "",
      start: "",
      end: "",
      projected_hours: "",
      per_day: ""
    })
  };

  const createJob = (userInput) => {
    let job = {
      job_name: userInput.job_name,
      start: userInput.start,
      end: userInput.end,
      projected_hours: userInput.projected_hours,
      per_day: userInput.per_day,
      color: userInput.color
    }
    return job
  }

  const scheduleJob = (myJob, startIndex = 0) => {
    myJob.events = calculateJobEvents(myJob)
    fetch('http://localhost:3000/jobs',{
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(myJob)
    })
    .then(res => {
      // console.log(JSON.stringify(myJob.events))
      fetch('http://localhost:3000/events',{
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(myJob.events)
      })
      .then(res => res.json())
      // .then(data => console.log("Data: ",data))

      // This updates the calendar for the user
      setAllEvents([...allEvents, ...myJob.events]);
      // return res.json();
    })
    // .then(data => {
    //   console.log(allEvents)
    // })
    .catch(error => alert(`Error: ${error.message}`))
  }


  // const saveJob = (myAdjustedJob) => {
  //   fetch('http://localhost:3000/jobs',{
  //     method: 'POST',
  //     headers: {'content-type': 'application/json'},
  //     body: JSON.stringify(myAdjustedJob)
  //   })
  //   .then(res => {
  //     if (res.ok) {
  //       alert('Monster Saved!');
  //     }
  //     return res.json();
  //   })
  //   .then(data => {
  //     console.log(data)
  //   })
  //   .catch(error => alert(`Error: ${error.message}`))
  // }

  // const adjustForJSON = (object) => {
  //   const adjustedObject = {
  //     job_name: object.job_name,
  //     start: object.start,
  //     end: object.end,
  //     projected_hours: object.projected_hours,
  //     per_day: object.per_day,
  //     color: object.color,
  //     events: object.events
  //   }
  //   return adjustedObject;
  // }

  const calculateJobEvents = (myJob) => {
    myJob.hours_left = myJob.projected_hours;
    let myArray = [];
    let myhours_left = myJob.projected_hours;
    let myCurrentDate = myJob.start;
    let isFirstIteration = true;

    while (myhours_left >= (0 - myhours_left)) {
      myhours_left -= myJob.per_day;
      if (!isFirstIteration) {
        myCurrentDate.setDate(myCurrentDate.getDate() + 1);
        myJob.hours_left -= myJob.per_day;
      }
      isFirstIteration = false;

      if(isWeekend(myCurrentDate)) {
      myCurrentDate.setDate(myCurrentDate.getDate() + 2);
      }

      if(myhours_left < 0) {
        myJob.per_day = parseInt(myJob.per_day) + myhours_left
      }

      if(myJob.per_day !== 0) {
        myArray.push({
          job_id: 1,
          title: `${myJob.job_name} -- ${myJob.per_day} / ${myJob.hours_left}`,
          job_name: myJob.job_name,
          start: new Date(myCurrentDate),
          end: new Date(myCurrentDate),
          inital_hours: myJob.projected_hours,
          hours_left: myhours_left,
          per_day: myJob.per_day,
          color: myJob.color,
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
    } else if (allEvents.some(event => event.job_name === newTitle)) {
      alert(`An event with title "${newTitle}" already exists.`);
      return
    }

    changeEventTitles(currentTitle, newTitle);
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewTitle(''); // Resets the form
  };

  const handleper_dayChange = (e) => {
    e.preventDefault();

    let userInput = newPerDay  // Grab the user's input
    console.log(selectedEvent)
    changeEventPerDayHours(selectedEvent.job_name, selectedEvent.index, userInput)
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewPerDay(''); // Resets the form
    setIsSelectable(true)
  };

  const handleProjectionChange = (e) => {
    e.preventDefault();

    changeEventProjections(selectedEvent.job_name, newProjection)
    handleModal(setModalEventIsOpen, modalEventIsOpen); // Closes Modal
    setNewProjection(''); // Resets the form
    setIsSelectable(true)
  };

  const changeEventProjections = (titleToFind, userInput) => {
    // We need these two variables for the first iteration
    let titleHours = null
    let titleRemaining = null
    const updatedEvents = allEvents.map(event => {
      if (event.job_name === titleToFind) {
        if(titleHours === null) {
          titleHours = userInput
          // This sets up the next iteration
          titleRemaining = event.per_day
        } else {
          titleHours = titleHours - titleRemaining
          // This sets up the next iteration
          titleRemaining = event.per_day
        }
        let hours_left = (userInput - (event.inital_hours - event.hours_left))
        return {
          ...event,
          title: `${event.job_name} -- ${event.per_day} / ${titleHours}`,
          hours_left: hours_left,
          inital_hours: userInput
        };
      }
      return event;
    });
    // update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
    setIsSelectable(true)
  }

  const changeEventPerDayHours = (titleToFind, myIndex, newPerDay) => {
    console.log('titleToFind', titleToFind)
    console.log("myIndex", myIndex)
    console.log("newPerDay", newPerDay)
    newPerDay = parseInt(newPerDay)
    let previousper_day = 0;
    let hoursRemaining = 0;
    let tempHours = 0;
    const updatedEvents = allEvents.map(event => {
      if(event.job_name === titleToFind){
        if (myIndex === 0 && myIndex === event.index) {
          console.log("First", event)
          hoursRemaining = parseInt(event.inital_hours);
          previousper_day = parseInt(newPerDay)
          return {
            ...event,
            title: `${event.job_name} -- ${newPerDay} / ${parseInt(event.inital_hours)}`,
            per_day: parseInt(newPerDay),
            hours_left: (parseInt(event.hours_left) + (parseInt(event.per_day) - parseInt(newPerDay)))
          };
        }
        if (myIndex > event.index) {
          console.log("Middle", event)
          hoursRemaining = parseInt(event.hours_left)
          previousper_day = parseInt(event.per_day);
          return {...event}
        }
        if (myIndex === event.index) {
          console.log("End", event)
          hoursRemaining = parseInt(hoursRemaining);
          previousper_day = parseInt(newPerDay)
          // let frank = (parseInt(event.hours_left) + (parseInt(event.per_day) - parseInt(newper_day)))
          return {
            ...event,
            title: `${event.job_name} -- ${newPerDay} / ${hoursRemaining}`,
            per_day: parseInt(newPerDay),
            hours_left: (parseInt(event.hours_left) + (parseInt(event.per_day) - parseInt(newPerDay)))
          };
        }
        if (myIndex < event.index) {
          hoursRemaining = parseInt(hoursRemaining) - parseInt(previousper_day)
          previousper_day = parseInt(event.per_day);
          return {
            ...event,
            title: `${event.job_name} -- ${event.per_day} / ${hoursRemaining}`,
            hours_left: (parseInt(event.hours_left) + (parseInt(event.per_day) - parseInt(newPerDay)))
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
      if (event.job_name === titleToFind) {
        return {
          ...event,
          job_name: changeTitle,
          title: `${changeTitle} -- ${event.per_day} / ${event.hours_left}`
        };
      }
      setIsSelectable(true)
      return event;
    });

    // now you can update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
  }

  const handleRemoveDay = (event, job_name) => {
    let currentEvents = allEvents.filter(event => event.job_name === job_name);
    let filteredEvents = allEvents.filter((currentEvent) => currentEvent.job_name !== job_name);
    currentEvents.pop();
    const updatedEvents = [...filteredEvents, ...currentEvents];
    setAllEvents(updatedEvents);
    setIsSelectable(true)
    if(currentEvents.length === 0) {
      handleModal(setModalEventIsOpen, modalEventIsOpen); // Not sure I want this to close yet...
    }
  }

  const handleAddDay = (event, job_name) => {
    const filteredEvents = allEvents.filter(event => event.job_name === job_name);
    const highestEvent = filteredEvents.reduce((highest, current) => {
      if (current.index > highest.index) {
        return current;
      } else {
        return highest;
      }
    }, { index: -1 });

    // Create a new Date object with highestEvent.start and add one day
    let newStartDate = new Date(highestEvent.start.getTime() + (86400000));

    // This will make it skip the weekend dates
    while(isWeekend(newStartDate)) {
      newStartDate = new Date(newStartDate.getTime() + (86400000))
    }


    // Creates a copy of the previous last event, and adjusts the new info
    let newEvent = Object.assign({}, highestEvent);
    newEvent.index = highestEvent.index + 1
    newEvent.title = `${newEvent.job_name} -- ${newEvent.per_day} / ${newEvent.hours_left}`;
    newEvent.hours_left = highestEvent.hours_left - newEvent.per_day
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
    if(event.index > 0) {
      const prevEvent = allEvents.find(e => e.job_name === event.job_name && e.index === event.index - 1);
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
      if(currentEvent.job_name === event.job_name && currentEvent.index === event.index){
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
      if(currentEvent.job_name === event.job_name && currentEvent.index > event.index) {
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
    setNewEvent({ ...newEvent, color: e.target.value });
  }

  const onSelectSlot = (e) => {
    // The next two lines adjust for onSelectSlot always choosing the end date 1 day after it should... not sure why.
    // console.log("e.Start: ",e.start)
    // console.log("e.End: ",e.end)
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
        <button className="deleteButton" onClick={(e) => handleAddDay(e, selectedEvent.job_name)}>Add Day</button>
        <button className="deleteButton" onClick={(e) => handleRemoveDay(e, selectedEvent.job_name)}>Remove Day</button>
        <h2>{`${selectedEvent.job_name} - ${formattedDate}`}</h2>
        <div>
        <form onSubmit={handleNameChange}>
          <label>
            Name Change :
            <input
              type="text"
              placeholder={selectedEvent.job_name}
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
              placeholder={selectedEvent.inital_hours}
              value={newProjection}
              onChange={(e) => setNewProjection(e.target.value)}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        <form onSubmit={handleper_dayChange}>
          <label>
            Hours Per Day :
            <input
              type="number"
              placeholder={selectedEvent.per_day}
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
                setNewEvent({ ...newEvent, job_name: e.target.value })
              }
              autoFocus
            />
            <br></br>
            <p>Projected Hours: </p>
            <input
              type="number"
              placeholder="Enter Projected hours"
              value={newEvent.projected_hours}
              onChange={(e) =>
                setNewEvent({ ...newEvent, projected_hours: e.target.value })
              }
            />
            <br></br>
            <p>per_day Hour Rate: </p>
            <input
              type="number"
              placeholder="Enter Daily Hours"
              value={newEvent.per_day}
              onChange={(e) => setNewEvent({ ...newEvent, per_day: e.target.value })}
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
            event.color
              ? {
                  style: {
                    background: event.color,
                    color: event.color === 'rgb(172, 236, 253)' || event.color === 'rgb(255, 255, 0)' || event.color === 'orange' ? 'black' : ''
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
