/**
 * Initialize default data in Firebase collections
 * This script populates sports types for the application
 */

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    addDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { logDatabaseOperation, logAction } from './logging.js';

/**
 * Default sports types
 */
const defaultSportsTypes = [
    { name: 'Cricket' },
    { name: 'Football' },
    { name: 'Basketball' },
    { name: 'Tennis' },
    { name: 'Badminton' },
    { name: 'Volleyball' },
    { name: 'Table Tennis' },
    { name: 'Swimming' },
    { name: 'Running' },
    { name: 'Cycling' },
    { name: 'Hockey' },
    { name: 'Baseball' },
    { name: 'Kabaddi' },
    { name: 'Wrestling' },
    { name: 'Boxing' },
    { name: 'Athletics' },
    { name: 'Gym/Fitness' },
    { name: 'Yoga' },
    { name: 'Chess' },
    { name: 'Carrom' }
];

/**
 * Check if collection has data
 */
async function hasData(collectionName) {
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        return !snapshot.empty;
    } catch (error) {
        console.error(`Error checking ${collectionName}:`, error);
        return false;
    }
}

/**
 * Add sports types to Firebase
 */
async function addSportsTypes() {
    try {
        logAction('Adding default sports types');
        
        for (const sport of defaultSportsTypes) {
            await addDoc(collection(db, 'sports_types'), sport);
            logDatabaseOperation('create', 'sports_types', sport);
        }
        
        logAction('Sports types added successfully', { count: defaultSportsTypes.length });
    } catch (error) {
        console.error('Error adding sports types:', error);
        throw error;
    }
}

/**
 * Initialize all default data
 */
export async function initializeDefaultData() {
    try {
        logAction('Starting data initialization');
        
        // Check if data already exists
        const hasSports = await hasData('sports_types');
        
        if (hasSports) {
            logAction('Default sports data already exists, skipping initialization');
            
            // Show success message
            if (typeof window !== 'undefined') {
                alert('Sports data already exists! You can now create events.');
            }
            return;
        }
        
        // Add sports types if not exists
        if (!hasSports) {
            await addSportsTypes();
        }
        
        logAction('Data initialization completed successfully');
        
        // Show success message
        if (typeof window !== 'undefined') {
            alert('Default sports data has been added successfully! You can now create events with various sports types.');
        }
        
    } catch (error) {
        console.error('Error initializing default data:', error);
        logAction('Data initialization failed', { error: error.message });
        
        if (typeof window !== 'undefined') {
            alert('Failed to initialize default data. Please check the console for errors.');
        }
        
        throw error;
    }
}

/**
 * Manual trigger for data initialization (for testing)
 */
window.initializeData = initializeDefaultData;