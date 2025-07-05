import "./App.css";
import { useEffect, useState } from "react";
import LazyLoad from "react-lazyload";

function App() {
  const [alltickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({
    movie_title: "",
    show_date: "",
    show_time: "",
    seat_number: "",
  });
  const [filterDate, setFilterDate] = useState("");
  const [filterMovie, setFilterMovie] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);
  const [updatedTicket, setUpdatedTicket] = useState({
    movie_title: "",
    show_date: "",
    show_time: "",
    seat_number: "",
  });
  const [file, setFile] = useState();
  const [caption, setCaption] = useState("");
  const [movieInfo, setMovieInfo] = useState(null);
  const [movies, setMovies] = useState([]);
  const allowTypes = ["image/jpeg", "image/png", "image/gif"];

  useEffect(() => {
    fetchMovies();
    fetchTickets();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/mongo/movies");
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      } else {
        console.error("Failed to fetch movies");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // useEffect(() => {
  //   applyFilters();
  // }, [filterDate, filterMovie, alltickets]);

  useEffect(() => {
    applyFilters();
  }, [filterMovie, movies]);

  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/mongo/tickets");
      const data = await response.json();
      setAllTickets(data);
    } catch (error) {
      console.error(error);
    }
  };

  const applyFilters = () => {
    let filteredMovies = [...movies];
    if (filterMovie) {
      filteredMovies = filteredMovies.filter((movie) =>
        movie.title.toLowerCase().includes(filterMovie.toLowerCase())
      );
    }
    setFilteredTickets(filteredMovies);
  };

  // const applyFilters = () => {
  //   let tickets = [...movies];

  //   // if (filterDate) {
  //   //   tickets = tickets.filter((ticket) => ticket.show_date === filterDate);
  //   // }

  //   if (filterMovie) {
  //     tickets = tickets.filter(
  //       (ticket) => ticket.title === filterMovie
  //     );
  //   }

  //   setFilteredTickets(tickets);
  // };

  // const createTicket = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3002/api/mongo/tickets", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         movie_id: newTicket.movie_id,
  //         show_date: newTicket.show_date,
  //         show_time: newTicket.show_time,
  //         seat_number: newTicket.seat_number,
  //       }),
  //     });
  //     if (response.ok) {
  //       fetchTickets();
  //       setNewTicket({
  //         movie_id: "",
  //         show_date: "",
  //         show_time: "",
  //         seat_number: "",
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const handleDelete = async (id) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:3002/api/mongo/tickets/${id}`,
  //       {
  //         method: "DELETE",
  //       }
  //     );
  //     if (response.ok) {
  //       fetchTickets();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setUpdatedTicket({
      movie_title: ticket.movie_info.title,
      show_date: ticket.show_date,
      show_time: ticket.show_time,
      seat_number: ticket.seat_number,
    });
  };

  const handleUpdate = async () => {
    if (!editingTicket) return;

    try {
      const response = await fetch(
        `http://localhost:3002/api/mongo/tickets/${editingTicket._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTicket),
        }
      );
      if (response.ok) {
        fetchTickets();
        setEditingTicket(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createMovie = async (event) => {
    event.preventDefault();

    if (!allowTypes.includes(file.type)) {
      alert(
        `Тип ${
          file.type
        } не підтримується. Підтримувані типи: ${allowTypes.join(", ")}`
      );
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      const response = await fetch("http://localhost:3002/api/mongo/images", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Image uploaded successfully");
        const data = await response.json();
        setMovieInfo(data.movie);
        setCaption("");
        setFile(null);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while uploading the image");
    }
  };

  const changeImg = async (e, movieTitle) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!allowTypes.includes(file.type)) {
      alert(
        `Тип ${
          file.type
        } не підтримується. Підтримувані типи: ${allowTypes.join(", ")}`
      );
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("movieTitle", movieTitle);

    try {
      const response = await fetch(
        "http://localhost:3002/api/mongo/update-movie-poster",
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.title === movieTitle
              ? { ...movie, poster_url: result.movie.poster_url }
              : movie
          )
        );
      } else {
        console.error("Failed to update movie poster");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/mongo/movies/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchMovies();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <a href="http://localhost:3000/">Link to Sql</a>
      <div className="form">
        {/* <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        /> */}

        <select
          value={filterMovie}
          onChange={(e) => setFilterMovie(e.target.value)}
        >
          <option value="">All Movies</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.title}>
              {movie.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setFilterDate("");
            setFilterMovie("");
          }}
        >
          Reset
        </button>
      </div>

      {/* <h3>Create New Ticket</h3>
      <div className="form">
        <select
          value={newTicket.movie_id}
          onChange={(e) =>
            setNewTicket({ ...newTicket, movie_id: e.target.value })
          }
        >
          <option value="">Select Movie</option>
          {movies.map((movie) => (
            <option key={movie._id} value={movie._id}>
              {movie.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={newTicket.show_date}
          onChange={(e) =>
            setNewTicket({ ...newTicket, show_date: e.target.value })
          }
        />
        <input
          type="time"
          value={newTicket.show_time}
          onChange={(e) =>
            setNewTicket({ ...newTicket, show_time: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Seat Number"
          value={newTicket.seat_number}
          onChange={(e) =>
            setNewTicket({ ...newTicket, seat_number: e.target.value })
          }
        />
        <button className="post" onClick={createTicket}>
          Create
        </button>
      </div> */}

      <h3>Create New Movie</h3>
      <div className="form">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Movie Title"
        />
        <button className="post" onClick={createMovie}>
          Create
        </button>
      </div>
      <ul className="tickets">
        {filteredTickets.map((movie) => (
          <li className="ticket" key={movie._id}>
            <div className="ticketImage">
              <label className="custom-file-upload">
                <input
                  type="file"
                  onChange={(e) => changeImg(e, movie.title)}
                  style={{ display: "none" }}
                />
              </label>
              <LazyLoad>
                <img src={movie.poster_url || "image.png"} alt="movie_poster" />
              </LazyLoad>
            </div>
            <div className="ticketText">
              <p>{movie.title}</p>
              <button
                onClick={() => handleDelete(movie._id)}
                className="delete"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* <ul className="tickets">
        {filteredTickets.map((ticket) => (
          <li key={ticket._id} className="ticket">
            <div className="ticketText">
              {editingTicket && editingTicket._id === ticket._id ? (
                <>
                  <input
                    type="text"
                    placeholder="Movie Title"
                    value={updatedTicket.movie_title}
                    onChange={(e) =>
                      setUpdatedTicket({
                        ...updatedTicket,
                        movie_title: e.target.value,
                      })
                    }
                  />
                  <input
                    type="date"
                    value={updatedTicket.show_date}
                    onChange={(e) =>
                      setUpdatedTicket({
                        ...updatedTicket,
                        show_date: e.target.value,
                      })
                    }
                  />
                  <input
                    type="time"
                    value={updatedTicket.show_time}
                    onChange={(e) =>
                      setUpdatedTicket({
                        ...updatedTicket,
                        show_time: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Seat Number"
                    value={updatedTicket.seat_number}
                    onChange={(e) =>
                      setUpdatedTicket({
                        ...updatedTicket,
                        seat_number: e.target.value,
                      })
                    }
                  />
                  <button className="post" onClick={handleUpdate}>
                    Save
                  </button>
                  <button onClick={() => setEditingTicket(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <p>
                    <strong>Movie:</strong> {ticket.movie_info.title}
                  </p>
                  <p>
                    <strong>Date:</strong> {ticket.show_date.slice(0, 10)}
                  </p>
                  <p>
                    <strong>Time:</strong> {ticket.show_time.slice(0, 5)}
                  </p>
                  <p>
                    <strong>Seat:</strong> {ticket.seat_number}
                  </p>
                  <button
                    onClick={() => handleDelete(ticket._id)}
                    className="delete"
                  >
                    Delete
                  </button>
                  <button onClick={() => handleEdit(ticket)} className="update">
                    Update
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul> */}
    </div>
  );
}

export default App;
