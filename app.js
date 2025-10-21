document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONSTANTS ---
    const API_URL_BASE = 'http://localhost:5000/api';
    const state = {
        tasks: [],
        users: []
    };

    // --- ELEMENT SELECTORS ---
    const pages = {
        taskBoard: document.getElementById('page-task-board'),
        addUpdate: document.getElementById('page-add-update'),
        logsCheck: document.getElementById('page-logs-check'),
        manageUsers: document.getElementById('page-manage-users'),
    };
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const pageTitle = document.getElementById('page-title');
    const taskForm = document.getElementById('task-form');
    const mainModal = document.getElementById('main-modal');
    const modalTitle = mainModal.querySelector('#modal-title');
    const modalBody = mainModal.querySelector('#modal-body');
    const closeModalBtn = mainModal.querySelector('.close-btn');

    // --- NAVIGATION LOGIC ---
    function navigateTo(hash) {
        Object.values(pages).forEach(page => page.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        const key = hash.substring(1).replace(/-(\w)/g, (_, c) => c.toUpperCase());
        const targetPage = pages[key];
        const targetLink = document.querySelector(`.nav-link[href="${hash}"]`);

        if (targetPage) {
            targetPage.classList.add('active');
            pageTitle.textContent = targetLink.textContent.substring(2).trim();
        }
        if (targetLink) targetLink.classList.add('active');
        mainNav.classList.remove('show');
    }

    menuToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
    mainNav.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            const hash = link.hash;
            if (hash === '#add-update') {
                prepareTaskForm();
            }
            if (hash === '#manage-users') {
        renderUsersList();
            }
            navigateTo(hash);
        }
    });

    // --- API FUNCTIONS ---
    async function fetchTasks(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        try {
            const response = await fetch(`${API_URL_BASE}/tasks?${query}`);
            state.tasks = await response.json();
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            state.tasks = [];
        }
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

    // API function to fetch users
    async function fetchUsers() {
        try {
            const response = await fetch(`${API_URL_BASE}/users`);
            state.users = await response.json();
        } catch (error) {
            console.error("Failed to fetch users:", error);
            state.users = [];
        }
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

        if (!state.tasks || state.tasks.length === 0) return;

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

        const tagsHTML = (task.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        const imagesHTML = (task.imageUrls || []).map(url => `<img src="http://localhost:5000${url}" alt="task image" class="thumbnail">`).join('');

        //  NEW: Generate HTML for assigned user avatars
        const assignedUsersHTML = (task.assignedUsers || []).map(userId => {
            const user = state.users.find(u => u._id === userId);
            // Get first letter of name, or '?' if user not found
            const initial = user ? user.name.charAt(0) : '?'; 
            return `<span class="assigned-user" title="${user ? user.name : 'Unknown'}">${initial}</span>`;
        }).join('');

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
                <select class="status-select">
                    <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                    <option value="Doing" ${task.status === 'Doing' ? 'selected' : ''}>Doing</option>
                    <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
            </div>`;
        
        card.querySelector('.delete-btn').addEventListener('click', async () => {
            await deleteTask(task._id);
            await fetchTasks();
            renderKanbanBoard();
        });

        card.querySelector('.edit-btn').addEventListener('click', () => {
            openEditModal(task);
        });

        card.querySelector('.log-btn').addEventListener('click', () => openHistoryModal(task._id));

        card.querySelector('.status-select').addEventListener('change', async (e) => {
            const newStatus = e.target.value;

            const formData = new FormData();
            formData.append('title', task.title);
            formData.append('description', task.description);
            formData.append('tags', task.tags.join(','));
            formData.append('status', newStatus);
            formData.append('assignedUsers', JSON.stringify(task.assignedUsers));
            formData.append('existingImages', JSON.stringify(task.imageUrls));
            formData.append('taskIdentifier', task.taskIdentifier);

            await fetch(`${API_URL_BASE}/tasks/${task._id}`, { method: 'PUT', body: formData });


            // await updateTask(task._id, { ...task, status: newStatus });
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
            document.getElementById('task-tags-input').value = (task.tags || []).join(', ');
        } else {
            // Reset form for adding
            formTitle.textContent = 'Add New Task';
            taskForm.reset();
            document.getElementById('task-id').value = '';
            // NEW: Populate user select on the 'Add' page
            populateUserSelect(document.getElementById('task-users-select'));
        }
    }

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskId = document.getElementById('task-id').value;
        const formData = new FormData(taskForm);
        
        const endpoint = taskId ? `${API_URL_BASE}/tasks/${taskId}` : `${API_URL_BASE}/tasks`;
        const method = taskId ? 'PUT' : 'POST';

        // NEW: Append assigned users to FormData
        // NEW: Get selected users and add to FormData
        const selectedUserIds = Array.from(document.getElementById('task-users-select').selectedOptions).map(opt => opt.value);
        formData.append('assignedUsers', JSON.stringify(selectedUserIds));

        if(method === 'POST') {
             await fetch(endpoint, { method: 'POST', body: formData });
        } else {
             // FormData for PUT needs multer on backend. Simple updates use JSON.
             await updateTask(taskId, {

                title: formData.get('title'),
                description: formData.get('description'),
                tags: formData.get('tags').split(',').map(t => t.trim()),
                status: state.tasks.find(t => t._id === taskId).status,
            });
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

    // --- ADD THIS NEW EVENT LISTENER ---
    document.getElementById('log-export-btn').addEventListener('click', async () => {
    // 1. Get the email list
    const emails = document.getElementById('log-export-emails').value;
    if (!emails) {
        alert('Please enter at least one email address to send the export.');
        return;
        }
    
    // 2. Get the current filter values
    const taskIdOrName = document.getElementById('log-filter-task').value;
    const startDate = document.getElementById('log-filter-start-date').value;
    const endDate = document.getElementById('log-filter-end-date').value;

    const filters = {};
    if (taskIdOrName) filters.taskIdOrName = taskIdOrName;
    if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
    }

    // 3. Send the request to the new export endpoint
    try {
        const response = await fetch(`${API_URL_BASE}/logs/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emails: emails,
                ...filters // Spread the filter values
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        alert(result.message);
        } catch (error) {
        console.error('Error emailing logs:', error);
        alert(`Error: ${error.message}`);
        }
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

    // --- MODAL LOGIC ---
    closeModalBtn.onclick = () => mainModal.style.display = "none";
    window.onclick = (event) => { if (event.target == mainModal) mainModal.style.display = "none"; };
    
    // NEW: Helper function to populate any user select element
    function populateUserSelect(selectElement, assignedUserIds = []) {
        if (!selectElement) return;
        selectElement.innerHTML = state.users.map(user => {
            const isAssigned = assignedUserIds.includes(user._id);
            return `<option value="${user._id}" ${isAssigned ? 'selected' : ''}>
                        ${user.name} (${user.email})
                    </option>`;
        }).join('');
    }

    function openEditModal(task) {
        modalTitle.textContent = "Edit Task";
        let imagesToDelete = new Set();
        
        const existingImagesHTML = (task.imageUrls || []).map(url => `
            <div class="existing-image-container" data-url="${url}">
                <img src="http://localhost:5000${url}" alt="task image" class="thumbnail">
                <button type="button" class="delete-image-btn" title="Remove image">&times;</button>
            </div>
        `).join('');

        modalBody.innerHTML = `
            <form id="modal-edit-form">
                <label for="modal-task-identifier">Task ID</label>
                <input type="text" id="modal-task-identifier" value="${task.taskIdentifier || ''}">

                <label for="modal-task-title">Title</label>
                <input type="text" id="modal-task-title" value="${task.title}" required>
                
                <label for="modal-task-description">Description</label>
                <textarea id="modal-task-description">${task.description || ''}</textarea>
                
                <label for="modal-task-tags">Tags (comma-separated)</label>
                <input type="text" id="modal-task-tags" value="${(task.tags || []).join(', ')}">

                ${task.imageUrls && task.imageUrls.length > 0 ? `
                    <label>Existing Images</label>
                    <div class="existing-images-section">${existingImagesHTML}</div>
                ` : '<p style="margin-top: 1rem;">No existing images.</p>'}
                
                <label for="modal-task-images">Upload New Images</label>
                <input type="file" id="modal-task-images" name="images" multiple accept="image/*">
                
                <button type="submit">Update Task</button>
            </form>
        `;

        // NEW: Populate the user select in the modal
        populateUserSelect(
            document.getElementById('modal-task-users'),
            task.assignedUsers
        );

        mainModal.style.display = "block";

        document.querySelectorAll('.delete-image-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = e.target.closest('.existing-image-container');
                const imageUrl = container.dataset.url;
                if (imagesToDelete.has(imageUrl)) {
                    imagesToDelete.delete(imageUrl);
                    container.classList.remove('marked-for-deletion');
                    e.target.innerHTML = '&times;';
                } else {
                    imagesToDelete.add(imageUrl);
                    container.classList.add('marked-for-deletion');
                    e.target.innerHTML = '&#10003;';
                }
            });
        });

        document.getElementById('modal-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('taskIdentifier', document.getElementById('modal-task-identifier').value); // GET NEW VALUE
            formData.append('title', document.getElementById('modal-task-title').value);
            formData.append('description', document.getElementById('modal-task-description').value);
            formData.append('tags', document.getElementById('modal-task-tags').value);
            formData.append('status', task.status);

            // NEW: Get selected users and add to FormData
            const selectedUserIds = Array.from(document.getElementById('modal-task-users').selectedOptions).map(opt => opt.value);
            formData.append('assignedUsers', JSON.stringify(selectedUserIds));

            const remainingExistingImages = Array.from(document.querySelectorAll('.existing-image-container'))
                                                .filter(container => !imagesToDelete.has(container.dataset.url))
                                                .map(container => container.dataset.url);
            formData.append('existingImages', JSON.stringify(remainingExistingImages));

            const newImageFiles = document.getElementById('modal-task-images').files;
            for (const file of newImageFiles) {
                formData.append('images', file);
            }

            await fetch(`${API_URL_BASE}/tasks/${task._id}`, {
                method: 'PUT',
                body: formData,
            });
            
            mainModal.style.display = "none";
            await fetchTasks();
            renderKanbanBoard();
        });
    }

    async function openHistoryModal(taskId) {
        modalTitle.textContent = "Task History";
        const response = await fetch(`${API_URL_BASE}/tasks/${taskId}/logs`);
        const logs = await response.json();

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
        mainModal.style.display = "block";
    }

    // --- USER MANAGEMENT PAGE ---
const addUserForm = document.getElementById('add-user-form');

addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    
    const response = await fetch(`${API_URL_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
    });
    
    const result = await response.json();
    if (response.ok) {
        addUserForm.reset();
        openOtpModal(result.userId, email);
    } else {
        alert(`Error: ${result.message}`);
    }
});

async function renderUsersList() {
    const response = await fetch(`${API_URL_BASE}/users`);
    const users = await response.json();
    const container = document.getElementById('users-container');
    
    if (users.length === 0) {
        container.innerHTML = '<p>No verified users found.</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <span>${user.name}</span>
            <span>${user.email}</span>
        </div>
    `).join('');
}

// --- OTP MODAL ---
function openOtpModal(userId, userEmail) {
    modalTitle.textContent = "Verify Your Email";
    modalBody.innerHTML = `
        <p>An OTP has been sent to <strong>${userEmail}</strong>. Please enter it below.</p>
        <form id="otp-form">
            <label for="otp-input">OTP Code</label>
            <input type="text" id="otp-input" required pattern="[0-9]{6}" maxlength="6">
            <button type="submit">Verify</button>
        </form>
    `;
    mainModal.style.display = "block";
    
    document.getElementById('otp-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('otp-input').value;
        const response = await fetch(`${API_URL_BASE}/users/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, otp }),
        });
        
        const result = await response.json();
        if (response.ok) {
            mainModal.style.display = "none";
            alert('User verified successfully!');
            renderUsersList(); // Refresh the list
        } else {
            alert(`Error: ${result.message}`);
            // You can add a "Retry" link or logic here
        }
    });
    }

    // --- INITIALIZATION ---
    async function initializeApp() {
        navigateTo(window.location.hash || '#task-board');
        // Fetch users AND tasks in parallel for faster loading
        await Promise.all([
            fetchTasks(),
            fetchUsers() 
        ]);
        renderKanbanBoard();
        // Pre-populate the user select on the "Add Task" page
        populateUserSelect(document.getElementById('task-users-select'));
    }

    initializeApp();
});