// src/pages/DashboardOwner.jsx
import { useEffect, useState } from "react";
import API from "../api";

function DashboardOwner() {
  const [storeRatings, setStoreRatings] = useState(null);

  useEffect(() => {
  API.get("/owner/my-store")
    .then((res) => setStoreRatings(res.data))
    .catch((err) => console.error(err.response?.data || err));
}, []);

  if (!storeRatings) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container my-4">
      <h2 className="mb-4">🏪 Store Owner Dashboard</h2>

      {/* Store Info Card */}
      <div className="card shadow-lg mb-4">
        <div className="card-body text-center">
          <h4 className="card-title">{storeRatings.store}</h4>
          <p className="card-text">
            ⭐ Average Rating:{" "}
            <span className="fw-bold">{storeRatings.avgRating}</span>
          </p>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="card shadow">
        <div className="card-header bg-dark text-white">
          👥 Customer Ratings
        </div>
        <div className="card-body">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {storeRatings.ratings.map((r, i) => (
                <tr key={i}>
                  <td>{r.user}</td>
                  <td>{r.email}</td>
                  <td>⭐ {r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardOwner;