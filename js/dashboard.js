/**
 * Dashboard functionality for Sports Buddy
 * Handles event display, filtering, and creation with India-specific locations
 */

import { auth, db } from './firebase-config.js';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
    updateDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState, getUserDisplayName } from './auth.js';
import { logUserEvent, logDatabaseOperation, logError } from './logging.js';
import { indianStates, getCitiesForState } from './india-locations.js';
import { showSuccess, showError, showWarning, showInfo } from './toast.js';

// Global state
let currentUser = null;
let allEvents = [];
let filteredEvents = [];
let currentTab = 'all';
let sportsTypes = [];

/**
 * Initialize dashboard
 */
async function init() {
    try {
        currentUser = await checkAuthState(true);
        setupUI();
        await loadData();
        setupEventListeners();
        logUserEvent('dashboard_loaded', { uid: currentUser.uid });
        showSuccess('🎉 Welcome to Sports Buddy!');
    } catch (error) {
        logError('Dashboard initialization failed', error);
        showError('Failed to load dashboard. Please refresh the page.');
    }
}

/**
 * Setup UI elements
 */
function setupUI() {
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${getUserDisplayName(currentUser)}! 👋`;
    }
}

/**
 * Load all necessary data
 */
async function loadData() {
    try {
        await Promise.all([
            loadSportsTypes(),
            loadEvents()
        ]);
        
        populateFilterDropdowns();
        populateCreateEventDropdowns();
    } catch (error) {
        logError('Failed to load dashboard data', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

/**
 * Load sports types from Firestore
 */
async function loadSportsTypes() {
    try {
        const snapshot = await getDocs(query(collection(db, 'sports_types'), orderBy('name')));
        sportsTypes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        logDatabaseOperation('read', 'sports_types', { count: sportsTypes.length });
        
        // If no sports types found, show helpful message
        if (sportsTypes.length === 0) {
            console.warn('No sports types found in database. Please initialize default data.');
            showWarning('⚠️ No sports available. Please initialize data first.');
        }
    } catch (error) {
        logError('Failed to load sports types', error);
        sportsTypes = [];
        showError('Failed to load sports types.');
    }
}

/**
 * Load events from Firestore
 */
async function loadEvents() {
    try {
        showLoadingState();
        
        // Set up real-time listener for events
        const eventsRef = collection(db, 'sports_events');
        const q = query(eventsRef, orderBy('date_time', 'asc'));
        
        onSnapshot(q, (snapshot) => {
            allEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            logDatabaseOperation('read', 'sports_events', { count: allEvents.length });
            applyFilters();
            displayEvents();
        }, (error) => {
            logError('Failed to load events', error);
            hideLoadingState();
            showError('Failed to load events. Please refresh the page.');
            showEmptyState('Failed to load events. Please refresh the page.');
        });
        
    } catch (error) {
        logError('Failed to setup events listener', error);
        hideLoadingState();
        showError('Failed to setup event updates.');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Create event button
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', openCreateEventModal);
    }
    
    // Modal controls
    const closeModal = document.getElementById('closeModal');
    const cancelEvent = document.getElementById('cancelEvent');
    if (closeModal) closeModal.addEventListener('click', closeCreateEventModal);
    if (cancelEvent) cancelEvent.addEventListener('click', closeCreateEventModal);
    
    // Create event form
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
    }
    
    // Filter controls
    const sportFilter = document.getElementById('sportFilter');
    const stateFilter = document.getElementById('stateFilter');
    const cityFilter = document.getElementById('cityFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearFilters = document.getElementById('clearFilters');
    
    if (sportFilter) sportFilter.addEventListener('change', applyFilters);
    if (stateFilter) stateFilter.addEventListener('change', handleStateChange);
    if (cityFilter) cityFilter.addEventListener('change', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
    if (clearFilters) clearFilters.addEventListener('click', clearAllFilters);
    
    // Tab controls
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Location selection handlers
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    
    if (stateSelect) stateSelect.addEventListener('change', handleCreateEventStateChange);
    if (citySelect) citySelect.addEventListener('change', handleCityChange);
    
    // Modal close on outside click
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCreateEventModal();
            }
        });
    }
}

/**
 * Populate filter dropdowns
 */
function populateFilterDropdowns() {
    const sportFilter = document.getElementById('sportFilter');
    const stateFilter = document.getElementById('stateFilter');
    
    // Populate sports filter
    if (sportFilter) {
        sportFilter.innerHTML = '<option value="">All Sports</option>';
        sportsTypes.forEach(sport => {
            const option = document.createElement('option');
            option.value = sport.name;
            option.textContent = `${getSportIcon(sport.name)} ${sport.name}`;
            sportFilter.appendChild(option);
        });
        
        // Show message if no sports available
        if (sportsTypes.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No sports available - Initialize data first';
            option.disabled = true;
            sportFilter.appendChild(option);
        }
    }
    
    // Populate states filter
    if (stateFilter) {
        stateFilter.innerHTML = '<option value="">All States</option>';
        indianStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });
    }
}

/**
 * Populate create event form dropdowns
 */
function populateCreateEventDropdowns() {
    const sportType = document.getElementById('sportType');
    const stateSelect = document.getElementById('state');
    
    // Populate sports dropdown
    if (sportType) {
        sportType.innerHTML = '<option value="">Select Sport</option>';
        sportsTypes.forEach(sport => {
            const option = document.createElement('option');
            option.value = sport.name;
            option.textContent = `${getSportIcon(sport.name)} ${sport.name}`;
            sportType.appendChild(option);
        });
        
        // Show message if no sports available
        if (sportsTypes.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No sports available - Initialize data first';
            option.disabled = true;
            sportType.appendChild(option);
        }
    }
    
    // Populate states dropdown
    if (stateSelect) {
        stateSelect.innerHTML = '<option value="">Select State</option>';
        indianStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}

/**
 * Get sport icon emoji
 */
function getSportIcon(sportName) {
    const icons = {
        'Cricket': '🏏',
        'Football': '⚽',
        'Basketball': '🏀',
        'Tennis': '🎾',
        'Badminton': '🏸',
        'Volleyball': '🏐',
        'Table Tennis': '🏓',
        'Swimming': '🏊‍♂️',
        'Running': '🏃‍♂️',
        'Cycling': '🚴‍♂️',
        'Hockey': '🏑',
        'Baseball': '⚾',
        'Kabaddi': '🤼‍♂️',
        'Wrestling': '🤼‍♂️',
        'Boxing': '🥊',
        'Athletics': '🏃‍♂️',
        'Gym/Fitness': '💪',
        'Yoga': '🧘‍♂️',
        'Chess': '♟️',
        'Carrom': '🎯'
    };
    return icons[sportName] || '🏃‍♂️';
}

/**
 * Handle state change in filters
 */
function handleStateChange() {
    const stateFilter = document.getElementById('stateFilter');
    const cityFilter = document.getElementById('cityFilter');
    
    if (!stateFilter || !cityFilter) return;
    
    const selectedState = stateFilter.value;
    
    // Clear city filter
    cityFilter.innerHTML = '<option value="">All Cities</option>';
    
    if (selectedState) {
        const cities = getCitiesForState(selectedState);
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    }
    
    // Apply filters after updating cities
    applyFilters();
}

/**
 * Handle state change in create event form
 */
function handleCreateEventStateChange() {
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    
    if (!stateSelect || !citySelect) return;
    
    const selectedState = stateSelect.value;
    
    // Clear city dropdown
    citySelect.innerHTML = '<option value="">Select City/District</option>';
    
    if (selectedState) {
        const cities = getCitiesForState(selectedState);
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        
        // Add "Other" option
        const otherOption = document.createElement('option');
        otherOption.value = 'Other';
        otherOption.textContent = 'Other (Enter manually)';
        citySelect.appendChild(otherOption);
    } else {
        citySelect.innerHTML = '<option value="">Select State First</option>';
    }
    
    // Hide custom city field
    const customCityGroup = document.getElementById('customCityGroup');
    if (customCityGroup) {
        customCityGroup.style.display = 'none';
    }
}

/**
 * Handle city change in create event form
 */
function handleCityChange() {
    const citySelect = document.getElementById('city');
    const customCityGroup = document.getElementById('customCityGroup');
    const customCityInput = document.getElementById('customCity');
    
    if (!citySelect || !customCityGroup) return;
    
    if (citySelect.value === 'Other') {
        customCityGroup.style.display = 'block';
        if (customCityInput) {
            customCityInput.required = true;
        }
        showInfo('💡 Please enter your city name in the field below');
    } else {
        customCityGroup.style.display = 'none';
        if (customCityInput) {
            customCityInput.required = false;
            customCityInput.value = '';
        }
    }
}

/**
 * Apply filters to events
 */
function applyFilters() {
    const sportFilter = document.getElementById('sportFilter')?.value || '';
    const stateFilter = document.getElementById('stateFilter')?.value || '';
    const cityFilter = document.getElementById('cityFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    
    filteredEvents = allEvents.filter(event => {
        // Sport filter
        if (sportFilter && event.sport_type !== sportFilter) return false;
        
        // State filter
        if (stateFilter && event.state !== stateFilter) return false;
        
        // City filter
        if (cityFilter && event.city !== cityFilter) return false;
        
        // Date filter
        if (dateFilter) {
            const eventDate = new Date(event.date_time).toISOString().split('T')[0];
            if (eventDate !== dateFilter) return false;
        }
        
        // Tab filter
        if (currentTab === 'my' && event.created_by !== currentUser.uid) return false;
        
        return true;
    });
    
    logUserEvent('filters_applied', {
        sportFilter,
        stateFilter,
        cityFilter,
        dateFilter,
        tab: currentTab,
        resultCount: filteredEvents.length
    });
    
    displayEvents();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    const sportFilter = document.getElementById('sportFilter');
    const stateFilter = document.getElementById('stateFilter');
    const cityFilter = document.getElementById('cityFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (sportFilter) sportFilter.value = '';
    if (stateFilter) stateFilter.value = '';
    if (cityFilter) cityFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    
    // Reset city filter to show all cities
    if (cityFilter) {
        cityFilter.innerHTML = '<option value="">All Cities</option>';
    }
    
    logUserEvent('filters_cleared');
    showInfo('🔄 Filters cleared');
    applyFilters();
}

/**
 * Switch between tabs
 */
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    logUserEvent('tab_switched', { tab });
    applyFilters();
}

/**
 * Display events in the grid
 */
function displayEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    hideLoadingState();
    
    if (filteredEvents.length === 0) {
        showEmptyState();
        return;
    }
    
    eventsGrid.innerHTML = filteredEvents.map(event => createEventCard(event)).join('');
    
    // Attach event listeners to action buttons
    attachEventActions();
    
    // Add fade-in animation
    eventsGrid.classList.add('fade-in');
}

/**
 * Create HTML for an event card
 */
function createEventCard(event) {
    const eventDate = new Date(event.date_time);
    const isMyEvent = event.created_by === currentUser.uid;
    const sportIcon = getSportIcon(event.sport_type);
    
    return `
        <div class="event-card">
            <div class="event-card-header">
                <h3 class="event-card-title">
                    <span class="sport-icon">${sportIcon}</span>
                    ${event.event_name}
                </h3>
                <div class="event-card-meta">
                    <div>🏃‍♂️ ${event.sport_type}</div>
                    <div>📍 ${event.city}, ${event.state}</div>
                    <div>🏢 ${event.event_location}</div>
                    <div>📅 ${eventDate.toLocaleDateString('en-IN')}</div>
                    <div>⏰ ${eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
            <div class="event-card-body">
                ${event.description ? `<p class="event-card-description">${event.description}</p>` : ''}
                <div class="event-card-actions">
                    ${isMyEvent ? `
                        <button class="btn btn-outline btn-small edit-event" data-id="${event.id}">✏️ Edit</button>
                        <button class="btn btn-danger btn-small delete-event" data-id="${event.id}">🗑️ Delete</button>
                    ` : `
                        <button class="btn btn-primary btn-small join-event" data-id="${event.id}">🎯 Join Event</button>
                    `}
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to action buttons
 */
function attachEventActions() {
    // Delete event buttons
    document.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eventId = e.target.dataset.id;
            if (confirm('🗑️ Are you sure you want to delete this event?')) {
                await deleteEvent(eventId);
            }
        });
    });
    
    // Edit event buttons (simplified - just shows alert for now)
    document.querySelectorAll('.edit-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showInfo('✏️ Edit functionality coming soon!');
        });
    });
    
    // Join event buttons
    document.querySelectorAll('.join-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showSuccess('🎉 Event joined successfully! (Feature coming soon)');
        });
    });
}

/**
 * Delete an event
 */
async function deleteEvent(eventId) {
    try {
        await deleteDoc(doc(db, 'sports_events', eventId));
        
        logDatabaseOperation('delete', 'sports_events', { id: eventId });
        logUserEvent('event_deleted', { eventId });
        
        showSuccess('🗑️ Event deleted successfully!');
        
        // Events will be updated automatically due to real-time listener
    } catch (error) {
        logError('Failed to delete event', error, { eventId });
        showError('❌ Failed to delete event. Please try again.');
    }
}

/**
 * Open create event modal
 */
function openCreateEventModal() {
    // Check if data is available
    if (sportsTypes.length === 0) {
        showWarning('⚠️ Please initialize the default data first by visiting the init-data.html page, or ask an admin to add sports types.');
        return;
    }
    
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.classList.add('active');
        logUserEvent('create_event_modal_opened');
    }
}

/**
 * Close create event modal
 */
function closeCreateEventModal() {
    const modal = document.getElementById('createEventModal');
    const form = document.getElementById('createEventForm');
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (form) {
        form.reset();
        // Reset dropdowns
        const citySelect = document.getElementById('city');
        const customCityGroup = document.getElementById('customCityGroup');
        
        if (citySelect) {
            citySelect.innerHTML = '<option value="">Select State First</option>';
        }
        
        if (customCityGroup) {
            customCityGroup.style.display = 'none';
        }
    }
    
    logUserEvent('create_event_modal_closed');
}

/**
 * Handle create event form submission
 */
async function handleCreateEvent(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = '🎯 Creating Event...';
    
    try {
        // Determine the city name
        let cityName = formData.get('city');
        if (cityName === 'Other') {
            cityName = formData.get('customCity');
            if (!cityName || cityName.trim() === '') {
                showError('❌ Please enter your city name.');
                return;
            }
        }
        
        const eventData = {
            event_name: formData.get('eventName'),
            sport_type: formData.get('sportType'),
            state: formData.get('state'),
            city: cityName,
            event_location: formData.get('eventLocation'),
            date_time: formData.get('dateTime'),
            description: formData.get('description') || '',
            created_by: currentUser.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'sports_events'), eventData);
        
        logDatabaseOperation('create', 'sports_events', {
            id: docRef.id,
            ...eventData
        });
        
        logUserEvent('event_created', {
            eventId: docRef.id,
            eventName: eventData.event_name,
            sportType: eventData.sport_type,
            state: eventData.state,
            city: eventData.city
        });
        
        closeCreateEventModal();
        showSuccess('🎉 Event created successfully! Other players can now join your event.');
        
        // Events will be updated automatically due to real-time listener
    } catch (error) {
        logError('Failed to create event', error);
        showError('❌ Failed to create event. Please try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = '🎉 Create Event';
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid) {
        eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => element.remove());
}

/**
 * Show empty state
 */
function showEmptyState(message = null) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    let defaultMessage;
    let actionButton = '';
    
    if (sportsTypes.length === 0) {
        defaultMessage = "Please initialize default data first by visiting init-data.html";
        actionButton = '<a href="init-data.html" class="btn btn-primary">🚀 Initialize Data</a>';
    } else {
        defaultMessage = currentTab === 'my' 
            ? "You haven't created any events yet. Create your first event to get started!" 
            : "No events found matching your filters. Try adjusting your search criteria.";
        
        if (currentTab === 'my') {
            actionButton = '<button class="btn btn-primary" onclick="document.getElementById(\'createEventBtn\').click()">➕ Create Your First Event</button>';
        }
    }
    
    eventsGrid.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🏃‍♂️</div>
            <h3>No Events Found</h3>
            <p>${message || defaultMessage}</p>
            ${actionButton}
        </div>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);