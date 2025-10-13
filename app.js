// const API_URL = 'http://localhost:5000/api/tasks';

// // Get DOM elements
// const form = document.getElementById('add-task-form');
// const taskTitleInput = document.getElementById('task-title');
// const taskTagsInput = document.getElementById('task-tags');
// const columns = {
//     todo: document.getElementById('todo-column'),
//     doing: document.getElementById('doing-column'),
//     done: document.getElementById('done-column')
// };
// const counts = {
//     todo: document.getElementById('todo-count'),
//     doing: document.getElementById('doing-count'),
//     done: document.getElementById('done-count')
// };

// // --- API Functions ---

// const fetchTasks = async () => {
//     try {
//         const response = await fetch(API_URL);
//         if (!response.ok) throw new Error('Network response was not ok');
//         return await response.json();
//     } catch (error) {
//         console.error('Failed to fetch tasks:', error);
//         return [];
//     }
// };

// const addTask = async (taskData) => {
//     try {
//         const response = await fetch(API_URL, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(taskData),
//         });
//         if (!response.ok) throw new Error('Failed to add task');
//         return await response.json();
//     } catch (error) {
//         console.error('Error adding task:', error);
//     }
// };

// const updateTask = async (id, updatedData) => {
//     try {
//         const response = await fetch(`${API_URL}/${id}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(updatedData),
//         });
//         if (!response.ok) throw new Error('Failed to update task');
//         return await response.json();
//     } catch (error) {
//         console.error('Error updating task:', error);
//     }
// };

// const deleteTask = async (id) => {
//     try {
//         const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
//         if (!response.ok) throw new Error('Failed to delete task');
//     } catch (error) {
//         console.error('Error deleting task:', error);
//     }
// };

// // --- DOM Manipulation ---

// const createTaskCard = (task) => {
//     const card = document.createElement('div');
//     card.className = 'task-card';
//     card.dataset.id = task._id;

//     const tagsHTML = task.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

//     card.innerHTML = `
//         <button class="delete-btn" title="Delete task">&times;</button>
//         <div class="card-actions">
//             <button class="icon-btn edit-btn" title="Edit Task">✏️</button>
//             <button class="icon-btn log-btn" title="View History">📄</button>
//         </div>
//         <h3>${task.title}</h3>
//         <div class="tags-container">${tagsHTML}</div>
//         <div class="controls">
//             <select class="status-select">
//                 <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
//                 <option value="Doing" ${task.status === 'Doing' ? 'selected' : ''}>Doing</option>
//                 <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
//             </select>
//         </div>
//     `;

//     // Event Listeners for the card
//     card.querySelector('.delete-btn').addEventListener('click', async () => {
//         await deleteTask(task._id);
//         renderTasks(); // Refresh the board
//     });

//     card.querySelector('.status-select').addEventListener('change', async (e) => {
//         const newStatus = e.target.value;
//         const updatedData = {
//             title: task.title,
//             tags: task.tags,
//             status: newStatus
//         };
//         await updateTask(task._id, updatedData);
//         renderTasks(); // Refresh the board
//     });

//     card.querySelector('.edit-btn').addEventListener('click', () => {
//     openEditModal(task);
//     });

//     card.querySelector('.log-btn').addEventListener('click', () => {
//         openHistoryModal(task._id);
//     });


//     return card;
// };


// const renderTasks = async () => {
//     const tasks = await fetchTasks();

//     // Clear columns
//     Object.values(columns).forEach(column => column.innerHTML = '');
//     Object.values(counts).forEach(count => count.textContent = '0');

//     // Populate columns and update counts
//     tasks.forEach(task => {
//         const card = createTaskCard(task);
//         if (task.status === 'To Do') {
//             columns.todo.appendChild(card);
//             counts.todo.textContent = parseInt(counts.todo.textContent) + 1;
//         } else if (task.status === 'Doing') {
//             columns.doing.appendChild(card);
//             counts.doing.textContent = parseInt(counts.doing.textContent) + 1;
//         } else if (task.status === 'Done') {
//             columns.done.appendChild(card);
//             counts.done.textContent = parseInt(counts.done.textContent) + 1;
//         }
//     });
// };

// // in app.js ... maybe after the API functions

// const modal = document.getElementById('edit-modal');
// const modalTitle = document.getElementById('modal-title');
// const modalBody = document.getElementById('modal-body');
// const closeModalBtn = document.querySelector('.close-btn');

// closeModalBtn.onclick = () => modal.style.display = "none";
// window.onclick = (event) => {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

// function openEditModal(task) {
//   modalTitle.innerText = "Edit Task";
//   modalBody.innerHTML = `
//     <form class="edit-form" data-task-id="${task._id}">
//       <label for="edit-title">Title</label>
//       <input type="text" id="edit-title" value="${task.title}" required>
//       <label for="edit-tags">Tags (comma-separated)</label>
//       <input type="text" id="edit-tags" value="${task.tags.join(', ')}">
//       <button type="submit">Update Task</button>
//     </form>
//   `;
//   modal.style.display = "block";

//   document.querySelector('.edit-form').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const id = e.target.dataset.taskId;
//     const title = document.getElementById('edit-title').value;
//     const tags = document.getElementById('edit-tags').value.split(',').map(tag => tag.trim());
    
//     // We need to fetch the current status to include it in the update payload
//     const tasks = await fetchTasks();
//     const currentTask = tasks.find(t => t._id === id);

//     await updateTask(id, { title, tags, status: currentTask.status });
//     modal.style.display = "none";
//     renderTasks();
//   });
// }

// async function openHistoryModal(taskId) {
//   modalTitle.innerText = "Task History";
  
//   const response = await fetch(`${API_URL}/${taskId}/logs`);
//   const logs = await response.json();
  
//   if (logs.length === 0) {
//     modalBody.innerHTML = '<p>No history found for this task.</p>';
//   } else {
//     modalBody.innerHTML = logs.map(log => `
//       <div class="log-entry">
//         <p><strong>${log.changeType}</strong></p>
//         <p><em>Before:</em> Status - ${log.previousState.status}, Title - ${log.previousState.title}</p>
//         <p><em>After:</em> Status - ${log.newState.status}, Title - ${log.newState.title}</p>
//         <p class="timestamp">${new Date(log.createdAt).toLocaleString()}</p>
//       </div>
//     `).join('');
//   }
  
//   modal.style.display = "block";
// }

// // --- Initial Setup ---

// form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const title = taskTitleInput.value.trim();
//     const tags = taskTagsInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);

//     if (title) {
//         const newTask = { title, tags, status: 'To Do' };
//         await addTask(newTask);
//         form.reset();
//         renderTasks(); // Refresh board after adding
//     }
// });

// // Initial load
// document.addEventListener('DOMContentLoaded', renderTasks);

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONSTANTS ---
    const API_URL_BASE = 'http://localhost:5000/api';
    const state = {
        tasks: [],
    };

    // --- ELEMENT SELECTORS ---
    const pages = {
        taskBoard: document.getElementById('page-task-board'),
        addUpdate: document.getElementById('page-add-update'),
        logsCheck: document.getElementById('page-logs-check'),
    };
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const pageTitle = document.getElementById('page-title');
    const taskForm = document.getElementById('task-form');
    const logModal = document.getElementById('log-modal');
    const closeModalBtn = logModal.querySelector('.close-btn');

    // --- NAVIGATION LOGIC (WITH FIX) ---
    function navigateTo(hash) {
        Object.values(pages).forEach(page => page.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        // FIX: Correctly convert hash '#task-board' to object key 'taskBoard'
        const key = hash.substring(1).replace(/-(\w)/g, (_, c) => c.toUpperCase());
        
        const targetPage = pages[key];
        const targetLink = document.querySelector(`.nav-link[href="${hash}"]`);

        if (targetPage) {
            targetPage.classList.add('active');
            pageTitle.textContent = targetLink.textContent.substring(2).trim(); // Remove emoji
        }
        if (targetLink) targetLink.classList.add('active');
        mainNav.classList.remove('show');
    }

    menuToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
    mainNav.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault(); // Prevent page jump
            const hash = link.hash;
            if (hash === '#add-update') {
                prepareTaskForm(); // Reset form when clicking "Add New Task"
            }
            navigateTo(hash);
            // If navigating back to the board, refresh the tasks
            if (hash === '#task-board') {
                 initializeApp();
            }
        }
    });

    // --- API FUNCTIONS ---
    async function fetchTasks(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL_BASE}/tasks?${query}`);
        state.tasks = await response.json();
    }
    async function deleteTask(id) {
        await fetch(`${API_URL_BASE}/tasks/${id}`, { method: 'DELETE' });
    }
    async function updateTask(id, data) {
        await fetch(`${API_URL_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    // --- TASK BOARD PAGE ---
    document.getElementById('filter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('filter-title').value;
        const tags = document.getElementById('filter-tags').value;
        await fetchTasks({ title, tags });
        renderKanbanBoard();
    });

    function renderKanbanBoard() {
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

        Object.values(columns).forEach(col => col.innerHTML = '');
        Object.values(counts).forEach(count => count.textContent = '0');

        if(!state.tasks || state.tasks.length === 0) return;

        state.tasks.forEach(task => {
            const columnKey = task.status.toLowerCase().replace(' ', '');
            if (columns[columnKey]) {
                const card = createTaskCard(task);
                columns[columnKey].appendChild(card);
                counts[columnKey].textContent = parseInt(counts[columnKey].textContent) + 1;
            }
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.id = task._id;

        const tagsHTML = task.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const imagesHTML = (task.imageUrls || []).map(url => `<img src="http://localhost:5000${url}" alt="task image">`).join('');

        card.innerHTML = `
            <button class="delete-btn" title="Delete task">&times;</button>
            <div class="card-actions">
                <button class="icon-btn edit-btn" title="Edit Task">✏️</button>
                <button class="icon-btn log-btn" title="View History">📄</button>
            </div>
            <h3>${task.title}</h3>
            ${task.description ? `<p class="description">${task.description}</p>` : ''}
            <div class="tags-container">${tagsHTML}</div>
            <div class="task-images">${imagesHTML}</div>
            <div class="controls">
                <select class="status-select" data-task-id="${task._id}">
                    <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                    <option value="Doing" ${task.status === 'Doing' ? 'selected' : ''}>Doing</option>
                    <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
            </div>`;
        
        // --- Card Event Listeners ---
        card.querySelector('.delete-btn').addEventListener('click', async () => {
            await deleteTask(task._id);
            await fetchTasks();
            renderKanbanBoard();
        });

        card.querySelector('.edit-btn').addEventListener('click', () => {
            prepareTaskForm(task);
            navigateTo('#add-update');
        });

        card.querySelector('.log-btn').addEventListener('click', () => openHistoryModal(task._id));

        card.querySelector('.status-select').addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            await updateTask(task._id, { ...task, status: newStatus });
            await fetchTasks();
            renderKanbanBoard();
        });

        return card;
    }

    // --- ADD/UPDATE TASK PAGE ---
    function prepareTaskForm(task = null) {
        const formTitle = document.getElementById('add-update-title');
        if (task) {
            formTitle.textContent = 'Update Task';
            document.getElementById('task-id').value = task._id;
            document.getElementById('task-title-input').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-tags-input').value = task.tags.join(', ');
        } else {
            formTitle.textContent = 'Add New Task';
            taskForm.reset();
            document.getElementById('task-id').value = '';
        }
    }

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskId = document.getElementById('task-id').value;
        const formData = new FormData();
        formData.append('title', document.getElementById('task-title-input').value);
        formData.append('description', document.getElementById('task-description').value);
        formData.append('tags', document.getElementById('task-tags-input').value);

        const imageFiles = document.getElementById('task-images').files;
        for (const file of imageFiles) {
            formData.append('images', file);
        }
        
        if (taskId) {
            // A full "update" with image changes requires more complex backend logic (e.g., deleting old files).
            // For now, this just updates the text fields.
            await updateTask(taskId, {
                title: formData.get('title'),
                description: formData.get('description'),
                tags: formData.get('tags').split(',').map(t => t.trim()),
                status: state.tasks.find(t => t._id === taskId).status,
            });
        } else {
            await fetch(`${API_URL_BASE}/tasks`, { method: 'POST', body: formData });
        }

        taskForm.reset();
        navigateTo('#task-board');
        await fetchTasks();
        renderKanbanBoard();
    });

    // --- LOGS CHECK PAGE ---
    document.getElementById('log-filter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskIdOrName = document.getElementById('log-filter-task').value;
        const startDate = document.getElementById('log-filter-start-date').value;
        const endDate = document.getElementById('log-filter-end-date').value;
        
        const filters = {};
        if (taskIdOrName) filters.taskIdOrName = taskIdOrName;
        if (startDate && endDate) {
            filters.startDate = startDate;
            filters.endDate = endDate;
        }
        
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL_BASE}/logs?${query}`);
        const logs = await response.json();
        renderLogs(logs);
    });

    function renderLogs(logs) {
        const container = document.getElementById('logs-container');
        if (logs.length === 0) {
            container.innerHTML = '<p>No logs found for the selected criteria.</p>';
            return;
        }
        container.innerHTML = logs.map(log => `
            <div class="log-entry">
                <p><strong>${log.changeType}</strong> (Task ID: ${log.taskId})</p>
                <p><em>Before:</em> ${log.previousState.title} (${log.previousState.status})</p>
                <p><em>After:</em> ${log.newState.title} (${log.newState.status})</p>
                <p class="timestamp">${new Date(log.createdAt).toLocaleString()}</p>
            </div>`
        ).join('');
    }

    // --- LOG MODAL (PRESERVED) ---
    closeModalBtn.onclick = () => logModal.style.display = "none";
    window.onclick = (event) => { if (event.target == logModal) logModal.style.display = "none"; };
    
    async function openHistoryModal(taskId) {
        const response = await fetch(`${API_URL_BASE}/tasks/${taskId}/logs`);
        const logs = await response.json();
        const modalBody = logModal.querySelector('.modal-body');
        
        logModal.querySelector('.modal-header h2').textContent = "Task History";

        if (logs.length === 0) {
            modalBody.innerHTML = '<p>No history found for this task.</p>';
        } else {
            modalBody.innerHTML = logs.map(log => `
                <div class="log-entry">
                    <p><strong>${log.changeType}</strong></p>
                    <p><em>Before:</em> Status - ${log.previousState.status}, Title - ${log.previousState.title}</p>
                    <p><em>After:</em> Status - ${log.newState.status}, Title - ${log.newState.title}</p>
                    <p class="timestamp">${new Date(log.createdAt).toLocaleString()}</p>
                </div>`).join('');
        }
        logModal.style.display = "block";
    }

    // --- INITIALIZATION ---
    async function initializeApp() {
        navigateTo(window.location.hash || '#task-board');
        await fetchTasks();
        renderKanbanBoard();
    }

    initializeApp();
});