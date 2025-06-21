/**
 * India-specific location data and utilities
 * Contains states, cities, and location management functions
 */

/**
 * Indian States and Union Territories
 */
export const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
];

/**
 * Cities/Districts by State
 */
export const citiesByState = {
    'Andhra Pradesh': [
        'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Vizianagaram'
    ],
    'Arunachal Pradesh': [
        'Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Bomdila', 'Ziro', 'Along', 'Tezu', 'Changlang', 'Khonsa'
    ],
    'Assam': [
        'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Sivasagar'
    ],
    'Bihar': [
        'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'
    ],
    'Chhattisgarh': [
        'Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Mahasamund'
    ],
    'Goa': [
        'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Cuncolim', 'Quepem'
    ],
    'Gujarat': [
        'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari'
    ],
    'Haryana': [
        'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'
    ],
    'Himachal Pradesh': [
        'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Paonta Sahib', 'Sundernagar', 'Chamba'
    ],
    'Jharkhand': [
        'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar'
    ],
    'Karnataka': [
        'Bangalore', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga'
    ],
    'Kerala': [
        'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod'
    ],
    'Madhya Pradesh': [
        'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'
    ],
    'Maharashtra': [
        'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli'
    ],
    'Manipur': [
        'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Ukhrul', 'Chandel', 'Tamenglong', 'Jiribam', 'Kangpokpi'
    ],
    'Meghalaya': [
        'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara', 'Ampati', 'Resubelpara', 'Mawkyrwat', 'Nongstoin', 'Williamnagar'
    ],
    'Mizoram': [
        'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit', 'Lawngtlai', 'Bairabi', 'Zawlnuam'
    ],
    'Nagaland': [
        'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Kiphire', 'Longleng', 'Peren'
    ],
    'Odisha': [
        'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'
    ],
    'Punjab': [
        'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Batala', 'Pathankot', 'Moga'
    ],
    'Rajasthan': [
        'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'
    ],
    'Sikkim': [
        'Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Jorethang', 'Nayabazar', 'Rangpo', 'Singtam', 'Pakyong', 'Ravangla'
    ],
    'Tamil Nadu': [
        'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukkudi'
    ],
    'Telangana': [
        'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'
    ],
    'Tripura': [
        'Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai', 'Ambassa', 'Ranir Bazar', 'Sonamura', 'Kumarghat'
    ],
    'Uttar Pradesh': [
        'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad'
    ],
    'Uttarakhand': [
        'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani-cum-Kathgodam', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh', 'Jaspur', 'Manglaur'
    ],
    'West Bengal': [
        'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Baharampur', 'Habra', 'Kharagpur'
    ],
    'Andaman and Nicobar Islands': [
        'Port Blair', 'Bamboo Flat', 'Garacharma', 'Diglipur', 'Rangat', 'Mayabunder', 'Campbell Bay', 'Car Nicobar', 'Hut Bay', 'Nancowry'
    ],
    'Chandigarh': [
        'Chandigarh'
    ],
    'Dadra and Nagar Haveli and Daman and Diu': [
        'Daman', 'Diu', 'Silvassa', 'Vapi', 'Dadra', 'Nagar Haveli'
    ],
    'Delhi': [
        'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'Shahdara'
    ],
    'Jammu and Kashmir': [
        'Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore', 'KathuaUdhampur', 'Punch', 'Rajauri', 'Kupwara'
    ],
    'Ladakh': [
        'Leh', 'Kargil', 'Nubra', 'Zanskar', 'Drass', 'Khaltse', 'Nyoma', 'Durbuk', 'Khalatse', 'Sankoo'
    ],
    'Lakshadweep': [
        'Kavaratti', 'Agatti', 'Minicoy', 'Amini', 'Andrott', 'Kalpeni', 'Kadmat', 'Kiltan', 'Chetlat', 'Bitra'
    ],
    'Puducherry': [
        'Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Villianur', 'Ariyankuppam', 'Mannadipet', 'Bahour', 'Nettapakkam', 'Kirumampakkam'
    ]
};

/**
 * Get cities for a specific state
 * @param {string} state - State name
 * @returns {Array} - Array of cities
 */
export function getCitiesForState(state) {
    return citiesByState[state] || [];
}

/**
 * Check if a state exists
 * @param {string} state - State name
 * @returns {boolean} - Whether state exists
 */
export function isValidState(state) {
    return indianStates.includes(state);
}

/**
 * Search cities across all states
 * @param {string} searchTerm - Search term
 * @returns {Array} - Array of matching cities with state info
 */
export function searchCities(searchTerm) {
    const results = [];
    const term = searchTerm.toLowerCase();
    
    for (const [state, cities] of Object.entries(citiesByState)) {
        cities.forEach(city => {
            if (city.toLowerCase().includes(term)) {
                results.push({ city, state });
            }
        });
    }
    
    return results;
}