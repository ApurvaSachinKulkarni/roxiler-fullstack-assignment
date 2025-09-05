// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import API from "../api";

function DashboardAdmin() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    API.get("/admin/dashboard").then((res) => setStats(res.data));
    API.get("/admin/users").then((res) => setUsers(res.data));
    API.get("/admin/stores").then((res) => setStores(res.data));
  }, []);

  return (
    <div className="container my-4">
      <h2 className="mb-4">👨‍💻 Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="row mb-4 text-center">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white shadow p-4">
            <h5>Total Users</h5>
            <h2>{stats.totalUsers}</h2>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white shadow p-4">
            <h5>Total Stores</h5>
            <h2>{stats.totalStores}</h2>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-dark shadow p-4">
            <h5>Total Ratings</h5>
            <h2>{stats.totalRatings}</h2>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow mb-4">
        <div className="card-header bg-dark text-white">👥 Users</div>
        <div className="card-body">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Name</th><th>Email</th><th>Address</th><th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stores Table */}
      <div className="card shadow">
        <div className="card-header bg-dark text-white">🏬 Stores</div>
        <div className="card-body">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Name</th><th>Email</th><th>Address</th><th>Owner</th><th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td><td>{s.email}</td><td>{s.address}</td>
                  <td>{s.owner}</td><td>{s.avgRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;