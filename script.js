let points = 0;
const badges = [];

// Generate Study Plan
document.getElementById('studyForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const subject = document.getElementById('subject').value;
    const deadline = document.getElementById('deadline').value;
    const goals = document.getElementById('goals').value;

    // Parse tasks from the goals input
    const tasks = goals.split(',').map(task => task.trim());

    // Generate a study plan
    const studyPlan = `Study Plan for ${subject}:
    - Deadline: ${deadline}
    - Goals: ${goals}`;

    document.getElementById('planResult').innerText = studyPlan;

    // Display tasks with editable date and time
    displayTasks(tasks, deadline);
});

// Display Tasks
function displayTasks(tasks, deadline) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear previous tasks

    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task${index + 1}`;
        checkbox.addEventListener('change', () => {
            updateProgress();
            updateRewards();
            saveTasksToLocalStorage();
        });
        li.appendChild(checkbox);

        // Task Name
        const taskName = document.createElement('span');
        taskName.innerText = task;
        li.appendChild(taskName);

        // Date Input
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = deadline;
        li.appendChild(dateInput);

        // Time Input
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.value = '10:30'; // Default time
        li.appendChild(timeInput);

        // Edit Button
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => {
            dateInput.disabled = !dateInput.disabled;
            timeInput.disabled = !timeInput.disabled;
            editButton.innerText = dateInput.disabled ? 'Edit' : 'Save';
            saveTasksToLocalStorage();
        });
        li.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.addEventListener('click', () => {
            taskList.removeChild(li);
            updateProgress();
            updateRewards();
            saveTasksToLocalStorage();
        });
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    saveTasksToLocalStorage();
}

// Update Progress Bar
function updateProgress() {
    const checkboxes = document.querySelectorAll('#taskList input[type="checkbox"]');
    const totalTasks = checkboxes.length;
    const completedTasks = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const progress = (completedTasks / totalTasks) * 100;

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = `${progress}%`;
    progressText.innerText = `${progress.toFixed(2)}% Complete`;
}

// Update Rewards
function updateRewards() {
    const checkboxes = document.querySelectorAll('#taskList input[type="checkbox"]');
    const totalTasks = checkboxes.length;
    const completedTasks = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const progress = (completedTasks / totalTasks) * 100;

    // Award points
    points = Math.floor(progress / 10) * 10; // Example: 10 points for every 10% progress

    // Award badges
    badges.length = 0;
    if (progress >= 90) {
        badges.push('Gold');
    } else if (progress >= 60) {
        badges.push('Silver');
    } else if (progress >= 30) {
        badges.push('Bronze');
    }

    // Update the rewards display
    document.getElementById('points').innerText = `${points} Points`;
    document.getElementById('badges').innerText = badges.join(', ') || 'None';
}

// Save Tasks to localStorage
function saveTasksToLocalStorage() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        const taskName = li.querySelector('span').innerText;
        const date = li.querySelector('input[type="date"]').value;
        const time = li.querySelector('input[type="time"]').value;
        const isCompleted = li.querySelector('input[type="checkbox"]').checked;
        tasks.push({ taskName, date, time, isCompleted });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('points', points);
    localStorage.setItem('badges', JSON.stringify(badges));
}

// Load Tasks from localStorage
function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const savedPoints = localStorage.getItem('points') || 0;
    const savedBadges = JSON.parse(localStorage.getItem('badges')) || [];

    points = parseInt(savedPoints);
    badges.push(...savedBadges);

    tasks.forEach(task => {
        const li = document.createElement('li');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.isCompleted;
        checkbox.addEventListener('change', () => {
            updateProgress();
            updateRewards();
            saveTasksToLocalStorage();
        });
        li.appendChild(checkbox);

        // Task Name
        const taskName = document.createElement('span');
        taskName.innerText = task.taskName;
        li.appendChild(taskName);

        // Date Input
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = task.date;
        li.appendChild(dateInput);

        // Time Input
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.value = task.time;
        li.appendChild(timeInput);

        // Edit Button
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => {
            dateInput.disabled = !dateInput.disabled;
            timeInput.disabled = !timeInput.disabled;
            editButton.innerText = dateInput.disabled ? 'Edit' : 'Save';
            saveTasksToLocalStorage();
        });
        li.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.addEventListener('click', () => {
            taskList.removeChild(li);
            updateProgress();
            updateRewards();
            saveTasksToLocalStorage();
        });
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    updateProgress();
    updateRewards();
}

// Load tasks when the page loads
window.addEventListener('load', loadTasksFromLocalStorage);

// Chatbot Functionality
async function sendMessage() {
    const userInput = document.getElementById('userInput').value;

    if (userInput.trim() === "") {
        alert("Please enter a message!");
        return;
    }

    const chatLog = document.getElementById('chatlog');
    chatLog.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;
    document.getElementById('userInput').value = "";

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch(
            'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', 
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer YOUR_API_KEY`, 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: userInput,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const chatbotResponse = data[0]?.generated_text || "Sorry, I couldn't generate a response.";

        // Hide typing indicator and display chatbot response
        hideTypingIndicator();
        chatLog.innerHTML += `<div><strong>Chatbot:</strong> ${chatbotResponse}</div>`;
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        chatLog.innerHTML += `<div><strong>Chatbot:</strong> Sorry, something went wrong. Please try again.</div>`;
    }

    chatLog.scrollTop = chatLog.scrollHeight;
}

// Remove the typing indicator
function hideTypingIndicator() {
    const chatLog = document.getElementById('chatlog');
    const typingIndicator = chatLog.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Define showTypingIndicator and hideTypingIndicator first
function showTypingIndicator() {
    const chatLog = document.getElementById('chatlog');
    chatLog.innerHTML += `<div class="typing-indicator">Chatbot is typing...</div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
}

function hideTypingIndicator() {
    const chatLog = document.getElementById('chatlog');
    const typingIndicator = chatLog.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;

    if (userInput.trim() === "") {
        alert("Please enter a message!");
        return;
    }

    const chatLog = document.getElementById('chatlog');
    chatLog.innerHTML += `<div class="user-message"><strong>You:</strong> ${userInput}</div>`;
    document.getElementById('userInput').value = "";

    showTypingIndicator();

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: userInput,
            }),
        });

        const data = await response.json();
        const chatbotResponse = data[0]?.generated_text || "Sorry, I couldn't generate a response.";

        hideTypingIndicator();
        chatLog.innerHTML += `<div class="chatbot-message"><strong>Chatbot:</strong> ${chatbotResponse}</div>`;
    } catch (error) {
        hideTypingIndicator();
        chatLog.innerHTML += `<div class="chatbot-message"><strong>Chatbot:</strong> Sorry, something went wrong. Please try again.</div>`;
    }

    chatLog.scrollTop = chatLog.scrollHeight;
    saveChatHistory();

}
function clearChat() {
    const chatLog = document.getElementById('chatlog');
    chatLog.innerHTML = '';
    localStorage.removeItem('chatHistory');
}
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Save the user's preference in localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load dark mode preference when the page loads
window.addEventListener('load', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});
function checkDueDates() {
    const today = new Date();
    document.querySelectorAll('#taskList li').forEach(li => {
        const dateInput = li.querySelector('input[type="date"]');
        const dueDate = new Date(dateInput.value);

        if (dueDate < today) {
            li.style.backgroundColor = '#ffcccc'; // Highlight overdue tasks
        } else if ((dueDate - today) / (1000 * 60 * 60 * 24) <= 2) {
            li.style.backgroundColor = '#ffffcc'; // Highlight tasks due in 2 days
        } else {
            li.style.backgroundColor = ''; // Reset background color
        }
    });
}

// Call this function whenever tasks are loaded or updated
checkDueDates();
function searchTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const taskList = document.getElementById('taskList');

    taskList.querySelectorAll('li').forEach(li => {
        const taskName = li.querySelector('span').innerText.toLowerCase();
        if (taskName.includes(searchTerm)) {
            li.style.display = 'flex';
        } else {
            li.style.display = 'none';
        }
    });
}
function addPriorityToTask(li) {
    const prioritySelect = document.createElement('select');
    prioritySelect.innerHTML = `
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
    `;
    li.appendChild(prioritySelect);
}
function sortTasks() {
    const sortBy = document.getElementById('sortTasks').value;
    const taskList = document.getElementById('taskList');
    const tasks = Array.from(taskList.querySelectorAll('li'));

    tasks.sort((a, b) => {
        if (sortBy === 'dueDate') {
            const dateA = new Date(a.querySelector('input[type="date"]').value);
            const dateB = new Date(b.querySelector('input[type="date"]').value);
            return dateA - dateB;
        } else if (sortBy === 'priority') {
            const priorityA = a.querySelector('select').value;
            const priorityB = b.querySelector('select').value;
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[priorityA] - priorityOrder[priorityB];
        } else if (sortBy === 'completion') {
            const completedA = a.querySelector('input[type="checkbox"]').checked;
            const completedB = b.querySelector('input[type="checkbox"]').checked;
            return completedA - completedB;
        }
    });

    taskList.innerHTML = '';
    tasks.forEach(task => taskList.appendChild(task));
}