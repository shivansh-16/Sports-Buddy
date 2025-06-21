/**
 * Admin panel functionality for Sports Buddy
 * Handles management of sports types, cities, areas, and events
 */

import { auth, db } from './firebase-config.js';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState, isAdmin, getUserDisplayName } from './auth.js';
import { logAdminAction, logDatabaseOperation, logError } from './logging.js';

// Global state
let currentUser = null;
let currentSection = 'sports';
let sportsTypes = [];
let cities = [];
let areas = [];
let events = [];

/**
 * Initialize admin panel
 */
async function init() {
    try {
        currentUser = await checkAuthState(true);
        
        // Check if user is admin
        if (!(await isAdmin(currentUser))) {
            logError('Unauthorized admin access attempt', null, { 
                uid: currentUser.uid, 
                email: currentUser.email 
            });
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        setupUI();
        await loadAllData();
        setupEventListeners();
        showSection('sports');
        
        logAdminAction('admin_panel_loaded', { uid: currentUser.uid });
    } catch (error) {
        logError('Admin panel initialization failed', error);
        window.location.href = 'login.html';
    }
}

/**
 * Setup UI elements
 */
function setupUI() {
    const adminGreeting = document.getElementById('adminGreeting');
    if (adminGreeting) {
        adminGreeting.textContent = `Admin: ${getUserDisplayName(currentUser)}`;
    }
}

/**
 * Load all data
 */
async function loadAllData() {
    try {
        await Promise.all([
            loadSportsTypes(),
            loadCities(),
            loadAreas(),
            loadEvents()
        ]);
    } catch (error) {
        logError('Failed to load admin data', error);
    }
}

/**
 * Load sports types
 */
async function loadSportsTypes() {
    try {
        const snapshot = await getDocs(query(collection(db, 'sports_types'), orderBy('name')));
        sportsTypes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        logDatabaseOperation('read', 'sports_types', { count: sportsTypes.length });
        
        if (currentSection === 'sports') {
            displaySportsTypes();
        }
    } catch (error) {
        logError('Failed to load sports types', error);
        sportsTypes = [];
        if (currentSection === 'sports') {
            displaySportsTypes();
        }
    }
}

/**
 * Load cities
 */
async function loadCities() {
    try {
        const snapshot = await getDocs(query(collection(db, 'cities'), orderBy('name')));
        cities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        logDatabaseOperation('read', 'cities', { count: cities.length });
        
        if (currentSection === 'cities') {
            displayCities();
        }
    } catch (error) {
        logError('Failed to load cities', error);
        cities = [];
        if (currentSection === 'cities') {
            displayCities();
        }
    }
}

/**
 * Load areas
 */
async function loadAreas() {
    try {
        const snapshot = await getDocs(query(collection(db, 'areas'), orderBy('name')));
        areas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        logDatabaseOperation('read', 'areas', { count: areas.length });
        
        if (currentSection === 'areas') {
            displayAreas();
        }
    } catch (error) {
        logError('Failed to load areas', error);
        areas = [];
        if (currentSection === 'areas') {
            displayAreas();
        }
    }
}

/**
 * Load events
 */
async function loadEvents() {
    try {
        const snapshot = await getDocs(query(collection(db, 'sports_events'), orderBy('created_at', 'desc')));
        events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        logDatabaseOperation('read', 'sports_events', { count: events.length });
        
        if (currentSection === 'events') {
            displayEvents();
        }
    } catch (error) {
        logError('Failed to load events', error);
        events = [];
        if (currentSection === 'events') {
            displayEvents();
        }
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });
    
    // Add buttons
    const addSportBtn = document.getElementById('addSportBtn');
    const addCityBtn = document.getElementById('addCityBtn');
    const addAreaBtn = document.getElementById('addAreaBtn');
    
    if (addSportBtn) addSportBtn.addEventListener('click', () => openAddModal('sport'));
    if (addCityBtn) addCityBtn.addEventListener('click', () => openAddModal('city'));
    if (addAreaBtn) addAreaBtn.addEventListener('click', () => openAddModal('area'));
    
    // Modal controls
    const closeAdminModal = document.getElementById('closeAdminModal');
    const cancelAdmin = document.getElementById('cancelAdmin');
    if (closeAdminModal) closeAdminModal.addEventListener('click', closeModal);
    if (cancelAdmin) cancelAdmin.addEventListener('click', closeModal);
    
    // Form submission
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Modal close on outside click
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

/**
 * Show specific section
 */
function showSection(section) {
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Load and display data for the section
    switch (section) {
        case 'sports':
            displaySportsTypes();
            break;
        case 'cities':
            displayCities();
            break;
        case 'areas':
            displayAreas();
            break;
        case 'events':
            displayEvents();
            break;
    }
    
    logAdminAction('section_viewed', { section });
}

/**
 * Display sports types
 */
function displaySportsTypes() {
    const grid = document.getElementById('sportsGrid');
    if (!grid) return;
    
    if (sportsTypes.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No Sports Types</h3><p>Add your first sport type to get started.</p></div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sportsTypes.map(sport => `
                    <tr>
                        <td>${sport.name}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-outline btn-small edit-sport" data-id="${sport.id}">Edit</button>
                                <button class="btn btn-danger btn-small delete-sport" data-id="${sport.id}">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    grid.innerHTML = tableHTML;
    attachSportActions();
}

/**
 * Display cities
 */
function displayCities() {
    const grid = document.getElementById('citiesGrid');
    if (!grid) return;
    
    if (cities.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No Cities</h3><p>Add your first city to get started.</p></div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${cities.map(city => `
                    <tr>
                        <td>${city.name}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-outline btn-small edit-city" data-id="${city.id}">Edit</button>
                                <button class="btn btn-danger btn-small delete-city" data-id="${city.id}">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    grid.innerHTML = tableHTML;
    attachCityActions();
}

/**
 * Display areas
 */
function displayAreas() {
    const grid = document.getElementById('areasGrid');
    if (!grid) return;
    
    if (areas.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No Areas</h3><p>Add your first area to get started.</p></div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${areas.map(area => {
                    const city = cities.find(c => c.id === area.city_id);
                    return `
                        <tr>
                            <td>${area.name}</td>
                            <td>${city ? city.name : 'Unknown City'}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-outline btn-small edit-area" data-id="${area.id}">Edit</button>
                                    <button class="btn btn-danger btn-small delete-area" data-id="${area.id}">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    grid.innerHTML = tableHTML;
    attachAreaActions();
}

/**
 * Display events
 */
function displayEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    
    if (events.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No Events</h3><p>No events have been created yet.</p></div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Sport</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Created By</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${events.map(event => `
                    <tr>
                        <td>${event.event_name}</td>
                        <td>${event.sport_type}</td>
                        <td>${event.area}, ${event.city}</td>
                        <td>${new Date(event.date_time).toLocaleDateString()}</td>
                        <td>${event.created_by}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-danger btn-small delete-event" data-id="${event.id}">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    grid.innerHTML = tableHTML;
    attachEventActions();
}

/**
 * Attach sport action handlers
 */
function attachSportActions() {
    document.querySelectorAll('.delete-sport').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const sportId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this sport type?')) {
                await deleteSport(sportId);
            }
        });
    });
    
    document.querySelectorAll('.edit-sport').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sportId = e.target.dataset.id;
            editSport(sportId);
        });
    });
}

/**
 * Attach city action handlers
 */
function attachCityActions() {
    document.querySelectorAll('.delete-city').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cityId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this city?')) {
                await deleteCity(cityId);
            }
        });
    });
    
    document.querySelectorAll('.edit-city').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cityId = e.target.dataset.id;
            editCity(cityId);
        });
    });
}

/**
 * Attach area action handlers
 */
function attachAreaActions() {
    document.querySelectorAll('.delete-area').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const areaId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this area?')) {
                await deleteArea(areaId);
            }
        });
    });
    
    document.querySelectorAll('.edit-area').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const areaId = e.target.dataset.id;
            editArea(areaId);
        });
    });
}

/**
 * Attach event action handlers
 */
function attachEventActions() {
    document.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eventId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this event?')) {
                await deleteEvent(eventId);
            }
        });
    });
}

/**
 * Open add modal
 */
function openAddModal(type) {
    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    const form = document.getElementById('adminForm');
    
    if (!modal || !modalTitle || !formFields || !form) return;
    
    // Reset form
    form.reset();
    form.dataset.mode = 'add';
    form.dataset.type = type;
    
    // Set title and fields based on type
    switch (type) {
        case 'sport':
            modalTitle.textContent = 'Add Sport Type';
            formFields.innerHTML = `
                <div class="form-group">
                    <label for="sportName">Sport Name</label>
                    <input type="text" id="sportName" name="sportName" required>
                </div>
            `;
            break;
        case 'city':
            modalTitle.textContent = 'Add City';
            formFields.innerHTML = `
                <div class="form-group">
                    <label for="cityName">City Name</label>
                    <input type="text" id="cityName" name="cityName" required>
                </div>
            `;
            break;
        case 'area':
            modalTitle.textContent = 'Add Area';
            formFields.innerHTML = `
                <div class="form-group">
                    <label for="areaName">Area Name</label>
                    <input type="text" id="areaName" name="areaName" required>
                </div>
                <div class="form-group">
                    <label for="areaCity">City</label>
                    <select id="areaCity" name="areaCity" required>
                        <option value="">Select City</option>
                        ${cities.map(city => `<option value="${city.id}">${city.name}</option>`).join('')}
                    </select>
                </div>
            `;
            break;
    }
    
    modal.classList.add('active');
    logAdminAction('add_modal_opened', { type });
}

/**
 * Edit sport
 */
function editSport(sportId) {
    const sport = sportsTypes.find(s => s.id === sportId);
    if (!sport) return;
    
    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    const form = document.getElementById('adminForm');
    
    form.reset();
    form.dataset.mode = 'edit';
    form.dataset.type = 'sport';
    form.dataset.id = sportId;
    
    modalTitle.textContent = 'Edit Sport Type';
    formFields.innerHTML = `
        <div class="form-group">
            <label for="sportName">Sport Name</label>
            <input type="text" id="sportName" name="sportName" value="${sport.name}" required>
        </div>
    `;
    
    modal.classList.add('active');
    logAdminAction('edit_modal_opened', { type: 'sport', id: sportId });
}

/**
 * Edit city
 */
function editCity(cityId) {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    
    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    const form = document.getElementById('adminForm');
    
    form.reset();
    form.dataset.mode = 'edit';
    form.dataset.type = 'city';
    form.dataset.id = cityId;
    
    modalTitle.textContent = 'Edit City';
    formFields.innerHTML = `
        <div class="form-group">
            <label for="cityName">City Name</label>
            <input type="text" id="cityName" name="cityName" value="${city.name}" required>
        </div>
    `;
    
    modal.classList.add('active');
    logAdminAction('edit_modal_opened', { type: 'city', id: cityId });
}

/**
 * Edit area
 */
function editArea(areaId) {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    const form = document.getElementById('adminForm');
    
    form.reset();
    form.dataset.mode = 'edit';
    form.dataset.type = 'area';
    form.dataset.id = areaId;
    
    modalTitle.textContent = 'Edit Area';
    formFields.innerHTML = `
        <div class="form-group">
            <label for="areaName">Area Name</label>
            <input type="text" id="areaName" name="areaName" value="${area.name}" required>
        </div>
        <div class="form-group">
            <label for="areaCity">City</label>
            <select id="areaCity" name="areaCity" required>
                <option value="">Select City</option>
                ${cities.map(city => 
                    `<option value="${city.id}" ${city.id === area.city_id ? 'selected' : ''}>${city.name}</option>`
                ).join('')}
            </select>
        </div>
    `;
    
    modal.classList.add('active');
    logAdminAction('edit_modal_opened', { type: 'area', id: areaId });
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('adminModal');
    const form = document.getElementById('adminForm');
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (form) {
        form.reset();
        delete form.dataset.mode;
        delete form.dataset.type;
        delete form.dataset.id;
    }
    
    logAdminAction('modal_closed');
}

/**
 * Handle form submission
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const mode = form.dataset.mode;
    const type = form.dataset.type;
    const id = form.dataset.id;
    
    const submitBtn = document.getElementById('submitAdmin');
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'add' ? 'Adding...' : 'Updating...';
    
    try {
        if (mode === 'add') {
            await handleAdd(type, formData);
        } else if (mode === 'edit') {
            await handleEdit(type, id, formData);
        }
        
        closeModal();
    } catch (error) {
        logError(`Failed to ${mode} ${type}`, error);
        alert(`Failed to ${mode} ${type}. Please try again.`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save';
    }
}

/**
 * Handle add operations
 */
async function handleAdd(type, formData) {
    let data = {};
    let collectionName = '';
    
    switch (type) {
        case 'sport':
            data = { name: formData.get('sportName') };
            collectionName = 'sports_types';
            break;
        case 'city':
            data = { name: formData.get('cityName') };
            collectionName = 'cities';
            break;
        case 'area':
            data = { 
                name: formData.get('areaName'),
                city_id: formData.get('areaCity')
            };
            collectionName = 'areas';
            break;
    }
    
    const docRef = await addDoc(collection(db, collectionName), data);
    
    logDatabaseOperation('create', collectionName, { id: docRef.id, ...data });
    logAdminAction(`${type}_added`, { id: docRef.id, name: data.name });
    
    // Reload data
    await loadAllData();
}

/**
 * Handle edit operations
 */
async function handleEdit(type, id, formData) {
    let data = {};
    let collectionName = '';
    
    switch (type) {
        case 'sport':
            data = { name: formData.get('sportName') };
            collectionName = 'sports_types';
            break;
        case 'city':
            data = { name: formData.get('cityName') };
            collectionName = 'cities';
            break;
        case 'area':
            data = { 
                name: formData.get('areaName'),
                city_id: formData.get('areaCity')
            };
            collectionName = 'areas';
            break;
    }
    
    await updateDoc(doc(db, collectionName, id), data);
    
    logDatabaseOperation('update', collectionName, { id, ...data });
    logAdminAction(`${type}_updated`, { id, name: data.name });
    
    // Reload data
    await loadAllData();
}

/**
 * Delete sport
 */
async function deleteSport(sportId) {
    try {
        await deleteDoc(doc(db, 'sports_types', sportId));
        
        logDatabaseOperation('delete', 'sports_types', { id: sportId });
        logAdminAction('sport_deleted', { id: sportId });
        
        await loadSportsTypes();
    } catch (error) {
        logError('Failed to delete sport', error, { sportId });
        alert('Failed to delete sport type. Please try again.');
    }
}

/**
 * Delete city
 */
async function deleteCity(cityId) {
    try {
        await deleteDoc(doc(db, 'cities', cityId));
        
        logDatabaseOperation('delete', 'cities', { id: cityId });
        logAdminAction('city_deleted', { id: cityId });
        
        await loadCities();
    } catch (error) {
        logError('Failed to delete city', error, { cityId });
        alert('Failed to delete city. Please try again.');
    }
}

/**
 * Delete area
 */
async function deleteArea(areaId) {
    try {
        await deleteDoc(doc(db, 'areas', areaId));
        
        logDatabaseOperation('delete', 'areas', { id: areaId });
        logAdminAction('area_deleted', { id: areaId });
        
        await loadAreas();
    } catch (error) {
        logError('Failed to delete area', error, { areaId });
        alert('Failed to delete area. Please try again.');
    }
}

/**
 * Delete event
 */
async function deleteEvent(eventId) {
    try {
        await deleteDoc(doc(db, 'sports_events', eventId));
        
        logDatabaseOperation('delete', 'sports_events', { id: eventId });
        logAdminAction('event_deleted', { id: eventId });
        
        await loadEvents();
    } catch (error) {
        logError('Failed to delete event', error, { eventId });
        alert('Failed to delete event. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);