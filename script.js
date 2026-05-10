
// This array holds all of the user's task objects.
// Each task looks like: { id: 1234567890, name: "Essay", date: "2025-09-15" }
let tasks = [];

// Track whether dark mode is currently active
let isDarkMode = false;


/* ============================================================
   2. INITIALISATION
   This runs automatically as soon as the page loads.
   We load saved tasks, start the clock, and check the
   user's saved theme preference.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  // Step 1: Load any tasks saved from a previous session
  loadTasksFromStorage();

  // Step 2: Start the live clock so it ticks immediately
  updateClock();
  // Update the clock every second
  setInterval(updateClock, 1000);

  // Step 3: Check if the user previously chose dark mode
  // localStorage.getItem returns null if the key doesn't exist
  const savedTheme = localStorage.getItem('taskflow-theme');
  if (savedTheme === 'dark') {
    enableDarkMode();
  }

  // Step 4: Hook up the form to our addTask function
  const form = document.getElementById('task-form');
  form.addEventListener('submit', handleFormSubmit);

  // Step 5: Hook up the theme toggle button
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', toggleDarkMode);

  // Step 6: Update all the stats widgets on initial load
  updateStats();
});


/* ============================================================
   3. LIVE CLOCK
   Updates the time displayed in the navbar every second.
   ============================================================ */
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

  // The full text to show: "Mon, Jan 01 2025 — 02:45:30 PM"
  const displayText = dateString + ' — ' + timeString;

  // Update both clock elements (desktop + mobile versions)
  const clockEl = document.getElementById('live-clock');
  const clockSmEl = document.getElementById('live-clock-sm');

  if (clockEl) clockEl.textContent = displayText;
  // On mobile we show a shorter version
  if (clockSmEl) clockSmEl.textContent = timeString;
}


/* ============================================================
   4. DARK MODE TOGGLE
   Switches between the light "Liquid Silver" and
   dark "Obsidian Titanium" themes.
   ============================================================ */

// Call this to switch themes
function toggleDarkMode() {
  if (isDarkMode) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

function enableDarkMode() {
  // Adding "dark" class to <html> activates Tailwind's dark: variants
  // and our CSS variable overrides in .dark { ... }
  document.documentElement.classList.add('dark');
  isDarkMode = true;

  // Change the toggle button icon to a sun (to indicate "click to go light")
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.textContent = '☀️';

  // Save the preference so it persists after page refresh
  localStorage.setItem('taskflow-theme', 'dark');
}

function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  isDarkMode = false;

  // Change the icon back to a moon
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.textContent = '🌙';

  // Save the preference
  localStorage.setItem('taskflow-theme', 'light');
}


/* ============================================================
   5. FORM SUBMISSION & VALIDATION
   Runs when the user clicks "Add Task".
   Validates the inputs before creating a task.
   ============================================================ */
function handleFormSubmit(event) {
  // Prevent the browser from reloading the page on form submit
  event.preventDefault();

  // Grab the values from the input fields
  const nameInput = document.getElementById('task-name');
  const dateInput = document.getElementById('task-date');

  // .trim() removes any leading/trailing spaces from the name
  const taskName = nameInput.value.trim();
  const taskDate = dateInput.value; // Date value looks like "2025-09-15"

  // --- VALIDATION ---
  // We check if either field is empty, and show error messages if so.
  // We use flags (booleans) to track which fields have errors.
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

  // --- BOTH FIELDS ARE VALID — ADD THE TASK ---

  // Create a new task object with a unique ID
  const newTask = createTask(taskName, taskDate);

  // Add it to our global tasks array
  tasks.push(newTask);

  // Render the task card to the screen
  renderTaskCard(newTask);

  // Update the stats widgets
  updateStats();

  // Save the updated tasks array to Local Storage
  saveTasksToStorage();

  // Clear the form inputs so the user can add another task
  nameInput.value = '';
  dateInput.value = '';

  // Hide any error messages that might be showing
  hideError('name-error');
  hideError('date-error');

  // Hide the empty state message (if it was showing)
  toggleEmptyState();
}

// Shows the error message element with the given ID
function showError(errorId) {
  const el = document.getElementById(errorId);
  if (el) el.classList.add('show');
}

// Hides the error message element with the given ID
function hideError(errorId) {
  const el = document.getElementById(errorId);
  if (el) el.classList.remove('show');
}


/* ============================================================
   6. CREATING A TASK OBJECT
   A simple function that packages the task data into an object.
   Using Date.now() gives us a unique number as the task ID.
   ============================================================ */
function createTask(name, date) {
  return {
    id: Date.now(),  // e.g. 1723456789012 — unique every millisecond
    name: name,
    date: date       // stored as "YYYY-MM-DD" string
  };
}


/* ============================================================
   7. RENDERING A TASK CARD TO THE DOM
   Takes a task object and builds HTML for it,
   then inserts it into the task grid on the page.
   ============================================================ */
function renderTaskCard(task) {
  // Figure out the priority (overdue / today / upcoming)
  const priority = getPriorityInfo(task.date);

  // Format the date to be more human-readable
  const formattedDate = formatDate(task.date);

  // Create a new <div> element for the task card
  const card = document.createElement('div');

  // Give the card a data attribute so we can find it later when deleting
  card.setAttribute('data-id', task.id);

  // Apply the task-enter animation class (defined in style.css)
  card.classList.add('task-enter');

  // Build the card's inner HTML
  // The priority.cssClass controls the left border color
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


/* ============================================================
   8. DELETING A TASK
   Finds the task by ID, animates it out, removes it from
   the array, updates stats, and saves to Local Storage.
   ============================================================ */
function deleteTask(taskId) {
  // Find the card element in the DOM using the data-id attribute
  const card = document.querySelector(`[data-id="${taskId}"]`);

  if (card) {
    // Animate the card out (uses .task-exit CSS animation)
    const cardInner = card.querySelector('.bento-card');
    if (cardInner) cardInner.classList.add('task-exit');

    // Wait for the animation to finish, then remove the element
    // The animation takes 0.22 seconds (220ms) — see style.css
    setTimeout(function () {
      card.remove();

      // Remove the task from our tasks array
      // .filter() creates a new array without the deleted task
      tasks = tasks.filter(function (task) {
        return task.id !== taskId;
      });

      // Update the stats widgets
      updateStats();

      // Save the updated list to Local Storage
      saveTasksToStorage();

      // Show the empty state if no tasks remain
      toggleEmptyState();

    }, 230); // 230ms matches the animation duration
  }
}


/* ============================================================
   9. UPDATING THE STATS WIDGETS
   Recounts the tasks and updates the stat numbers and
   the hero section counts whenever tasks change.
   ============================================================ */
function updateStats() {
  const today = getTodayDateString(); // "YYYY-MM-DD"

  // Count tasks in each category
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

// Simple helper to update an element's text content
function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}


/* ============================================================
   10. LOCAL STORAGE — SAVE & LOAD
   We serialise our tasks array to a JSON string to save it,
   and parse it back on load.
   ============================================================ */

// The key name we use in Local Storage
const STORAGE_KEY = 'taskflow-tasks';

// Saves the current tasks array to Local Storage
function saveTasksToStorage() {
  // JSON.stringify converts our array to a string like:
  // '[{"id":123,"name":"Essay","date":"2025-09-01"}]'
  const tasksJSON = JSON.stringify(tasks);
  localStorage.setItem(STORAGE_KEY, tasksJSON);
}

// Loads saved tasks from Local Storage and renders them
function loadTasksFromStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  // If there's no saved data, there's nothing to load
  if (savedData === null) {
    toggleEmptyState();
    return;
  }

  // Parse the JSON string back into a JavaScript array
  // We wrap this in try/catch in case the saved data is corrupted
  try {
    const savedTasks = JSON.parse(savedData);

    // Check that it's actually an array
    if (!Array.isArray(savedTasks)) return;

    // Put the saved tasks into our global array
    tasks = savedTasks;

    // Render each saved task to the screen
    tasks.forEach(function (task) {
      renderTaskCard(task);
    });

    // Update stats with the loaded data
    updateStats();

  } catch (error) {
    // If parsing fails for any reason, just start fresh
    console.error('Failed to load tasks from storage:', error);
    tasks = [];
  }

  toggleEmptyState();
}


/* ============================================================
   11. HELPER FUNCTIONS
   Small utility functions used throughout the code above.
   ============================================================ */

// Shows or hides the empty state message based on task count
function toggleEmptyState() {
  const emptyState = document.getElementById('empty-state');
  if (!emptyState) return;

  if (tasks.length === 0) {
    // Show the empty state
    emptyState.style.display = 'flex';
  } else {
    // Hide it when tasks exist
    emptyState.style.display = 'none';
  }
}

// Returns today's date as a "YYYY-MM-DD" string
// This format matches what <input type="date"> gives us
function getTodayDateString() {
  const today = new Date();
  // We use toLocaleDateString with a specific locale and options
  // to consistently get YYYY-MM-DD regardless of the user's locale
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day   = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Takes a "YYYY-MM-DD" date string and returns a formatted date
// e.g. "2025-09-15" → "Mon, Sep 15 2025"
function formatDate(dateString) {
  // Note: we add 'T00:00:00' to avoid timezone offset issues that
  // can make the date display one day off in some browsers
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric'
  });
}

// Determines the priority level of a task based on its due date
// Returns an object with a CSS class name, a label, and a colour
function getPriorityInfo(dateString) {
  const today   = getTodayDateString();
  const dueDate = dateString;

  if (dueDate < today) {
    // The due date is in the past
    return {
      label:    'Overdue',
      cssClass: 'priority-overdue',
      dotColor: '#F87171'  // soft red
    };
  } else if (dueDate === today) {
    // The due date is today
    return {
      label:    'Due Today',
      cssClass: 'priority-today',
      dotColor: '#FBBF24'  // amber
    };
  } else {
    // The due date is in the future
    return {
      label:    'Upcoming',
      cssClass: 'priority-upcoming',
      dotColor: '#22D3EE'  // cyan
    };
  }
}

// Escapes HTML special characters in user-provided text
// This prevents XSS (Cross-Site Scripting) attacks where
// a user might type HTML/JS code into the task name input
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
