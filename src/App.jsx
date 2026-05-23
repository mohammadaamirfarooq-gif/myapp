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
  const usersPerPage = 5;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // =========================
  // FETCH USERS (GET)
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
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // CREATE USER (POST - SUPABASE)
  // =========================
  const createUser = async (data) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "Accept-Profile": "record",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  };

  // =========================
  // SUBMIT (CREATE / UPDATE)
  // =========================
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (editId) {
        toast.info("Update logic not connected yet");
        setEditId(null);
        reset();
        return;
      }

      const result = await createUser(data);

      setUsers((prev) => [...prev, result[0]]);

      toast.success("User added successfully");

      reset();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE (SUPABASE)
  // =========================
  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this user?");
    if (!confirm) return;

    try {
      await fetch(`${API_URL}?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
          "Accept-Profile": "record",
        },
      });

      setUsers(users.filter((u) => u.id !== id));

      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // =========================
  // SORT
  // =========================
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
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
    <div className="min-h-screen p-6 bg-gray-100">
      <ToastContainer />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">
          Supabase CRUD App
        </h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl shadow grid md:grid-cols-3 gap-4"
        >
          <div>
            <input
              className="border p-2 w-full"
              placeholder="Name"
              {...register("name", {
                required: "Name required",
                minLength: { value: 3, message: "Min 3 chars" },
              })}
            />
            <p className="text-red-500 text-sm">
              {errors.name?.message}
            </p>
          </div>

          <div>
            <input
              className="border p-2 w-full"
              type="number"
              placeholder="Age"
              {...register("age", {
                required: "Age required",
                min: { value: 18, message: "18+" },
              })}
            />
            <p className="text-red-500 text-sm">
              {errors.age?.message}
            </p>
          </div>

          <div>
            <input
              className="border p-2 w-full"
              placeholder="Email"
              {...register("email", {
                required: "Email required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email",
                },
              })}
            />
            <p className="text-red-500 text-sm">
              {errors.email?.message}
            </p>
          </div>

          <button className="bg-blue-600 text-white p-2 col-span-full">
            Add User
          </button>
        </form>

        {/* SEARCH + SORT */}
        <div className="flex justify-between mt-6">
          <input
            className="border p-2 w-1/2"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-center mt-6 text-xl">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {currentUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white p-4 rounded shadow"
              >
                <h2 className="font-bold">{u.name}</h2>
                <p>{u.email}</p>
                <p>{u.age}</p>

                <div className="flex gap-3 mt-3">
                  <button className="bg-yellow-500 p-2 text-white">
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-500 p-2 text-white"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            {currentPage} / {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}