# 🛠️ Sports Buddy - Developer Documentation

> **Comprehensive guide for developers to understand, modify, and extend Sports Buddy**

[![Developer Guide](https://img.shields.io/badge/📖_Developer-Guide-green?style=for-the-badge)](./README-DEVELOPER.md)
[![User Guide](https://img.shields.io/badge/👤_User-Guide-blue?style=for-the-badge)](./README.md)

---

## 📋 Table of Contents

1. [🚀 Quick Setup](#-quick-setup)
2. [🏗️ Project Architecture](#️-project-architecture)
3. [🔧 Configuration](#-configuration)
4. [📁 File Structure](#-file-structure)
5. [🎨 Customization Guide](#-customization-guide)
6. [🔌 API Integration](#-api-integration)
7. [🗄️ Database Schema](#️-database-schema)
8. [🎯 Feature Development](#-feature-development)
9. [🧪 Testing & Debugging](#-testing--debugging)
10. [🚀 Deployment](#-deployment)
11. [🔒 Security](#-security)
12. [📈 Performance](#-performance)
13. [🆘 Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Setup

### Prerequisites
```bash
# Required
Node.js (v16+)
npm or yarn
Git
Firebase Account

# Optional but Recommended
VS Code with extensions:
- ES6 String HTML
- Live Server
- Firebase Explorer
```

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/sports-buddy.git
cd sports-buddy

# 2. Install dependencies
npm install

# 3. Configure Firebase (see Configuration section)
# Edit js/firebase-config.js with your Firebase credentials

# 4. Initialize default data
# Visit http://localhost:5173/init-data.html after starting the server

# 5. Start development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
```

---

## 🏗️ Project Architecture

### Technology Stack
```
Frontend:
├── HTML5 (Semantic markup)
├── CSS3 (Custom properties, Grid, Flexbox)
├── JavaScript ES6+ (Modules, Async/Await)
└── Firebase SDK (v10.7.1)

Backend:
├── Firebase Authentication
├── Firebase Firestore (NoSQL Database)
└── Firebase Hosting (Optional)

Development:
├── Vite (Build tool)
├── ESLint (Code quality)
└── Git (Version control)
```

### Design Patterns
- **Module Pattern**: Each JS file is a self-contained module
- **Observer Pattern**: Firebase real-time listeners
- **Factory Pattern**: Dynamic HTML generation
- **Singleton Pattern**: Firebase configuration
- **MVC Pattern**: Separation of concerns

---

## 🔧 Configuration

### Firebase Setup

#### 1. Create Firebase Project
```bash
# Go to Firebase Console
https://console.firebase.google.com/

# Create new project
# Enable Authentication (Email/Password)
# Create Firestore database
# Get web app configuration
```

#### 2. Update Configuration
```javascript
// js/firebase-config.js
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    measurementId: "G-XXXXXXXXXX"
};
```

#### 3. Firestore Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read sports types, cities, areas
    match /sports_types/{document} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }
    
    match /cities/{document} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }
    
    match /areas/{document} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }
    
    // Events: read all, write own
    match /sports_events/{document} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.created_by || isAdmin());
    }
    
    function isAdmin() {
      return request.auth.token.email in ['admin@sportsbuddy.com', 'admin@test.com'];
    }
  }
}
```

### Environment Variables
```bash
# .env (for production)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📁 File Structure

```
sports-buddy/
├── 📄 index.html              # Landing page
├── 📄 dashboard.html          # User dashboard
├── 📄 login.html             # User login
├── 📄 register.html          # User registration
├── 📄 admin.html             # Admin panel
├── 📄 about_us.html          # About page
├── 📄 contact.html           # Contact page
├── 📄 init-data.html         # Data initialization
├── 📄 package.json           # Dependencies
├── 📄 README.md              # User documentation
├── 📄 README-DEVELOPER.md    # This file
├── 📁 css/
│   └── 📄 style.css          # All styles (8000+ lines)
├── 📁 js/
│   ├── 📄 firebase-config.js # Firebase setup
│   ├── 📄 auth.js           # Authentication utilities
│   ├── 📄 logging.js        # Logging system
│   ├── 📄 dashboard.js      # Dashboard functionality
│   ├── 📄 admin.js          # Admin panel
│   ├── 📄 login.js          # Login functionality
│   ├── 📄 register.js       # Registration functionality
│   ├── 📄 multi-step-form.js # Form wizard
│   ├── 📄 toast.js          # Notifications
│   ├── 📄 india-locations.js # Location data
│   └── 📄 init-data.js      # Data initialization
└── 📁 public/
    └── 📄 vite.svg           # Favicon
```

### Key Files Explained

#### Core JavaScript Modules
```javascript
// js/firebase-config.js - Firebase initialization
export const auth = getAuth(app);
export const db = getFirestore(app);

// js/auth.js - Authentication utilities
export function checkAuthState(requireAuth = true)
export async function isAdmin(user)
export async function signOut()

// js/logging.js - Comprehensive logging
export function logUserEvent(event, data = {})
export function logDatabaseOperation(operation, collection, data = {})
export function logError(error, errorObj = null, context = {})

// js/toast.js - User notifications
export function showSuccess(message, duration = 3000)
export function showError(message, duration = 4000)
export function showWarning(message, duration = 3500)
```

---

## 🎨 Customization Guide

### Changing Colors & Branding

#### 1. Update CSS Variables
```css
/* css/style.css - Line 15-45 */
:root {
    /* Primary Brand Colors */
    --primary: #6366f1;        /* Main brand color */
    --primary-dark: #4f46e5;   /* Darker variant */
    --primary-light: #818cf8;  /* Lighter variant */
    
    /* Secondary Colors */
    --secondary: #10b981;      /* Success/accent color */
    --secondary-dark: #059669; /* Darker variant */
    
    /* Update these to match your brand */
    --accent: #f59e0b;         /* Warning/highlight color */
    --success: #10b981;        /* Success messages */
    --warning: #f59e0b;        /* Warning messages */
    --error: #ef4444;          /* Error messages */
}
```

#### 2. Update Logo & Branding
```html
<!-- Update in all HTML files -->
<a href="index.html" class="logo">🏀 Your Brand Name</a>

<!-- Change emoji or add image -->
<a href="index.html" class="logo">
    <img src="your-logo.png" alt="Your Brand" width="32" height="32">
    Your Brand Name
</a>
```

#### 3. Update Meta Information
```html
<!-- Update in all HTML files -->
<title>Your App Name - Tagline</title>
<meta name="description" content="Your app description">
<meta property="og:title" content="Your App Name">
<meta property="og:description" content="Your app description">
```

### Adding New Sports Types

#### 1. Update Default Data
```javascript
// js/init-data.js - Line 15-35
const defaultSportsTypes = [
    { name: 'Cricket' },
    { name: 'Football' },
    // Add your new sports here
    { name: 'Your New Sport' },
    { name: 'Another Sport' }
];
```

#### 2. Update Sport Icons
```javascript
// js/dashboard.js - Line 150-175
function getSportIcon(sportName) {
    const icons = {
        'Cricket': '🏏',
        'Football': '⚽',
        // Add icons for new sports
        'Your New Sport': '🎯',
        'Another Sport': '⚡'
    };
    return icons[sportName] || '🏃‍♂️';
}
```

### Adding New Locations

#### 1. Update India Locations
```javascript
// js/india-locations.js
export const citiesByState = {
    'Your State': [
        'City 1', 'City 2', 'City 3'
    ],
    // Add more states and cities
};
```

#### 2. For International Support
```javascript
// Create new file: js/international-locations.js
export const countries = ['India', 'USA', 'UK', 'Canada'];
export const citiesByCountry = {
    'USA': {
        'California': ['Los Angeles', 'San Francisco'],
        'New York': ['New York City', 'Buffalo']
    }
};
```

---

## 🔌 API Integration

### Firebase API Usage

#### Authentication
```javascript
// Login user
import { signInWithEmailAndPassword } from 'firebase/auth';
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Register user
import { createUserWithEmailAndPassword } from 'firebase/auth';
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// Logout user
import { signOut } from 'firebase/auth';
await signOut(auth);
```

#### Firestore Operations
```javascript
// Create document
import { addDoc, collection } from 'firebase/firestore';
const docRef = await addDoc(collection(db, 'sports_events'), eventData);

// Read documents
import { getDocs, query, where, orderBy } from 'firebase/firestore';
const q = query(collection(db, 'sports_events'), 
    where('sport_type', '==', 'Cricket'),
    orderBy('date_time', 'asc')
);
const snapshot = await getDocs(q);

// Update document
import { updateDoc, doc } from 'firebase/firestore';
await updateDoc(doc(db, 'sports_events', eventId), updateData);

// Delete document
import { deleteDoc, doc } from 'firebase/firestore';
await deleteDoc(doc(db, 'sports_events', eventId));

// Real-time listener
import { onSnapshot } from 'firebase/firestore';
onSnapshot(collection(db, 'sports_events'), (snapshot) => {
    const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    // Update UI with new data
});
```

### Adding External APIs

#### 1. Weather API Integration
```javascript
// js/weather-api.js
export async function getWeatherForEvent(city, date) {
    const API_KEY = 'your-weather-api-key';
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
    );
    return await response.json();
}

// Usage in dashboard.js
import { getWeatherForEvent } from './weather-api.js';
const weather = await getWeatherForEvent(event.city, event.date_time);
```

#### 2. Maps API Integration
```javascript
// js/maps-api.js
export function initializeMap(containerId, lat, lng) {
    const map = new google.maps.Map(document.getElementById(containerId), {
        center: { lat, lng },
        zoom: 15
    });
    
    new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Event Location'
    });
}

// Add to HTML
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
```

#### 3. Payment API Integration
```javascript
// js/payment-api.js
export async function processPayment(amount, eventId) {
    // Stripe integration example
    const stripe = Stripe('your-publishable-key');
    
    const { error } = await stripe.redirectToCheckout({
        lineItems: [{
            price: 'price_id',
            quantity: 1,
        }],
        mode: 'payment',
        successUrl: `${window.location.origin}/success?event=${eventId}`,
        cancelUrl: `${window.location.origin}/cancel`,
    });
}
```

---

## 🗄️ Database Schema

### Firestore Collections

#### users
```javascript
{
    id: "user_uid",
    name: "John Doe",
    email: "john@example.com",
    role: "user" | "admin",
    profile_picture: "url_to_image",
    sports_interests: ["Cricket", "Football"],
    skill_levels: {
        "Cricket": "intermediate",
        "Football": "beginner"
    },
    location: {
        state: "Maharashtra",
        city: "Mumbai"
    },
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z"
}
```

#### sports_events
```javascript
{
    id: "event_id",
    event_name: "Sunday Cricket Match",
    sport_type: "Cricket",
    description: "Friendly cricket match",
    state: "Maharashtra",
    city: "Mumbai",
    area: "Bandra",
    event_location: "Oval Maidan, Near CST Station",
    date_time: "2025-01-15T10:00:00.000Z",
    max_participants: 22,
    current_participants: 8,
    skill_level: "intermediate",
    equipment_provided: true,
    cost: 0,
    created_by: "user_uid",
    participants: ["user_uid_1", "user_uid_2"],
    status: "open" | "full" | "cancelled" | "completed",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z"
}
```

#### sports_types
```javascript
{
    id: "sport_id",
    name: "Cricket",
    category: "Team Sport",
    min_players: 2,
    max_players: 22,
    equipment_needed: ["Bat", "Ball", "Stumps"],
    icon: "🏏",
    description: "Popular bat-and-ball game"
}
```

### Adding New Collections

#### 1. Create Collection Schema
```javascript
// js/schemas.js
export const eventReviewSchema = {
    id: "review_id",
    event_id: "event_id",
    reviewer_id: "user_uid",
    rating: 5, // 1-5 stars
    comment: "Great event, well organized!",
    created_at: "2025-01-01T00:00:00.000Z"
};
```

#### 2. Create CRUD Operations
```javascript
// js/reviews.js
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function createReview(reviewData) {
    return await addDoc(collection(db, 'event_reviews'), reviewData);
}

export async function getEventReviews(eventId) {
    const q = query(
        collection(db, 'event_reviews'),
        where('event_id', '==', eventId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## 🎯 Feature Development

### Adding New Features

#### 1. Event Chat System
```javascript
// js/chat.js
export class EventChat {
    constructor(eventId) {
        this.eventId = eventId;
        this.messagesRef = collection(db, 'event_chats', eventId, 'messages');
    }
    
    async sendMessage(message, userId) {
        return await addDoc(this.messagesRef, {
            message,
            sender_id: userId,
            timestamp: new Date().toISOString()
        });
    }
    
    subscribeToMessages(callback) {
        return onSnapshot(
            query(this.messagesRef, orderBy('timestamp', 'asc')),
            callback
        );
    }
}

// Usage
const chat = new EventChat('event_123');
chat.subscribeToMessages((snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    updateChatUI(messages);
});
```

#### 2. User Profiles
```javascript
// js/profile.js
export async function updateUserProfile(userId, profileData) {
    await updateDoc(doc(db, 'users', userId), {
        ...profileData,
        updated_at: new Date().toISOString()
    });
}

export async function uploadProfilePicture(userId, file) {
    // Firebase Storage integration
    const storage = getStorage();
    const storageRef = ref(storage, `profile_pictures/${userId}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    await updateUserProfile(userId, { profile_picture: downloadURL });
    return downloadURL;
}
```

#### 3. Push Notifications
```javascript
// js/notifications.js
export async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

export function showNotification(title, options) {
    if (Notification.permission === 'granted') {
        return new Notification(title, {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            ...options
        });
    }
}

// Firebase Cloud Messaging
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export async function initializeFCM() {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
        vapidKey: 'your-vapid-key'
    });
    
    onMessage(messaging, (payload) => {
        showNotification(payload.notification.title, {
            body: payload.notification.body,
            data: payload.data
        });
    });
    
    return token;
}
```

### UI Component Development

#### 1. Reusable Components
```javascript
// js/components.js
export function createEventCard(event) {
    return `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-card-header">
                <h3>${event.event_name}</h3>
                <span class="sport-icon">${getSportIcon(event.sport_type)}</span>
            </div>
            <div class="event-card-body">
                <p class="event-location">📍 ${event.city}, ${event.state}</p>
                <p class="event-date">📅 ${formatDate(event.date_time)}</p>
                <p class="event-participants">👥 ${event.current_participants}/${event.max_participants}</p>
            </div>
            <div class="event-card-actions">
                <button class="btn btn-primary join-event" data-event-id="${event.id}">
                    Join Event
                </button>
            </div>
        </div>
    `;
}

export function createModal(title, content, actions) {
    return `
        <div class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-actions">${actions}</div>
            </div>
        </div>
    `;
}
```

#### 2. Form Validation
```javascript
// js/validation.js
export class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.rules = {};
        this.errors = {};
    }
    
    addRule(fieldName, rule, message) {
        if (!this.rules[fieldName]) {
            this.rules[fieldName] = [];
        }
        this.rules[fieldName].push({ rule, message });
    }
    
    validate() {
        this.errors = {};
        const formData = new FormData(this.form);
        
        for (const [fieldName, rules] of Object.entries(this.rules)) {
            const value = formData.get(fieldName);
            
            for (const { rule, message } of rules) {
                if (!rule(value)) {
                    this.errors[fieldName] = message;
                    break;
                }
            }
        }
        
        this.displayErrors();
        return Object.keys(this.errors).length === 0;
    }
    
    displayErrors() {
        // Clear previous errors
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Display new errors
        for (const [fieldName, message] of Object.entries(this.errors)) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.textContent = message;
                field.parentNode.appendChild(errorElement);
            }
        }
    }
}

// Usage
const validator = new FormValidator(document.getElementById('eventForm'));
validator.addRule('event_name', (value) => value.length >= 3, 'Event name must be at least 3 characters');
validator.addRule('date_time', (value) => new Date(value) > new Date(), 'Event date must be in the future');
```

---

## 🧪 Testing & Debugging

### Testing Strategies

#### 1. Unit Testing
```javascript
// tests/utils.test.js
import { formatDate, getSportIcon } from '../js/utils.js';

describe('Utility Functions', () => {
    test('formatDate should format date correctly', () => {
        const date = '2025-01-15T10:00:00.000Z';
        const formatted = formatDate(date);
        expect(formatted).toBe('15/01/2025, 10:00 AM');
    });
    
    test('getSportIcon should return correct icon', () => {
        expect(getSportIcon('Cricket')).toBe('🏏');
        expect(getSportIcon('Unknown')).toBe('🏃‍♂️');
    });
});
```

#### 2. Integration Testing
```javascript
// tests/firebase.test.js
import { createEvent, getEvents } from '../js/events.js';

describe('Firebase Integration', () => {
    test('should create and retrieve event', async () => {
        const eventData = {
            event_name: 'Test Event',
            sport_type: 'Cricket',
            date_time: '2025-01-15T10:00:00.000Z'
        };
        
        const eventId = await createEvent(eventData);
        expect(eventId).toBeDefined();
        
        const events = await getEvents();
        const createdEvent = events.find(e => e.id === eventId);
        expect(createdEvent.event_name).toBe('Test Event');
    });
});
```

### Debugging Tools

#### 1. Console Logging
```javascript
// js/debug.js
export const DEBUG = {
    enabled: process.env.NODE_ENV === 'development',
    
    log(message, data = {}) {
        if (this.enabled) {
            console.log(`[DEBUG] ${message}`, data);
        }
    },
    
    error(message, error) {
        console.error(`[ERROR] ${message}`, error);
    },
    
    performance(label, fn) {
        if (this.enabled) {
            console.time(label);
            const result = fn();
            console.timeEnd(label);
            return result;
        }
        return fn();
    }
};

// Usage
DEBUG.log('User logged in', { userId: user.uid });
DEBUG.performance('Load events', () => loadEvents());
```

#### 2. Error Tracking
```javascript
// js/error-tracking.js
export class ErrorTracker {
    static init() {
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    }
    
    static handleError(event) {
        this.logError({
            type: 'JavaScript Error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        });
    }
    
    static handlePromiseRejection(event) {
        this.logError({
            type: 'Unhandled Promise Rejection',
            reason: event.reason,
            stack: event.reason?.stack
        });
    }
    
    static logError(errorData) {
        console.error('Error tracked:', errorData);
        
        // Send to error tracking service
        // fetch('/api/errors', {
        //     method: 'POST',
        //     body: JSON.stringify(errorData)
        // });
    }
}

// Initialize
ErrorTracker.init();
```

---

## 🚀 Deployment

### Firebase Hosting

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### 2. Initialize Firebase Hosting
```bash
firebase init hosting

# Select your Firebase project
# Set public directory to 'dist' (or current directory)
# Configure as single-page app: Yes
# Set up automatic builds: No
```

#### 3. Deploy
```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy with custom message
firebase deploy --only hosting -m "Version 2.0 release"
```

### Netlify Deployment

#### 1. Build Settings
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Environment Variables
```bash
# In Netlify dashboard, add environment variables:
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Custom Domain Setup

#### 1. DNS Configuration
```bash
# Add CNAME record
CNAME www your-app.netlify.app

# Add A record for root domain
A @ 104.198.14.52
```

#### 2. SSL Certificate
```bash
# Netlify automatically provides SSL
# Firebase Hosting also provides automatic SSL
```

---

## 🔒 Security

### Authentication Security

#### 1. Password Requirements
```javascript
// js/auth-security.js
export function validatePassword(password) {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    
    return {
        isValid: score >= 3,
        score,
        requirements,
        strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    };
}
```

#### 2. Input Sanitization
```javascript
// js/sanitization.js
export function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .substring(0, 1000); // Limit length
}

export function sanitizeEventData(eventData) {
    return {
        event_name: sanitizeInput(eventData.event_name),
        description: sanitizeInput(eventData.description),
        sport_type: sanitizeInput(eventData.sport_type),
        city: sanitizeInput(eventData.city),
        event_location: sanitizeInput(eventData.event_location)
    };
}
```

#### 3. Rate Limiting
```javascript
// js/rate-limiting.js
export class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    isAllowed(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        
        // Remove old requests
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return true;
    }
}

// Usage
const eventCreationLimiter = new RateLimiter(5, 300000); // 5 events per 5 minutes

export async function createEventWithRateLimit(eventData, userId) {
    if (!eventCreationLimiter.isAllowed(userId)) {
        throw new Error('Rate limit exceeded. Please wait before creating another event.');
    }
    
    return await createEvent(eventData);
}
```

---

## 📈 Performance

### Optimization Techniques

#### 1. Lazy Loading
```javascript
// js/lazy-loading.js
export function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// HTML usage
<img data-src="image.jpg" class="lazy" alt="Description">
```

#### 2. Caching Strategy
```javascript
// js/cache.js
export class CacheManager {
    constructor(ttl = 300000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    clear() {
        this.cache.clear();
    }
}

// Usage
const eventsCache = new CacheManager(300000); // 5 minutes

export async function getCachedEvents() {
    const cached = eventsCache.get('events');
    if (cached) return cached;
    
    const events = await fetchEventsFromFirebase();
    eventsCache.set('events', events);
    return events;
}
```

#### 3. Bundle Optimization
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    utils: ['./js/logging.js', './js/toast.js']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    }
});
```

---

## 🆘 Troubleshooting

### Common Issues

#### 1. Firebase Connection Issues
```javascript
// Problem: Firebase not connecting
// Solution: Check configuration and network

// Debug Firebase connection
import { connectFirestoreEmulator } from 'firebase/firestore';

if (location.hostname === 'localhost') {
    connectFirestoreEmulator(db, 'localhost', 8080);
}

// Test connection
async function testFirebaseConnection() {
    try {
        await getDocs(collection(db, 'sports_types'));
        console.log('✅ Firebase connected successfully');
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
    }
}
```

#### 2. Authentication Issues
```javascript
// Problem: Users can't log in
// Solution: Check auth configuration

// Debug authentication
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ User authenticated:', user.uid);
    } else {
        console.log('❌ User not authenticated');
    }
});

// Check auth errors
try {
    await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
    console.error('Auth error:', error.code, error.message);
    
    switch (error.code) {
        case 'auth/user-not-found':
            // Handle user not found
            break;
        case 'auth/wrong-password':
            // Handle wrong password
            break;
        case 'auth/network-request-failed':
            // Handle network issues
            break;
    }
}
```

#### 3. Performance Issues
```javascript
// Problem: Slow loading times
// Solution: Implement performance monitoring

// Monitor performance
export function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    
    // Log slow operations
    if (end - start > 1000) {
        console.warn(`Slow operation detected: ${name}`);
    }
    
    return result;
}

// Usage
const events = await measurePerformance('Load Events', () => loadEvents());
```

### Debug Mode

#### 1. Enable Debug Mode
```javascript
// js/debug-mode.js
export const DEBUG_MODE = {
    enabled: localStorage.getItem('debug') === 'true',
    
    enable() {
        localStorage.setItem('debug', 'true');
        location.reload();
    },
    
    disable() {
        localStorage.removeItem('debug');
        location.reload();
    },
    
    log(...args) {
        if (this.enabled) {
            console.log('[DEBUG]', ...args);
        }
    }
};

// Enable debug mode in console
// DEBUG_MODE.enable()
```

#### 2. Debug Panel
```javascript
// js/debug-panel.js
export function createDebugPanel() {
    if (!DEBUG_MODE.enabled) return;
    
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; background: black; color: white; padding: 10px; z-index: 9999;">
            <h4>Debug Panel</h4>
            <button onclick="clearCache()">Clear Cache</button>
            <button onclick="exportLogs()">Export Logs</button>
            <button onclick="testFirebase()">Test Firebase</button>
        </div>
    `;
    
    document.body.appendChild(panel);
}
```

---

## 📚 Additional Resources

### Documentation Links
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Useful Tools
- [Firebase Console](https://console.firebase.google.com/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [VS Code Extensions](https://marketplace.visualstudio.com/vscode)

### Community
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [GitHub Discussions](https://github.com/yourusername/sports-buddy/discussions)

---

## 🤝 Contributing Guidelines

### Code Standards
- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Write unit tests for new features
- Ensure accessibility compliance

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit pull request

### Issue Reporting
- Use issue templates
- Provide reproduction steps
- Include browser/device information
- Add relevant logs or screenshots

---

**Happy Coding! 🚀**

*For questions or support, reach out to the development team or create an issue on GitHub.*