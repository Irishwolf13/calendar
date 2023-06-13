import './App.css';
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css"
import DatePicker from "react-datepicker";
import React, { useState } from "react";

import { addDays } from "date-fns";

const locales = {
  "en-US": require("date-fns/locale/en-US")
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const events = [
  {
    title: "Frank -- 100 / 100",
    allDay: true,
    className: "frank",
    start: new Date(2023,5,11),
    end: new Date(2023,5,11)
  },
  {
    title: "Frank -- 90 / 100",
    allDay: true,
    start: new Date(2023,5,12),
    end: new Date(2023,5,12)
  },
  {
    title: "Frank -- 80 / 100",
    allDay: true,
    start: new Date(2023,5,13),
    end: new Date(2023,5,13)
  },
  {
    title: "Big Meeting 90 / 100",
    allDay: true,
    start: new Date(2023,5,12),
    end: new Date(2023,5,12)
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023,5,13),
    end: new Date(2023,5,13)
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023,5,13),
    end: new Date(2023,5,13)
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023,5,13),
    end: new Date(2023,5,13)
  },
  {
    title: "Big Meeting 80 / 100",
    allDay: true,
    start: new Date(2023,5,13),
    end: new Date(2023,5,13)
  },
  {
    title: "My Meeting",
    start: new Date(2023,5,2),
    end: new Date(2023,5,5)
  }
]


function App() {
  const [newEvent, setNewEvent] = useState({title: "", start: "", end: ""})
  const [allEvents, setAllEvents] = useState(events)

  // Handing a new event
  const handleAddEvent = () => {
    setAllEvents([...allEvents, newEvent])
  }

  // Handing an event being clicked
  const handleEventClicked = (e) => {
    console.log(e.title)
  };


  return (
    <div className="App">
      <h1>Calendar</h1>
      <h2>Add New Event</h2>
      <div>
        <input
          type="text"
          placeholder="Add Title for Event"
          style={{width: "20%", marginRight: "10px"}}
          value={newEvent.title}
          onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
        />
        <DatePicker
          placeholderText='Start Date'
          style={{marginRight: "10px"}}
          selected={ newEvent.start }
          onChange={(start) => setNewEvent({...newEvent, start})}
        />
        <DatePicker
          placeholderText='End Date'
          selected={ newEvent.end }
          onChange={(end) => setNewEvent({...newEvent, end})}
        />
        <button
          style={{marginTop: '10px'}}
          onClick={ handleAddEvent }
        > Add Event </button>
      </div>
      <Calendar
        localizer={ localizer }
        events={ allEvents }
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleEventClicked}
        style={ {height: 800, margin: "50px"} }
      />
    </div>
  );
}

export default App;
