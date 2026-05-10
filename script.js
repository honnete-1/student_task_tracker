// 1.  Global State
let tasks = [];

// Track whether dark mode is currently active
let isDarkMode = false;


/* 2. Initialization:this part runs automatically as soon as the page loads*/
document.addEventListener('DOMContentLoaded', function () {
  loadTasksFromStorage();

  updateClock();
  setInterval(updateClock, 1000);

  const savedTheme = localStorage.getItem('taskflow-theme');
  if (savedTheme === 'dark') {
    enableDarkMode();
  }
  const form = document.getElementById('task-form');
  form.addEventListener('submit', handleFormSubmit);
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', toggleDarkMode);
  updateStats();
});


/* 3. Live clock, updates the time displayed in the navbar every second.*/
function updateClock() {
  // Create a new Date object to get the current time
  const now = new Date();

  // Format the time as HH:MM:SS (12-hour format with AM/PM)
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Format the date as "Mon, Jan 01 2025"
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const displayText = dateString + ' — ' + timeString;
  const clockEl = document.getElementById('live-clock');
  const clockSmEl = document.getElementById('live-clock-sm');

  if (clockEl) clockEl.textContent = displayText;
  if (clockSmEl) clockSmEl.textContent = timeString;
}


/* 4. dark toggle mode will switch between the light "Liquid Silver" and
   dark "Obsidian Titanium" themes.*/

// I called this to switch themes
function toggleDarkMode() {
  if (isDarkMode) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

function enableDarkMode() {

  document.documentElement.classList.add('dark');
  isDarkMode = true;

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.textContent = '☀️';

  localStorage.setItem('taskflow-theme', 'dark');
}

function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  isDarkMode = false;

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.textContent = '🌙';

  localStorage.setItem('taskflow-theme', 'light');
}


/* 
   5. Form submission and validation runs when the user clicks "Add Task".
   it validates the inputs before creating a task.*/
   
function handleFormSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('task-name');
  const dateInput = document.getElementById('task-date');

  const taskName = nameInput.value.trim();
  const taskDate = dateInput.value; 
//  Validation
  let isValid = true;

  // Check if the name is empty or only spaces
  if (taskName === '') {
    showError('name-error');
    isValid = false;
  } else {
    hideError('name-error');
  }

  // Check if no date was selected
  if (taskDate === '') {
    showError('date-error');
    isValid = false;
  } else {
    hideError('date-error');
  }

  // If either field failed validation, stop here — don't add the task
  if (!isValid) return;

  // If both fields are valid add the task

  const newTask = createTask(taskName, taskDate);

  tasks.push(newTask);
  renderTaskCard(newTask);
  updateStats();
  saveTasksToStorage();
  nameInput.value = '';
  dateInput.value = '';

  // Hide any error messages that might be showing
  hideError('name-error');
  hideError('date-error');

  // Hide the empty state message (if it was showing)
  toggleEmptyState();
}

function showError(errorId) {
  const el = document.getElementById(errorId);
  if (el) el.classList.add('show');
}

function hideError(errorId) {
  const el = document.getElementById(errorId);
  if (el) el.classList.remove('show');
}


/* 6. Ceating a task object*/
function createTask(name, date) {
  return {
    id: Date.now(),  
    name: name,
    date: date       
}


/* 7. Rendering task card to DOM */
function renderTaskCard(task) {
  const priority = getPriorityInfo(task.date);
  const formattedDate = formatDate(task.date);
  const card = document.createElement('div');

  card.setAttribute('data-id', task.id);

  card.classList.add('task-enter');

  card.innerHTML = `
    <div class="bento-card p-5 h-full flex flex-col justify-between gap-3 ${priority.cssClass}">
      
      <!-- Top row: priority label + dot -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="priority-dot" style="background:${priority.dotColor}"></span>
          <span class="text-xs font-semibold uppercase tracking-wider"
                style="color:${priority.dotColor}; letter-spacing:0.07em">
            ${priority.label}
          </span>
        </div>
        <!-- Delete button — calls deleteTask with this task's ID -->
        <button
          class="delete-btn"
          onclick="deleteTask(${task.id})"
          aria-label="Delete task: ${escapeHtml(task.name)}"
          title="Delete this task">
          Delete
        </button>
      </div>

      <!-- Task name -->
      <div>
        <h3 class="text-sm font-semibold leading-snug"
            style="color: var(--text-main)">
          ${escapeHtml(task.name)}
        </h3>
      </div>

      <!-- Due date -->
      <div class="flex items-center gap-1.5 text-xs" style="color: var(--text-sub)">
        <span style="opacity:0.7">📅</span>
        <span>Due: <strong style="color:var(--text-main)">${formattedDate}</strong></span>
      </div>

    </div>
  `;

  // Add the card to the task grid in the HTML
  const taskGrid = document.getElementById('task-grid');
  taskGrid.appendChild(card);

  // Hide empty state (there's at least one task now)
  toggleEmptyState();
}
/*  8. Delete a task: Finds the task by ID, animates it out, removes it from the array, 
updates stats, and saves to Local Storage.*/
function deleteTask(taskId) {
  const card = document.querySelector(`[data-id="${taskId}"]`);

  if (card) {
    const cardInner = card.querySelector('.bento-card');
    if (cardInner) cardInner.classList.add('task-exit');

    // The animation takes 0.22 seconds (220ms) — see style.css
    setTimeout(function () {
      card.remove();
      tasks = tasks.filter(function (task) {
        return task.id !== taskId;
      });

      updateStats();

      saveTasksToStorage();

      toggleEmptyState();

    }, 230); 
  }
}


/* 9. Updating the stats widget/; this part recounts the tasks and updates the stat numbers and
   the hero section counts whenever tasks change. */
function updateStats() {
  const today = getTodayDateString(); // "YYYY-MM-DD"

  let totalCount   = tasks.length;
  let todayCount   = 0;
  let overdueCount = 0;
  let upcomingCount = 0;

  tasks.forEach(function (task) {
    if (task.date < today) {
      overdueCount++;
    } else if (task.date === today) {
      todayCount++;
    } else {
      upcomingCount++;
    }
  });

  // Update the three stat cards (with a little pop animation)
  animateStatUpdate('stat-total',   totalCount);
  animateStatUpdate('stat-today',   todayCount);
  animateStatUpdate('stat-overdue', overdueCount);

  // Update the hero section mini stats
  updateElement('hero-upcoming-count', upcomingCount);
  updateElement('hero-today-count',    todayCount);
  updateElement('hero-overdue-count',  overdueCount);

  // Update the navbar task count pill
  updateElement('nav-task-count', totalCount);
}

// Updates a stat number with a subtle pop animation
function animateStatUpdate(elementId, newValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = newValue;

  // Briefly add the pop animation class, then remove it
  el.classList.remove('stat-pop');
  // We use setTimeout(0) to allow the browser to re-process the class removal
  setTimeout(function () {
    el.classList.add('stat-pop');
  }, 0);
}
function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* 10. Local storage, save, and load: IN this part I erialise our tasks array to a JSON string to save it,
   and parse it back on load*/

const STORAGE_KEY = 'taskflow-tasks';

function saveTasksToStorage() {
  const tasksJSON = JSON.stringify(tasks);
  localStorage.setItem(STORAGE_KEY, tasksJSON);
}
function loadTasksFromStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  // If there's no saved data, there's nothing to load
  if (savedData === null) {
    toggleEmptyState();
    return;
  }

  // Parse the JSON string back into a JavaScript array
  try {
    const savedTasks = JSON.parse(savedData);

    if (!Array.isArray(savedTasks)) return;

    tasks = savedTasks;

    // Render each saved task to the screen
    tasks.forEach(function (task) {
      renderTaskCard(task);
    });

    // I update stats with the loaded data
    updateStats();

  } catch (error) {
    // If parsing fails for any reason, just start fresh
    console.error('Failed to load tasks from storage:', error);
    tasks = [];
  }

  toggleEmptyState();
}


/* 11. Helper functions: Small utility functions used throughout the code above*/
function toggleEmptyState() {
  const emptyState = document.getElementById('empty-state');
  if (!emptyState) return;

  if (tasks.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
}

function getTodayDateString() {
  const today = new Date();
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day   = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric'
  });
}

function getPriorityInfo(dateString) {
  const today   = getTodayDateString();
  const dueDate = dateString;

  if (dueDate < today) {
    // The due date is in the past
    return {
      label:    'Overdue',
      cssClass: 'priority-overdue',
      dotColor: '#F87171'  
    };
  } else if (dueDate === today) {
    return {
      label:    'Due Today',
      cssClass: 'priority-today',
      dotColor: '#FBBF24'  // amber
    };
  } else {
    return {
      label:    'Upcoming',
      cssClass: 'priority-upcoming',
      dotColor: '#22D3EE'  // cyan
    };
  }
}

// this escapes HTML special characters in user-provided text and prevents XSS (Cross-Site Scripting) attacks where
// a user might type HTML/JS code into the task name input
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
