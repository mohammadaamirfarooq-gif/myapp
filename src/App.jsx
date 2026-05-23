import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://vgthwiqpvzdptqhvzqmx.supabase.co/rest/v1/users";
const API_KEY = "sb_publishable_oFuQ3NpyweCtNJIbcwLvyg_jMIHzIuQ";

export default function App() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
          "Accept-Profile": "record",
        },
      });

      const data = await res.json();
      setUsers(data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // CREATE
  // =========================
  const createUser = async (data) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  };

  // =========================
  // UPDATE
  // =========================
  const updateUser = async (id, data) => {
    const res = await fetch(`${API_URL}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  };

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        status: Number(data.status),
      };

      if (editId) {
        const updated = await updateUser(editId, payload);

        setUsers((prev) =>
          prev.map((u) => (u.id === editId ? updated[0] : u))
        );

        toast.success("User updated");
        setEditId(null);
        reset();
        return;
      }

      const result = await createUser(payload);
      setUsers((prev) => [...prev, result[0]]);

      toast.success("User added");
      reset();
    } catch {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;

    await fetch(`${API_URL}?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    setUsers(users.filter((u) => u.id !== id));
    toast.success("Deleted");
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (user) => {
    setEditId(user.id);

    reset({
      name: user.name,
      age: user.age,
      email: user.email,
      status: Number(user.status ?? 2),
      gender: user.gender,
      dob: user.dob,
      nationality: user.nationality,
      cnic: user.cnic,
    });
  };

  // =========================
  // FILTER
  // =========================
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // =========================
  // SORT
  // =========================
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      sortOrder === "asc"
        ? a.name?.localeCompare(b.name)
        : b.name?.localeCompare(a.name)
    );
  }, [filteredUsers, sortOrder]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      <ToastContainer />

      {/* HEADER */}
      <div className="bg-white shadow-sm border-b p-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between">
          <h1 className="text-2xl font-bold">Power Admin System</h1>
          <span>Total Users: {users.length}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">Users: {users.length}</div>
          <div className="bg-white p-4 rounded-xl shadow">Filtered: {sortedUsers.length}</div>
          <div className="bg-white p-4 rounded-xl shadow">Page: {currentPage}</div>
          <div className="bg-blue-600 text-white p-4 rounded-xl">Active System</div>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid md:grid-cols-4 gap-4"
          >

            <input placeholder="Name" className="p-3 border rounded"
              {...register("name")} />

            <input placeholder="Age" type="number" className="p-3 border rounded"
              {...register("age")} />

            <input placeholder="Email" className="p-3 border rounded"
              {...register("email")} />

            <select className="p-3 border rounded"
              {...register("status")}>
              <option value={2}>Active</option>
              <option value={1}>Pending</option>
              <option value={0}>Inactive</option>
            </select>

            <select className="p-3 border rounded"
              {...register("gender")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input type="date" className="p-3 border rounded"
              {...register("dob")} />

            <input placeholder="Nationality" className="p-3 border rounded"
              {...register("nationality")} />

            <input placeholder="CNIC" className="p-3 border rounded"
              {...register("cnic")} />

            <button className="bg-blue-600 text-white p-3 rounded col-span-4">
              {editId ? "Update User" : "Add User"}
            </button>

          </form>
        </div>

        {/* SEARCH */}
        <div className="flex gap-4 mb-6">
          <input
            className="p-3 border rounded w-full"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="p-3 border rounded"
            onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>

        {/* USERS */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">

            {currentUsers.map((u) => (
              <div key={u.id} className="group bg-white border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 relative overflow-hidden">
              {/* TOP COLOR STRIP */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              {/* HEADER */}
              <div className="flex items-start justify-between">

                {/* AVATAR + NAME */}
                <div className="flex items-center gap-3">

                  {/* AVATAR */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700 shadow-inner">
                    {u.gender === "male" && "👨"}
                    {u.gender === "female" && "👩"}
                    {u.gender !== "male" && u.gender !== "female" && "🧑"}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                      {u.name}
                    </h2>

                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      📧 {u.email}
                    </p>
                  </div>
                </div>

                {/* AGE BADGE */}
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  🎂 {u.age}
                </span>
              </div>

              {/* INFO GRID */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">

                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Gender</p>
                  <p>
                    {u.gender === "male" && "👨 Male"}
                    {u.gender === "female" && "👩 Female"}
                    {u.gender !== "male" && u.gender !== "female" && "🧑 Other"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">DOB</p>
                  <p>🎂 {u.dob || "—"}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Nationality</p>
                  <p>🌍 {u.nationality || "—"}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">CNIC</p>
                  <p>🆔 {u.cnic || "—"}</p>
                </div>

              </div>

              {/* STATUS */}
              <div className="mt-4 flex justify-between items-center">

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
                    Number(u.status) === 2
                      ? "bg-green-100 text-green-700"
                      : Number(u.status) === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {Number(u.status) === 2
                    ? "🟢 Active"
                    : Number(u.status) === 1
                    ? "🟡 Pending"
                    : "🔴 Inactive"}
                </span>

                {/* QUICK LABEL */}
                <span className="text-xs text-gray-400">
                  ID: {u.id?.slice?.(0, 6)}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4 opacity-90 group-hover:opacity-100 transition">

                <button
                  onClick={() => handleEdit(u)}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-orange-400 hover:to-amber-500 text-white py-2 rounded-xl font-medium transition"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(u.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white py-2 rounded-xl font-medium transition"
                >
                  🗑 Delete
                </button>

              </div>
            </div>
            ))}

          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-8">
          <button disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}>
            Prev
          </button>

          <span>{currentPage} / {totalPages || 1}</span>

          <button disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}