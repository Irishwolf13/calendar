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
import myImage from './images/reliable_design_logo2.jpg';
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
  const [newProjection, setNewProjection] = useState('');

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
      alert(`An event with job name "${jobName}" already exists`);
      return
    }
    // Creates all the events
    let datesArray = [];
    for (let date = new Date(newEvent.start); date <= newEvent.end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();              // get day of week (0 is Sunday, 6 is Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {     // skip weekends
        const title = `${newEvent.title} -- ${newEvent.perDay} / ${hoursLeft}`;
        datesArray.push({
          ...newEvent,
          title: title,
          jobName: jobName,
          initalHours: newEvent.projectedHours,
          hoursLeft: hoursLeft,
          start: new Date(date),
          end: new Date(date),
          eventIndex: datesArray.length
        });
        hoursLeft -= newEvent.perDay;
      }
    }
    setAllEvents([...allEvents, ...datesArray]);
  };

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
    handleModal(); // Closes Modal
    setNewTitle(''); // Resets the form
  };

  const handlePerDayChange = (e) => {
    e.preventDefault();

    let userInput = newPerDay  // Grab the user's input
    changeEventPerDayHours(selectedEvent.jobName, selectedEvent.eventIndex, userInput)
    handleModal(); // Closes Modal
    setNewPerDay(''); // Resets the form
  };

  const handleProjectionChange = (e) => {
    e.preventDefault();

    changeEventProjections(selectedEvent.jobName, newProjection)
    handleModal(); // Closes Modal
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
    let newHoursLeft = 0;
    const updatedEvents = allEvents.map(event => {
      if (event.jobName === titleToFind && myIndex === event.eventIndex) {
        newHoursLeft = event.hoursLeft - (newPerDay - event.perDay)
        return {
          ...event,
          perDay: newPerDay,
          title: `${event.jobName} -- ${newPerDay} / ${newHoursLeft}`,
          hoursLeft: newHoursLeft
        };
      }
      if (event.jobName === titleToFind && myIndex <= event.eventIndex) {
        newHoursLeft = (newHoursLeft - event.perDay)
          return {
            ...event,
            title: `${event.jobName} -- ${event.perDay} / ${newHoursLeft}`,
            hoursLeft: newHoursLeft
          };
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

  return (
    <div className="App">
      <img className="mainLogo" src={myImage} alt="Reliable Design Logo"/>
      <button>Add New Event</button>
      <div className="mainContainer">
        <input
          type="text"
          placeholder="Add Title for Event"
          className="titleInput"
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Enter Projected hours"
          value={newEvent.projectedHours}
          onChange={(e) =>
            setNewEvent({ ...newEvent, projectedHours: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Enter Daily Hours"
          value={newEvent.perDay}
          onChange={(e) =>
            setNewEvent({ ...newEvent, perDay: e.target.value })
          }
        />
        <DatePicker
          placeholderText="Start Date"
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
