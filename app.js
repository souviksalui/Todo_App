const API_URL = 'http://localhost:5000/api/tasks';

// Get DOM elements
const form = document.getElementById('add-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskTagsInput = document.getElementById('task-tags');
const columns = {
    todo: document.getElementById('todo-column'),
    doing: document.getElementById('doing-column'),
    done: document.getElementById('done-column')
};
const counts = {
    todo: document.getElementById('todo-count'),
    doing: document.getElementById('doing-count'),
    done: document.getElementById('done-count')
};

// --- API Functions ---

const fetchTasks = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
    }
};

const addTask = async (taskData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error('Failed to add task');
        return await response.json();
    } catch (error) {
        console.error('Error adding task:', error);
    }
};

const updateTask = async (id, updatedData) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

const deleteTask = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete task');
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// --- DOM Manipulation ---

const createTaskCard = (task) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task._id;

    const tagsHTML = task.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    card.innerHTML = `
        <button class="delete-btn" title="Delete task">&times;</button>
        <h3>${task.title}</h3>
        <div class="tags-container">${tagsHTML}</div>
        <div class="controls">
            <select class="status-select">
                <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                <option value="Doing" ${task.status === 'Doing' ? 'selected' : ''}>Doing</option>
                <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
            </select>
        </div>
    `;

    // Event Listeners for the card
    card.querySelector('.delete-btn').addEventListener('click', async () => {
        await deleteTask(task._id);
        renderTasks(); // Refresh the board
    });

    card.querySelector('.status-select').addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        const updatedData = {
            title: task.title,
            tags: task.tags,
            status: newStatus
        };
        await updateTask(task._id, updatedData);
        renderTasks(); // Refresh the board
    });

    return card;
};

const renderTasks = async () => {
    const tasks = await fetchTasks();

    // Clear columns
    Object.values(columns).forEach(column => column.innerHTML = '');
    Object.values(counts).forEach(count => count.textContent = '0');

    // Populate columns and update counts
    tasks.forEach(task => {
        const card = createTaskCard(task);
        if (task.status === 'To Do') {
            columns.todo.appendChild(card);
            counts.todo.textContent = parseInt(counts.todo.textContent) + 1;
        } else if (task.status === 'Doing') {
            columns.doing.appendChild(card);
            counts.doing.textContent = parseInt(counts.doing.textContent) + 1;
        } else if (task.status === 'Done') {
            columns.done.appendChild(card);
            counts.done.textContent = parseInt(counts.done.textContent) + 1;
        }
    });
};

// --- Initial Setup ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const tags = taskTagsInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);

    if (title) {
        const newTask = { title, tags, status: 'To Do' };
        await addTask(newTask);
        form.reset();
        renderTasks(); // Refresh board after adding
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', renderTasks);