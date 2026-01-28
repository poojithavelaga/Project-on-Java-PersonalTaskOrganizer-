
let tasks = [];
let tomorrowTasks = [];
let celebrated = false;

/* =========================
   LOAD DATA ON PAGE LOAD
========================= */
window.onload = function () {
    const savedToday = localStorage.getItem("todayTasks");
    const savedTomorrow = localStorage.getItem("tomorrowTasks");

    if (savedToday) {
        tasks = JSON.parse(savedToday);
        renderTasks();
    }

    if (savedTomorrow) {
        tomorrowTasks = JSON.parse(savedTomorrow);
        renderTomorrowTasks();
    }
};

/* =========================
   SAVE TO LOCAL STORAGE
========================= */
function saveTasks() {
    localStorage.setItem("todayTasks", JSON.stringify(tasks));
    localStorage.setItem("tomorrowTasks", JSON.stringify(tomorrowTasks));
}

/* =========================
   TODAY TASK FUNCTIONS
========================= */
function addTask() {
    const input = document.getElementById("taskInput");
    if (input.value.trim() === "") return;

    tasks.push({ text: input.value, done: false });
    input.value = "";
    celebrated = false;

    renderTasks();
    saveTasks();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
    saveTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
    saveTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = task.done ? "completed" : "";
        li.innerHTML = `
            <span>${task.text}</span>
            <div class="actions">
                <button class="done" onclick="toggleTask(${index})">✔</button>
                <button class="delete" onclick="deleteTask(${index})">🗑</button>
            </div>
        `;
        list.appendChild(li);
    });

    updateProgress();
}

/* =========================
   PROGRESS + CELEBRATION
========================= */
function updateProgress() {
    const completed = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("progress").style.width = percent + "%";
    const status = document.getElementById("statusText");

    if (total === 0) {
        status.innerText = "Add tasks to begin 🚀";
    } else if (percent === 100) {
        status.innerText = "Yahoo! All tasks completed 🎉";

        if (!celebrated) {
            launchConfetti();
            document.getElementById("celebrateSound").play();
            celebrated = true;
        }
    } else {
        status.innerText = percent + "% Completed – Keep going 💪";
    }
}

function finishDay() {
    const msg = document.getElementById("finalMessage");
    const tomorrowSection = document.getElementById("tomorrowSection");

    msg.innerHTML = "";
    tomorrowSection.style.display = "none";

    if (tasks.length === 0) {
        msg.innerText = "⚠️ No tasks added today.";
        msg.style.color = "gray";
        return;
    }

    const allDone = tasks.every(t => t.done);

    if (allDone) {
        msg.style.color = "green";
        msg.innerHTML = `
            🎉 Well done! You finished all tasks today!<br>
            Do you want to enter tomorrow's tasks?<br>
            <button class="choice-btn yes" onclick="openTomorrow()">YES</button>
            <button class="choice-btn no">NO</button>
        `;
    } else {
        msg.style.color = "orange";
        msg.innerHTML = `
            ⏳ Some tasks are pending.<br>
            <button class="choice-btn yes" onclick="openTomorrow()">
                Add it to Tomorrow's List
            </button>
        `;
    }

    // 🔴 IMPORTANT: Day is finished → clear today's tasks from storage
    localStorage.removeItem("todayTasks");
}


/* =========================
   TOMORROW TASK FUNCTIONS
========================= */
function openTomorrow() {
    const tomorrowSection = document.getElementById("tomorrowSection");
    tomorrowSection.style.display = "block";
    document.getElementById("tomorrowInput").focus();

    // Move pending tasks automatically
    tasks.forEach(task => {
        if (!task.done && !tomorrowTasks.includes(task.text)) {
            tomorrowTasks.push(task.text);
        }
    });

    renderTomorrowTasks();
    saveTasks();
}

function addTomorrowTask() {
    const input = document.getElementById("tomorrowInput");
    if (input.value.trim() === "") return;

    tomorrowTasks.push(input.value);
    input.value = "";

    renderTomorrowTasks();
    saveTasks();
}

function renderTomorrowTasks() {
    const list = document.getElementById("tomorrowList");
    list.innerHTML = "";

    tomorrowTasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task;
        list.appendChild(li);
    });
}

/* =========================
   CONFETTI ANIMATION
========================= */
function launchConfetti() {
    const container = document.getElementById("confetti-container");
    const colors = ["#ff0", "#f00", "#0f0", "#00f", "#ff69b4"];

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration =
            Math.random() * 2 + 2 + "s";

        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}
function startNewDay() {
    if (!confirm("Do you want to start a new day and clear today's tasks?")) {
        return;
    }

    // Clear only today's tasks
    tasks = [];
    localStorage.removeItem("todayTasks");

    // Reset UI
    document.getElementById("taskList").innerHTML = "";
    document.getElementById("progress").style.width = "0%";
    document.getElementById("statusText").innerText = "New day started 🌅";
    document.getElementById("finalMessage").innerHTML = "";
    celebrated = false;
}