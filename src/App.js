import "./App.css";
import { Calendar, dateFnsLocalizer} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import React, { useState } from "react";
import Modal from "react-modal";
import ReactModal from "react-modal";
ReactModal.setAppElement("#root");

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
    title: "",
    jobName: "",
    start: "",
    end: "",
    projectedHours: '',
    perDay: '',
    hoursLeft: '',
    eventIndex: ''
  });
  const [allEvents, setAllEvents] = useState(events);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});

  const [currentTitle, setCurrentTitle] = useState('');
  const [newTitle, setNewTitle] = useState("");
  const [newPerDay, setNewPerDay] = useState('');

  const [selectedSlot, setSelectedSlot] = useState(null);


  const handleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const handleEventClicked = (event) => {
    setCurrentTitle(event.jobName);
    setSelectedEvent(event);
    handleModal();
  };

  const handleAddEvent = () => {
    let jobName = newEvent.title;
    // This bit will adjust the initial hours
    let hoursLeft = newEvent.projectedHours - newEvent.perDay;

    // Checks to make sure a job doesn't already exist with the same name
    if (allEvents.some(event => event.jobName === jobName)) {
      console.log(`An event with job name "${jobName}" already exists`);
      return;
    }

    // Creates an array to store all the dates in the range given, and adjusts the standard perDay hour rates
    let datesArray = [];
    for (let date = new Date(newEvent.start); date <= newEvent.end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();              // get day of week (0 is Sunday, 6 is Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {     // skip weekends
        const title = `${newEvent.title} -- ${newEvent.perDay} / ${hoursLeft}`;
        datesArray.push({
          ...newEvent,
          title: title,
          jobName: jobName,
          hoursLeft: hoursLeft,
          start: new Date(date),
          end: new Date(date),
          eventIndex: datesArray.length
        });
        hoursLeft -= newEvent.perDay;
      }
    }
    // Creates all the events
    setAllEvents([...allEvents, ...datesArray]);
  };

  const handleNameChange = (e) => {
    e.preventDefault();
    // Checks to make sure the job name isn't blank
    if (newTitle === '') {
      alert('Name change cannot be blank');
      return;
    }
    // Checks the array of jobs and makes sure the job name isn't already in use
    if (allEvents.some(event => event.jobName === newTitle)) {
      alert(`An event with title "${newTitle}" already exists.`);
      return;
    }

    loopThroughEvents(currentTitle, newTitle);
    handleModal();
    setNewTitle('');
  };

  const handlePerDayChange = (e) => {
    e.preventDefault();
    // console.log(selectedEvent);
    // Grab the user's input
    let userInput = newPerDay
    // This bit is going to be a little harder than a name change, so it gets its own function.
    // Loop through the events, find events with the same name && indext = or greater than current
    // get the difference between the current perDay and the new perDay and subtract that from the hours
    // remaining.
    loopThroughEventsForHours(selectedEvent.jobName, selectedEvent.eventIndex, userInput)
  };

  const loopThroughEventsForHours = (titleToFind, myIndex, newPerDay) => {
    let newHoursLeft = 0;
    const updatedEvents = allEvents.map(event => {
      if (event.jobName === titleToFind  && myIndex == event.eventIndex) {
        // console.log("newPayDay: ", newPerDay)
        // console.log("event.perDay: ", event.perDay)
        // console.log("event.hoursLeft: ", event.hoursLeft)
        newHoursLeft = event.hoursLeft - (newPerDay - event.perDay)
        let title = `${event.jobName} -- ${newPerDay} / ${newHoursLeft}`
        return {
          ...event,
          perDay: newPerDay,
          title: title,
          hoursLeft: newHoursLeft
        };
      }
      if (event.jobName === titleToFind  && myIndex <= event.eventIndex) {
        newHoursLeft = (newHoursLeft - event.perDay)
        let title = `${event.jobName} -- ${event.perDay} / ${newHoursLeft}`
          return {
            ...event,
            title: title,
            hoursLeft: newHoursLeft
          };
      }
      return event;
    });
    // now you can update the original allEvents array with the updatedEvents array
    setAllEvents(updatedEvents);
  }

  const loopThroughEvents = (titleToFind, changeTitle) => {
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

  return (
    <div className="App">
      <h1>Calendar</h1>
      <h2>Add New Event</h2>
      <div>
        <input
          type="text"
          placeholder="Add Title for Event"
          style={{ width: "20%", marginRight: "10px" }}
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Enter Projected hours"
          style={{ width: "10%", marginRight: "10px" }}
          value={newEvent.projectedHours}
          onChange={(e) =>
            setNewEvent({ ...newEvent, projectedHours: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Enter Daily Hours"
          style={{ width: "10%", marginRight: "10px" }}
          value={newEvent.perDay}
          onChange={(e) =>
            setNewEvent({ ...newEvent, perDay: e.target.value })
          }
        />
        <DatePicker
          placeholderText="Start Date"
          style={{ marginRight: "10px" }}
          selected={newEvent.start}
          onChange={(start) => setNewEvent({ ...newEvent, start })}
        />
        <DatePicker
          placeholderText="End Date"
          selected={newEvent.end}
          onChange={(end) => setNewEvent({ ...newEvent, end })}
        />
        <button style={{ marginTop: "10px" }} onClick={handleAddEvent}>
          {" "}
          Add Event{" "}
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleEventClicked}
        style={{ height: 800, margin: "50px" }}
        selectable={true}
        onSelectSlot={(slotInfo) => setSelectedSlot({ start: slotInfo.start, end: slotInfo.end })}
      />

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>{selectedEvent.title}</h2>
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
        <form onSubmit={handlePerDayChange}>
          <label>
            Hours Per Day :
            <input
              type="number"
              placeholder={selectedEvent.perDay}
              value={newPerDay}
              onChange={(e) => setNewPerDay(e.target.value)}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        </div>
      </Modal>
    </div>
  );
}

export default App;

{/* <input
type="number"
placeholder={selectedEvent.perDay}
value={newPerDay}
onChange={(e) => setNewPerDay(e.target.value)}
/> */}