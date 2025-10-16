
const STORAGE_KEY_TASKS = 'regex_todo_list_data';
const STORAGE_KEY_POMODORO = 'dashboard_pomodoro_total';
let tasks = [];

let totalPomodoroMinutes = parseFloat(localStorage.getItem(STORAGE_KEY_POMODORO) || '0');

const DEFAULT_FOCUS_MIN = 25;
const DEFAULT_BREAK_MIN = 5;

let timerInterval = null;
let isFocusMode = true;
let isPaused = true;
let timeRemaining = DEFAULT_FOCUS_MIN * 60; 


const DEFAULT_TASKS = [
    {
        "id": "task_0001",
        "title": "Write Lab Report Intro",
        "dueDate": "2025-10-15",
        "duration": 90,
        "tag": "Chemistry",
        "isCompleted": false,
        "createdAt": "2025-10-01T10:00:00Z",
        "updatedAt": "2025-10-14T14:30:00Z"
    },
    {
        "id": "task_0002",
        "title": "Finish Database Schema Design",
        "dueDate": "2025-10-15",
        "duration": 120,
        "tag": "Programming",
        "isCompleted": false,
        "createdAt": "2025-10-05T12:00:00Z",
        "updatedAt": "2025-10-15T09:00:00Z"
    },
    {
        "id": "task_0003",
        "title": "Pay Monthly Rent/Utilities",
        "dueDate": "2025-10-12",
        "duration": 30,
        "tag": "Admin",
        "isCompleted": true,
        "createdAt": "2025-10-01T08:00:00Z",
        "updatedAt": "2025-10-12T11:45:00Z"
    },
    {
        "id": "task_0004",
        "title": "Read Chapter 4 for Lit Class",
        "dueDate": "2025-10-20",
        "duration": 60,
        "tag": "Literature",
        "isCompleted": false,
        "createdAt": "2025-10-10T15:00:00Z",
        "updatedAt": "2025-10-10T15:00:00Z"
    },
    {
        "id": "task_0005",
        "title": "Go Grocery Shopping",
        "dueDate": "2025-10-16",
        "duration": 45,
        "tag": "Admin",
        "isCompleted": false,
        "createdAt": "2025-10-14T18:00:00Z",
        "updatedAt": "2025-10-14T18:00:00Z"
    },
    {
        "id": "task_0006",
        "title": "Review Python Syntax for Project",
        "dueDate": "2025-10-18",
        "duration": 150,
        "tag": "Programming",
        "isCompleted": false,
        "createdAt": "2025-10-12T09:00:00Z",
        "updatedAt": "2025-10-12T09:00:00Z"
    },
    {
        "id": "task_0007",
        "title": "Prepare Presentation Slides",
        "dueDate": "2025-10-25",
        "duration": 180,
        "tag": "Programming",
        "isCompleted": false,
        "createdAt": "2025-10-11T16:00:00Z",
        "updatedAt": "2025-10-11T16:00:00Z"
    }
];


const displayEl = document.getElementById('timer-display');
const statusEl = document.getElementById('timer-status');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');


const navToggleBtn = document.getElementById('menu-toggle-btn');
const mainNav = document.getElementById('main-nav');
const body = document.body;

function toggleNav() {
    const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true' || false;
    
    navToggleBtn.setAttribute('aria-expanded', !isExpanded);
    
    
    mainNav.classList.toggle('is-open');
    navToggleBtn.classList.toggle('is-open'); 
    body.classList.toggle('no-scroll'); 
}



function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        
        tasks = DEFAULT_TASKS.map(task => ({
            ...task,
            
            id: 'task_' + Date.now() + Math.random().toString(36).substring(2, 9) 
        }));
        saveTasks(); 
    }
    
    tasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
}

function addTask(task) {
    tasks.push(task);
    saveTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}

function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        saveTasks();
    }
}


function validateTitle(title) {
    if (!title || title.trim().length === 0) {
        return { valid: false, error: 'Title cannot be empty.' };
    }
    if (title.length > 100) {
        return { valid: false, error: 'Title is too long.' };
    }
    return { valid: true, error: '' };
}

function validateDate(date) {
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    
    if (!date) {
        return { valid: false, error: 'Due date is required.' };
    }
    
    if (selectedDate < today && (today - selectedDate) > (1000 * 60 * 60 * 24 * 30)) {
        return { valid: true, error: 'Warning: Date is significantly in the past.' };
    }
    return { valid: true, error: '' };
}

function validateDuration(duration) {
    const num = parseInt(duration, 10);
    if (isNaN(num) || num <= 0) {
        return { valid: false, error: 'Duration must be a positive number.' };
    }
    if (num > 300) {
        return { valid: false, error: 'Duration seems too high (max 300 min).' };
    }
    return { valid: true, error: '' };
}

function validateTask(task) {
    return (
        validateTitle(task.title).valid &&
        validateDate(task.dueDate).valid &&
        validateDuration(task.duration).valid
    );
}


function calculateAndRenderMetrics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const completionRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

    const remainingDuration = tasks
        .filter(t => !t.isCompleted)
        .reduce((sum, t) => sum + parseInt(t.duration, 10), 0);

    
    const totalTasksEl = document.getElementById('metric-total-tasks');
    const completedTasksEl = document.getElementById('metric-completed-tasks');
    const pendingDurationEl = document.getElementById('metric-pending-duration');
    const completionRateEl = document.getElementById('metric-completion-rate');
    const pomodoroTotalEl = document.getElementById('metric-pomodoro-total');

    if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;

    if (pendingDurationEl) {
        const hours = Math.floor(remainingDuration / 60);
        const minutes = remainingDuration % 60;
        pendingDurationEl.textContent = remainingDuration > 0 
            ? `${hours}h ${minutes}m` 
            : '0h 0m';
    }
    
    
    if (pomodoroTotalEl) {
        const totalHours = Math.floor(totalPomodoroMinutes / 60);
        const totalMins = Math.round(totalPomodoroMinutes % 60);
        pomodoroTotalEl.textContent = `${totalHours}h ${totalMins}m`;
    }
}

function renderUpcomingTasks() {
    const upcomingListEl = document.getElementById('upcoming-tasks-list');
    if (!upcomingListEl) return;

    
    const upcomingTasks = tasks
        .filter(t => !t.isCompleted)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);
    
    upcomingListEl.innerHTML = ''; 

    if (upcomingTasks.length === 0) {
        upcomingListEl.innerHTML = `<li style="text-align: center; color: var(--color-gray-medium); padding: 1rem 0;">No pending tasks. Keep up the good work!</li>`;
        return;
    }

    upcomingTasks.forEach(task => {
        const item = document.createElement('li');
        item.className = 'task-item';
        item.setAttribute('role', 'listitem');
        
        const today = new Date().setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
        const isOverdue = dueDate < today;
        const dueDateDisplay = new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        item.innerHTML = `
            <span class="task-title-upcoming" title="${task.title}">${task.title}</span>
            <span class="task-date-upcoming" style="color: ${isOverdue ? 'var(--color-danger)' : 'var(--color-gray-dark)'};">
                ${isOverdue ? 'OVERDUE ' : 'Due: '}${dueDateDisplay}
            </span>
        `;
        upcomingListEl.appendChild(item);
    });
}



function updateDisplay() {
    if (!displayEl) return;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    displayEl.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateStatus(message) {
    if (statusEl) statusEl.textContent = message;
}

function switchMode() {
    isFocusMode = !isFocusMode;
    
    const metricSubtext = document.querySelector('.pomodoro-clock .metric-subtext');
    if (metricSubtext) {
        metricSubtext.textContent = isFocusMode 
            ? `Focus: ${DEFAULT_FOCUS_MIN} min | Break: ${DEFAULT_BREAK_MIN} min` 
            : `Break: ${DEFAULT_BREAK_MIN} min | Next Focus: ${DEFAULT_FOCUS_MIN} min`;
    }
    timeRemaining = (isFocusMode ? DEFAULT_FOCUS_MIN : DEFAULT_BREAK_MIN) * 60;
    updateDisplay();
}

function updateTimer() {
    timeRemaining--;
    updateDisplay();

    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        
        
        if (isFocusMode) {
            totalPomodoroMinutes += DEFAULT_FOCUS_MIN;
            localStorage.setItem(STORAGE_KEY_POMODORO, totalPomodoroMinutes);
            calculateAndRenderMetrics(); 
            updateStatus("Focus Complete. Taking a Break.");
        } else {
            updateStatus("Break Complete. Ready for Next Focus.");
        }
        
        
        setTimeout(() => {
            switchMode();
            startTimer(); 
        }, 1000);
    }
}

function startTimer() {
    if (!timerInterval) {
        isPaused = false;
        
        startBtn.textContent = (timeRemaining === (isFocusMode ? DEFAULT_FOCUS_MIN : DEFAULT_BREAK_MIN) * 60) ? 'Start' : 'Continue';
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timerInterval = setInterval(updateTimer, 1000);
        updateStatus(isFocusMode ? "Focus Session Active." : "Break Session Active.");
    }
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
        startBtn.textContent = 'Continue';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        updateStatus(isFocusMode ? "Focus Session Paused." : "Break Session Paused.");
    }
}

function resetTimer() {
    pauseTimer();
    isFocusMode = true;
    timeRemaining = DEFAULT_FOCUS_MIN * 60;
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateDisplay();
    updateStatus("Ready to Focus");
    
    const metricSubtext = document.querySelector('.pomodoro-clock .metric-subtext');
    if (metricSubtext) {
        metricSubtext.textContent = `Focus: ${DEFAULT_FOCUS_MIN} min | Break: ${DEFAULT_BREAK_MIN} min`;
    }
}


window.onload = function() {
    loadTasks();
    
    
    if (startBtn && pauseBtn && resetBtn) {
        startBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', resetTimer);
        updateDisplay();
        calculateAndRenderMetrics();
        renderUpcomingTasks();
    }
    
    
    if (navToggleBtn) {
        navToggleBtn.addEventListener('click', toggleNav);
    }
};
// Add this function to your script.js file

const themeToggleBtn = document.getElementById('theme-toggle-btn');
const storageKey = 'theme-preference';

// 1. Initial Load: Check for saved preference or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Default to the saved theme, or system preference, or 'light'
    let currentTheme = 'light';
    if (savedTheme) {
        currentTheme = savedTheme;
    } else if (prefersDark) {
        currentTheme = 'dark';
    }

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        // You can update the button icon/text here if needed
        themeToggleBtn.innerHTML = '☀️'; // Sun icon for light mode
    } else {
        themeToggleBtn.innerHTML = '🌙'; // Moon icon for dark mode
    }
}

// 2. Toggle Functionality
function toggleTheme() {
    // Check if the body currently has the 'dark-mode' class
    const isDarkMode = body.classList.toggle('dark-mode');
    
    // Save the new preference
    const newTheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem(storageKey, newTheme);

    // Update the button icon/text
    themeToggleBtn.innerHTML = isDarkMode ? '☀️' : '🌙';
}

// 3. Event Listener
themeToggleBtn.addEventListener('click', toggleTheme);

// Run the initialization when the script loads
document.addEventListener('DOMContentLoaded', initializeTheme);

