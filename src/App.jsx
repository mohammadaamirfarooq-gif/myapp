import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import {
  FaEdit,
  FaEnvelope,
  FaPlus,
  FaSearch,
  FaSortAlphaDown,
  FaTimes,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://vgthwiqpvzdptqhvzqmx.supabase.co/rest/v1/users";
const API_KEY = "sb_publishable_oFuQ3NpyweCtNJIbcwLvyg_jMIHzIuQ";

const statusOptions = {
  2: {
    label: "Active",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  1: {
    label: "Pending",
    dot: "bg-amber-500",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  0: {
    label: "Inactive",
    dot: "bg-rose-500",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

const inputClass = (hasError) =>
  `h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition focus:ring-2 ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-slate-100"
  }`;

const FieldError = ({ message }) =>
  message ? (
    <p className="text-xs font-medium text-rose-600">{message}</p>
  ) : null;

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
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      status: 2,
      gender: "male",
    },
  });

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

  const createUser = async (data) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "Content-Profile": "record",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  };

  const updateUser = async (id, data) => {
    const res = await fetch(`${API_URL}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "Content-Profile": "record",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        age: data.age === "" ? null : Number(data.age),
        status: Number(data.status),
        dob: data.dob || null,
      };

      if (editId) {
        const updated = await updateUser(editId, payload);

        setUsers((prev) =>
          prev.map((u) => (u.id === editId ? updated[0] : u))
        );

        toast.success("User updated");
        setEditId(null);
        reset({ status: 2, gender: "male" });
        return;
      }

      const result = await createUser(payload);
      setUsers((prev) => [...prev, result[0]]);

      toast.success("User added");
      reset({ status: 2, gender: "male" });
    } catch {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = () => {
    toast.error("Please fill all required fields");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;

    await fetch(`${API_URL}?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("Deleted");
  };

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

  const handleCancelEdit = () => {
    setEditId(null);
    reset({ status: 2, gender: "male" });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      sortOrder === "asc"
        ? a.name?.localeCompare(b.name)
        : b.name?.localeCompare(a.name)
    );
  }, [filteredUsers, sortOrder]);

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const activeCount = users.filter((u) => Number(u.status) === 2).length;
  const pendingCount = users.filter((u) => Number(u.status) === 1).length;
  const inactiveCount = users.filter((u) => Number(u.status) === 0).length;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <ToastContainer position="top-right" autoClose={2200} />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-950 text-white">
              <FaUsers />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Power Admin System
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage user records, statuses, and identity details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-4">
            <div className="border-r border-slate-200 px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Total
              </p>
              <p className="mt-1 text-xl font-bold">{users.length}</p>
            </div>
            <div className="border-r border-slate-200 px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Active
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-700">
                {activeCount}
              </p>
            </div>
            <div className="border-r border-slate-200 px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Pending
              </p>
              <p className="mt-1 text-xl font-bold text-amber-700">
                {pendingCount}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">
                Inactive
              </p>
              <p className="mt-1 text-xl font-bold text-rose-700">
                {inactiveCount}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                {editId ? "Edit User Record" : "Create User Record"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter verified user information for the directory.
              </p>
            </div>
            <span className="hidden rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600 sm:inline-flex">
              {editId ? "Editing" : "New Entry"}
            </span>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4"
          >
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Name
              </span>
              <input
                placeholder="Full name"
                className={inputClass(errors.name)}
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              <FieldError message={errors.name?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Age
              </span>
              <input
                placeholder="Age"
                type="number"
                className={inputClass(errors.age)}
                {...register("age", {
                  required: "Age is required",
                  min: {
                    value: 1,
                    message: "Age must be greater than 0",
                  },
                })}
              />
              <FieldError message={errors.age?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Email
              </span>
              <input
                placeholder="name@example.com"
                className={inputClass(errors.email)}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              <FieldError message={errors.email?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Status
              </span>
              <select
                className={inputClass(errors.status)}
                {...register("status", {
                  required: "Status is required",
                })}
              >
                <option value={2}>Active</option>
                <option value={1}>Pending</option>
                <option value={0}>Inactive</option>
              </select>
              <FieldError message={errors.status?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Gender
              </span>
              <select
                className={inputClass(errors.gender)}
                {...register("gender", {
                  required: "Gender is required",
                })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <FieldError message={errors.gender?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                DOB
              </span>
              <input
                type="date"
                className={inputClass(errors.dob)}
                {...register("dob", {
                  required: "Date of birth is required",
                })}
              />
              <FieldError message={errors.dob?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Nationality
              </span>
              <input
                placeholder="Nationality"
                className={inputClass(errors.nationality)}
                {...register("nationality", {
                  required: "Nationality is required",
                })}
              />
              <FieldError message={errors.nationality?.message} />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">
                CNIC
              </span>
              <input
                placeholder="CNIC"
                className={inputClass(errors.cnic)}
                {...register("cnic", {
                  required: "CNIC is required",
                })}
              />
              <FieldError message={errors.cnic?.message} />
            </label>

            <div className="flex gap-3 md:col-span-2 xl:col-span-4">
              <button
                disabled={loading}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <FaPlus className="text-xs" />
                {editId ? "Update User" : "Add User"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FaTimes className="text-xs" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                User Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {sortedUsers.length} result
                {sortedUsers.length === 1 ? "" : "s"} shown from {users.length}{" "}
                total records.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  className="h-10 min-w-0 rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:w-72"
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <label className="relative">
                <FaSortAlphaDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <select
                  className="h-10 rounded-md border border-slate-300 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="asc">Name A-Z</option>
                  <option value="desc">Name Z-A</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm font-medium text-slate-500">
              Loading users...
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm font-medium text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">User</th>
                    <th className="px-5 py-3 font-bold">Age</th>
                    <th className="px-5 py-3 font-bold">Gender</th>
                    <th className="px-5 py-3 font-bold">DOB</th>
                    <th className="px-5 py-3 font-bold">Nationality</th>
                    <th className="px-5 py-3 font-bold">CNIC</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 text-right font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {currentUsers.map((u) => {
                    const status =
                      statusOptions[Number(u.status)] || statusOptions[0];

                    const initials =
                      u.name
                        ?.split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "U";

                    return (
                      <tr key={u.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {u.name || "Unnamed User"}
                              </p>
                              <p className="flex items-center gap-1 truncate text-sm text-slate-500">
                                <FaEnvelope className="text-xs text-slate-400" />
                                {u.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {u.age || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm capitalize text-slate-700">
                          {u.gender || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {u.dob || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {u.nationality || "-"}
                        </td>

                        <td className="px-5 py-3 text-sm text-slate-700">
                          {u.cnic || "-"}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${status.dot}`}
                            />
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(u)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                              title="Edit user"
                              aria-label="Edit user"
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => handleDelete(u.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                              title="Delete user"
                              aria-label="Delete user"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages || 1}
            </p>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}