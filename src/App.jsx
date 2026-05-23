import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

export default function App() {

  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fake loading
  useEffect(() => {

    setTimeout(() => {

      setUsers([
        {
          id: 1,
          name: "Ali",
          age: 22,
          email: "ali@gmail.com",
        },
        {
          id: 2,
          name: "Ahmed",
          age: 25,
          email: "ahmed@gmail.com",
        },
      ]);

      setLoading(false);

    }, 1500);

  }, []);

  // CREATE + UPDATE
  const onSubmit = (data) => {

    if (editId) {

      const updatedUsers = users.map((user) =>
        user.id === editId
          ? { ...data, id: editId }
          : user
      );

      setUsers(updatedUsers);

      toast.success("User updated successfully");

      setEditId(null);

    } else {

      const newUser = {
        id: Date.now(),
        ...data,
      };

      setUsers([...users, newUser]);

      toast.success("User added successfully");
    }

    reset();
  };

  // EDIT
  const handleEdit = (user) => {

    reset(user);

    setEditId(user.id);
  };

  // DELETE
  const handleDelete = (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete?"
    );

    if (confirmDelete) {

      const filtered = users.filter(
        (user) => user.id !== id
      );

      setUsers(filtered);

      toast.success("User deleted");
    }
  };

  // SEARCH
  const filteredUsers = useMemo(() => {

    return users.filter((user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [users, search]);

  // SORT
  const sortedUsers = useMemo(() => {

    return [...filteredUsers].sort((a, b) => {

      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }

    });

  }, [filteredUsers, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(
    sortedUsers.length / usersPerPage
  );

  const indexOfLastUser =
    currentPage * usersPerPage;

  const indexOfFirstUser =
    indexOfLastUser - usersPerPage;

  const currentUsers = sortedUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  return (

    <div className="min-h-screen p-6 bg-gray-100">

      <ToastContainer />

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-8">
          React CRUD Application
        </h1>

        {/* FORM */}

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid md:grid-cols-3 gap-4"
          >

            {/* NAME */}

            <div>

              <input
                type="text"
                placeholder="Enter Name"
                className="w-full p-3 border rounded-lg"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 3,
                    message:
                      "Minimum 3 characters",
                  },
                })}
              />

              <p className="text-red-500 text-sm mt-1">
                {errors.name?.message}
              </p>

            </div>

            {/* AGE */}

            <div>

              <input
                type="number"
                placeholder="Enter Age"
                className="w-full p-3 border rounded-lg"
                {...register("age", {
                  required: "Age required",
                  min: {
                    value: 18,
                    message:
                      "Age must be 18+",
                  },
                  max: {
                    value: 60,
                    message:
                      "Age maximum is 60",
                  },
                })}
              />

              <p className="text-red-500 text-sm mt-1">
                {errors.age?.message}
              </p>

            </div>

            {/* EMAIL */}

            <div>

              <input
                type="email"
                placeholder="Enter Email"
                className="w-full p-3 border rounded-lg"
                {...register("email", {
                  required:
                    "Email is required",
                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message:
                      "Invalid email",
                  },
                })}
              />

              <p className="text-red-500 text-sm mt-1">
                {errors.email?.message}
              </p>

            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg col-span-full"
            >
              {editId
                ? "Update User"
                : "Add User"}
            </button>

          </form>

        </div>

        {/* SEARCH + SORT */}

        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">

          <input
            type="text"
            placeholder="Search user..."
            className="p-3 border rounded-lg w-full md:w-1/2"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            className="p-3 border rounded-lg"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value)
            }
          >
            <option value="asc">
              Sort A-Z
            </option>

            <option value="desc">
              Sort Z-A
            </option>
          </select>

        </div>

        {/* LOADING */}

        {
          loading ? (

            <div className="text-center text-2xl font-bold">
              Loading...
            </div>

          ) : (

            <>
              {/* USER CARDS */}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {
                  currentUsers.length > 0 ? (

                    currentUsers.map((user) => (

                      <div
                        key={user.id}
                        className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition"
                      >

                        <h2 className="text-2xl font-bold mb-2">
                          {user.name}
                        </h2>

                        <p className="mb-1">
                          Age: {user.age}
                        </p>

                        <p className="mb-4">
                          {user.email}
                        </p>

                        <div className="flex gap-4">

                          <button
                            onClick={() =>
                              handleEdit(user)
                            }
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(user.id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </div>

                    ))

                  ) : (

                    <div className="text-xl">
                      No users found
                    </div>

                  )
                }

              </div>

              {/* PAGINATION */}

              <div className="flex justify-center gap-4 mt-8">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                  className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="font-bold text-lg">
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                  className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>

              </div>
            </>
          )
        }

      </div>
    </div>
  );
}