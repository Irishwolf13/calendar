import "./App.css";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
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

const events = [
  {
    title: "Frank -- 100 / 100",
    allDay: true,
    className: "frank",
    start: new Date(2023, 5, 11),
    end: new Date(2023, 5, 11),
  },
  {
    title: "Frank -- 90 / 100",
    allDay: true,
    start: new Date(2023, 5, 12),
    end: new Date(2023, 5, 12),
  },
  {
    title: "Frank -- 80 / 100",
    allDay: true,
    start: new Date(2023, 5, 13),
    end: new Date(2023, 5, 13),
  },
  {
    title: "Big Meeting 90 / 100",
    allDay: true,
    start: new Date(2023, 5, 12),
    end: new Date(2023, 5, 12),
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023, 5, 13),
    end: new Date(2023, 5, 13),
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023, 5, 13),
    end: new Date(2023, 5, 13),
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023, 5, 13),
    end: new Date(2023, 5, 13),
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023, 5, 13),
    end: new Date(2023, 5, 13),
  },
  {
    title: "My Meeting",
    start: new Date(2023, 5, 2),
    end: new Date(2023, 5, 5),
  },
];

function App() {
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "", projectedHours: '' });
  const [allEvents, setAllEvents] = useState(events);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [currentTitle, setCurrentTitle] = useState('');
  const [newTitle, setNewTitle] = useState("");

  const handleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const handleEventClicked = (event) => {
    setCurrentTitle(event.title);
    setSelectedEvent(event);
    handleModal();
  };

  const handleAddEvent = () => {
    // Pulls information from newEvent Object, then formats it for initial Event Creation
    const { title, projectedHours } = newEvent;
    const formattedTitle = `${title} -- ${projectedHours} : ${projectedHours}`;

    // Create a new object with the formatted title and other properties
    const formattedEvent = {
      ...newEvent,
      title: formattedTitle
    };

    // Add the formatted event to the allEvents array
    setAllEvents([...allEvents, formattedEvent]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // I think here I'm going to want to loop through events and find the one with same title.
    // This is the first step for creating the adjusting values for each day of an event
    loopThroughEvents(currentTitle, newTitle)

    handleModal();
    setNewTitle('')
  };

  const loopThroughEvents = (titleToFind, changeTitle) => {
    const updatedEvents = allEvents.map(event => {
      console.log("Event Title: ",changeTitle)
      console.log("To Find: ", titleToFind)
      if (event.title === titleToFind) {
        return { ...event, title: changeTitle };
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
      />

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>{selectedEvent.title}</h2>
        <div>
        <form onSubmit={handleFormSubmit}>
          <label>
            New Title:
            <input
              type="text"
              placeholder={selectedEvent.title}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
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