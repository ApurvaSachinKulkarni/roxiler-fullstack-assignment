import { useEffect, useState } from "react";
import API from "../api";

function DashboardUser() {
  const [stores, setStores] = useState([]);
  const [myRatings, setMyRatings] = useState({});

  useEffect(() => {
    API.get("/stores").then((res) => setStores(res.data));
  }, []);

  const handleRate = async (storeId, rating) => {
    try {
      if (myRatings[storeId]) {
        await API.put(`/stores/${storeId}/rating`, { rating });
      } else {
        await API.post(`/stores/${storeId}/rating`, { rating });
      }
      setMyRatings({ ...myRatings, [storeId]: rating });
    } catch (err) {
      alert(err.response?.data?.error || "Rating failed");
    }
  };

  return (
    <div>
      <h3>User Dashboard</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Address</th>
            <th>Average Rating</th>
            <th>Your Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.avgRating}</td>
              <td>
                <select
                  className="form-select"
                  value={myRatings[s.id] || ""}
                  onChange={(e) => handleRate(s.id, Number(e.target.value))}
                >
                  <option value="">Rate</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardUser;