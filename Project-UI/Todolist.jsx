import React, { useEffect, useState } from "react";
import "./todostyle.css";
import axios from "axios";

function TodoApp1() {
  const [IsCompleteScreen, setIsCompleteScreen] = useState(true);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [completedTodos, setCompletedTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [dbID, setDbID] = useState();

  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getusers");
      setTodos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getusers");
        setTodos(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTodos();
  }, []);

  useEffect(() => {
    const fetchCompletedTodos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getusers");
        const completed = response.data.filter(
          (item) => item.completedOn !== null
        );
        setCompletedTodos(completed);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCompletedTodos();
  }, []);

  const handleAddTodo = async () => {
    if (!newTitle) {
      alert("Please enter a title");
      return;
    }
    if (!newDescription) {
      alert("Please enter a description");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/addTodo", {
        title: newTitle,
        description: newDescription,
        completedOn:null
      });
      setTodos([...allTodos, response.data]);
      setNewTitle("");
      setNewDescription("");
    } catch (error) {
      console.error(error);
    }
    getData();
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      const updatedAllTodos = allTodos.filter((item) => item._id !== id);
      setTodos(updatedAllTodos);
      const updatedCompletedTodos = completedTodos.filter(
        (item) => item._id !== id
      );
      setCompletedTodos(updatedCompletedTodos);
    } catch (error) {
      console.error(error);
    }
    getData();
  };

  const handleComplete = async (id) => {
    try {
      const now = new Date();
      const dd = now.getDate();
      const mm = now.getMonth() + 1;
      const yyyy = now.getFullYear();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const completedOn = `${dd}-${mm}-${yyyy} at ${h}:${m}:${s}`;

      await axios.put(`http://localhost:5000/completed/${id}`, {
        completedOn: completedOn,
      });

      const todo = allTodos.find((item) => item._id === id);
      const updatedItem = {
        ...todo,
        completedOn: completedOn,
      };

      const updatedCompletedArr = [...completedTodos, updatedItem];
      setCompletedTodos(updatedCompletedArr);
      const reducedTodo = allTodos.filter((item) => item._id !== id);
      setTodos(reducedTodo);
      const updatedAllTodos = allTodos.map((item) =>
        item._id === id ? updatedItem : item
      );
      setTodos(updatedAllTodos);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCompletedTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      const updatedCompletedArr = completedTodos.filter(
        (item) => item._id !== id
      );
      setCompletedTodos(updatedCompletedArr);
      const updatedTodos = allTodos.filter((item) => item._id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error(error);
    }
    getData();
  };

  const handleEditTodo = (item) => {
    setNewTitle(item.title);
    setNewDescription(item.description);
    setDbID(item._id);
    setEditingTodo(item);
    setIsEditFormVisible(true);
  };

  const handleUpdateTodo = async () => {
    if (editingTodo === null) {
      alert("No editing todo found");
      return;
    }
    try {
      const updatedItem = {
        ...editingTodo,
        title: newTitle,
        description: newDescription,

      };

      await axios.put(`http://localhost:5000/update/${dbID}`, updatedItem);

      const updatedTodos = allTodos.map((item) =>
        item._id === dbID ? updatedItem : item
      );
      setTodos(updatedTodos);
      const updatedCompletedTodos = completedTodos.map((item) =>
        item._id === dbID ? updatedItem : item
      );
      setCompletedTodos(updatedCompletedTodos);

      setNewTitle("");
      setNewDescription("");
      setEditingTodo(null);
      setIsEditFormVisible(false);
    } catch (error) {
      console.error(error);
    }
    getData();
  };

  const handleCancelEdit = () => {
    setNewTitle("");
    setNewDescription("");
    setEditingTodo(null);
    setIsEditFormVisible(false);
  };

  return (
    <div className="App">
      <h1>My Todos</h1>
      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter the Title"
              pattern="[a-z]*[A-Z]*"
            />
          </div>
          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description"
              pattern="[a-z]*[A-Z]*"
            />
          </div>
          <div className="todo-input-item">
            <button
              type="button"
              onClick={isEditFormVisible ? handleUpdateTodo : handleAddTodo}
              className="primaryBtn"
            >
              {isEditFormVisible ? "Update" : "Add Task"}
            </button>
          </div>
        </div>

        <div className="btn-area">
          <button
            className={`secondaryBtn1 ${IsCompleteScreen === false && "active"}`}
            onClick={() => setIsCompleteScreen(false)}
          >
            AllTodo
          </button>

          <button
            className={`secondaryBtn ${IsCompleteScreen === true && "active"}`}
            onClick={() => setIsCompleteScreen(true)}
          >
            TodoCompleted
          </button>
        </div>

        <div className="todo-list">
          {IsCompleteScreen === false &&
            allTodos.map((item, index) => {
              const taskNumber = index + 1;
              return (
                <div className="todo-list-item" key={index}>
                  <div>
                    <span
                      style={{
                        textDecoration: item.completedOn
                          ? "line-through"
                          : "",
                        color: "green",
                      }}
                    >
                      <h2>Task {taskNumber}</h2>
                    </span>
                    <div className="title">
                      <h3>{item.title}</h3>
                    </div>
                    <div className="description">
                      <p className="para">{item.description}</p>
                    </div>
                    <p style={{ marginLeft: "20px", fontSize: "17px" }}>
  <small>
    <i>CompletedOn: {item.completedOn ? item.completedOn.toLocaleString() : ""}</i>
  </small>
</p>
                  </div>
                  <div className="todobuttons">
                    <button
                      className="check-icon"
                      onClick={() => handleComplete(item._id)}
                    >
                      Complete
                    </button>
                    <button
                      className="icon"
                      onClick={() => handleDeleteTodo(item._id)}
                      title="delete"
                    >
                      Delete
                    </button>
                    <button
                      className="icon"
                      onClick={() => handleEditTodo(item)}
                    >
                      Edit Todo
                    </button>
                    <button
                      className="icon"
                      onClick={() => handleCancelEdit()}
                    >
                      CancelEdit
                    </button>
                  </div>
                </div>
              );
            })}
          {IsCompleteScreen === true &&
            completedTodos.map((item, index) => {
              const taskNumber = index + 1;
              return (
                <div className="todo-list-item" key={index}>
                  <div>
                    <span
                      style={{
                        textDecoration: item.completedOn ? "line-through" : "",
                        color: "green",
                      }}
                    >
                      <h2>Task {taskNumber}</h2>
                    </span>
                    <div className="title">
                      <h3>{item.title}</h3>
                    </div>
                    <div className="description">
                      <p className="para">{item.description}</p>
                    </div>
                    <p style={{ marginLeft: "20px", fontSize: "17px" }}>
  <small>
    <i>CompletedOn: {item.completedOn ? item.completedOn.toLocaleString() : ""}</i>
  </small>
</p>
                  </div>
                  <div className="todobuttons">
                    <button
                      className="check-icon"
                      onClick={() => handleDeleteCompletedTodo(item._id)}
                      title="delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default TodoApp1;