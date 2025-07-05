import "./App.css";
import { useEffect, useState } from "react";
import TicketIcon from "./TicketIcon/TicketIcon";

function App() {
  const [orders, setOrders] = useState([]);
  const [date, setDate] = useState("");
  const [viewer, setViewer] = useState("");
  const [allViewers, setAllViewers] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [selectedViewer, setSelectedViewer] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [showAddOrderForm, setShowAddOrderForm] = useState(false);
  const [editingOrder, setEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newSeatNumber, setNewSeatNumber] = useState("");

  const allowTypes = ["image/jpeg", "image/png", "image/gif"];

  useEffect(() => {
    fetch("http://localhost:3002/api/postgres/viewers")
      .then((res) => res.json())
      .then((data) => setAllViewers(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(
      `http://localhost:3002/api/postgres/available-tickets?viewer_id=${selectedViewer}`
    )
      .then((res) => res.json())
      .then((data) => setAvailableTickets(data))
      .catch(console.error);
  }, [selectedViewer]);

  useEffect(() => {
    let url = "http://localhost:3002/api/postgres/orders";
    const params = [];
    if (date) params.push(`date=${date}`);
    if (viewer) params.push(`full_name=${viewer}`);
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((error) =>
        console.error("There was a problem with the fetch operation:", error)
      );
  }, [date, viewer, selectedTicket, newSeatNumber]);

  function handleDelete(id) {
    fetch(`http://localhost:3002/api/postgres/orders/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete order");
        }
        return res.json();
      })
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== id)
        );
      })
      .catch((error) =>
        console.error("There was a problem with the delete operation:", error)
      );
  }

  const handleAddOrder = () => {
    if (!selectedViewer || !selectedTicket) {
      alert("Please select a viewer and a ticket.");
      return;
    } else {
      fetch("http://localhost:3002/api/postgres/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewer_id: selectedViewer,
          ticket_id: selectedTicket,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setOrders((prev) => [...prev, data.order]);
          setShowAddOrderForm(false);
          setSelectedViewer("");
          setSelectedTicket("");
        })
        .catch(console.error);
    }
  };

  function handleUpdateOrder(ticketId, newSeatNumber) {
    if (!ticketId || !newSeatNumber) {
      console.error("Invalid ticket ID or seat number");
      return;
    }

    fetch(`http://localhost:3002/api/postgres/orders/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seat_number: newSeatNumber }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Ticket updated:", data);
        setEditing(false);
        setEditingOrderId(null);
        setNewSeatNumber("");
      })
      .catch((error) => {
        console.error("There was a problem with the update operation:", error);
      });
  }

  const changeImg = async (event, movieTitle) => {
    const files = event.target.files;
    if (files.length > 0) {
      if (allowTypes.includes(files[0].type)) {
        const formData = new FormData();
        formData.append("image", files[0]);
        formData.append("movieTitle", movieTitle);

        try {
          const response = await fetch(
            "http://localhost:3002/api/postgres/update-movie-poster",
            {
              method: "PUT",
              body: formData,
            }
          );
          if (response.ok) {
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.movie_title === movieTitle
                  ? { ...order, movie_poster: URL.createObjectURL(files[0]) }
                  : order
              )
            );
          }
        } catch (error) {
          console.error("Error updating movie poster:", error);
          alert("Failed to update movie poster");
        }
      } else {
        alert(
          `Тип ${
            files[0].type
          } не підтримується. Підтримувані типи: ${allowTypes.join(", ")}`
        );
      }
    }
  };

  return (
    <div className="App">
      <a href="http://localhost:3001/">Link to NoSql</a>
      <h1>Tickets for {date || "all dates"}</h1>
      <div className="form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={viewer} onChange={(e) => setViewer(e.target.value)}>
          <option value="">All viewers</option>
          {allViewers.map((viewer) => (
            <option key={viewer.id} value={viewer.full_name}>
              {viewer.full_name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setDate("");
            setViewer("");
          }}
        >
          Reset
        </button>
      </div>

      <button
        onClick={() => setShowAddOrderForm(!showAddOrderForm)}
        className="post"
      >
        {showAddOrderForm ? "Cancel" : "Add Order"}
      </button>

      {showAddOrderForm && (
        <div className="addOrderForm">
          <h3>Add New Order</h3>
          <div className="form">
            <select
              value={selectedViewer}
              onChange={(e) => setSelectedViewer(e.target.value)}
            >
              <option value="">Select Viewer</option>
              {allViewers.map((viewer) => (
                <option key={viewer.id} value={viewer.id}>
                  {viewer.full_name}
                </option>
              ))}
            </select>
            <select
              value={selectedTicket}
              onChange={(e) => setSelectedTicket(e.target.value)}
            >
              <option value="">Select Ticket</option>
              {availableTickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {`${ticket.movie_title} - ${ticket.show_date.slice(0, 10)} 
                at ${ticket.show_time.slice(0, 5)}, Seat: ${
                    ticket.seat_number
                  }`}
                </option>
              ))}
            </select>
            <button onClick={handleAddOrder} className="post">
              Add
            </button>
          </div>
        </div>
      )}

      <h2>Orders for {viewer || "all viewers"}:</h2>
      <ul className="tickets">
        {orders.map((order) => (
          <li key={order.id} className="ticket">
            <div className="ticketImage">
              <label className="custom-file-upload">
                <input
                  type="file"
                  onChange={(e) => changeImg(e, order.movie_title)}
                  style={{ display: "none" }}
                />
              </label>
              <img src={order.movie_poster} alt="MoviePoster" />
            </div>
            <div className="ticketText">
              <div
                onClick={() => {
                  setEditing(true);
                  setEditingOrderId(order.id);
                  setNewSeatNumber(order.seat_number);
                }}
              >
                <TicketIcon />
              </div>
              <p>
                <strong>Movie:</strong> {order.movie_title}
              </p>
              <p>
                <strong>Date: </strong>
                {order.show_date ? order.show_date.slice(0, 10) : "N/A"}
              </p>
              <p>
                <strong>Time: </strong>
                {order.show_time ? order.show_time.slice(0, 5) : "N/A"}
              </p>
              <p className="editingSeat">
                <strong>Seat: </strong>
                {editingOrder === true && editingOrderId === order.id ? (
                  <input
                    type="number"
                    value={newSeatNumber}
                    min="1"
                    onChange={(e) => setNewSeatNumber(e.target.value)}
                    placeholder={order.seat_number}
                  />
                ) : (
                  order.seat_number
                )}
              </p>
              <p>
                <strong>Viewer: </strong> {order.full_name}
              </p>
              {editingOrder === true && editingOrderId === order.id ? (
                <button
                  onClick={() => handleUpdateOrder(order.id, newSeatNumber)}
                  className="update"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={() => handleDelete(order.id)}
                  className="delete"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
