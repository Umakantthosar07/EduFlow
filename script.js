let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("taskForm").addEventListener("submit", addTask);
  setDefaultDateTime();
  updateUI();

  setInterval(checkReminders, 60000);
});

function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function setDefaultDateTime() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById("taskDueDate").value = localISOTime;
}

function addTask(e) {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const subject = document.getElementById("taskSubject").value.trim();
  const dueDate = document.getElementById("taskDueDate").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title || !subject || !dueDate) {
    alert("Please fill in all fields");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    subject,
    dueDate,
    priority,
    completed: false,
  };

  tasks.push(task);
  saveTasks();
  updateUI();
  document.getElementById("taskForm").reset();
  setDefaultDateTime();
  showNotification("Task added successfully 🎉");
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    updateUI();
    showNotification(task.completed ? "✅ Task completed!" : "↩️ Task marked incomplete");
  }
}

function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    updateUI();
    showNotification("🗑️ Task deleted");
  }
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("progressPercent").textContent = progress + "%";
  document.getElementById("progressBar").style.width = progress + "%";
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>🎯 No tasks yet. Add your first study task above!</p></div>';
    return;
  }

  const sorted = tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  list.innerHTML = sorted.map((task) => {
    const due = new Date(task.dueDate);
    const overdue = new Date() > due && !task.completed;
    const formattedDate = due.toLocaleDateString() + " " + due.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    return `
      <div class="task ${task.completed ? "completed" : ""} ${overdue ? "overdue" : ""}">
        <div class="task-info">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span>📚 ${task.subject}</span>
            <span>📅 ${formattedDate}</span>
            <span class="priority priority-${task.priority}">${task.priority}</span>
            ${overdue ? "<span style='color:#dc3545;font-weight:600;'>⚠️ OVERDUE</span>" : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-small" onclick="toggleTask(${task.id})">${task.completed ? "↩️  Undo" : "✅ Done"}</button>
          <button class="btn btn-small btn-danger" onclick="deleteTask(${task.id})">🗑️ Delete</button>
        </div>
      </div>`;
  }).join("");
}

function updateUI() {
  updateStats();
  renderTasks();
}

function showNotification(msg) {
  const note = document.createElement("div");
  note.textContent = msg;
  note.style.cssText =
    "position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:15px 25px;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,0.2);z-index:1000;font-weight:600;";
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}

function checkReminders() {
  const now = new Date();
  tasks.forEach((task) => {
    if (!task.completed && !task.reminded) {
      const diff = (new Date(task.dueDate) - now) / (1000 * 60 * 60);
      if (diff > 0 && diff <= 1) {
        showNotification(`⏰ Reminder: "${task.title}" is due soon!`);
        task.reminded = true;
        saveTasks();
      }
    }
  });
}
