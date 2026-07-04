let mechanicsData = [];

async function loadMechanics() {
    try {
        const res = await fetch('/api/providers');
        mechanicsData = await res.json();
        renderMechanics(mechanicsData);
    } catch (err) {
        console.error("Failed to load mechanics database.", err);
    }
}

function renderMechanics(list, assignedId = null) {
    const container = document.getElementById('mechanicsContainer');
    container.innerHTML = '';
    
    list.forEach(mech => {
        const isAssigned = mech.id === assignedId;
        const card = document.createElement('div');
        card.className = `mechanic-card ${isAssigned ? 'selected' : ''}`;
        card.innerHTML = `
            <img src="${mech.photo}" alt="${mech.name}">
            <h3>${mech.name}</h3>
            <p><strong>Specialty:</strong> ${mech.specialty}</p>
            <p><strong>Vehicle:</strong> ${mech.vehicle}</p>
            <p style="color: #ff9f43; font-weight:bold;">${mech.baseCharge} Base Fee</p>
            <p style="font-size:0.85rem; color:#a4b0be;">📍 ${mech.location} (${mech.distanceKM} km away)</p>
            ${isAssigned ? '<span style="color:#2ed573; font-weight:bold; block mt-2">● ALLOTTED & ARRIVING NOW</span>' : ''}
        `;
        container.appendChild(card);
    });
}

document.getElementById('vehicleFilter').addEventListener('change', (e) => {
    const selected = e.target.value;
    const filtered = selected === 'All' ? mechanicsData : mechanicsData.filter(m => m.vehicle === selected);
    renderMechanics(filtered);
});

document.getElementById('sosBtn').addEventListener('click', async () => {
    const userPhone = prompt("Enter your 10-digit mobile phone number:");
    if (!userPhone || userPhone.trim().length < 10) {
        alert("Mobile contact tracking number is required for confirming details!");
        return;
    }

    const container = document.getElementById('sosContainer');
    
    // Request location access
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                executeSOS(userPhone, pos.coords.latitude, pos.coords.longitude, container);
            },
            (err) => {
                // Fallback coordinates if location access is blocked
                executeSOS(userPhone, 17.4065, 78.4772, container);
            }
        );
    } else {
        executeSOS(userPhone, 17.4065, 78.4772, container);
    }
});

function executeSOS(phone, lat, lng, container) {
    container.classList.add('strobe-active');

    setTimeout(async () => {
        container.classList.remove('strobe-active');
        
        const targetVehicle = document.getElementById('vehicleFilter').value;
        const pool = targetVehicle === 'All' ? mechanicsData : mechanicsData.filter(m => m.vehicle === targetVehicle);
        const mechanic = pool.length > 0 ? pool[0] : mechanicsData[0];

        // 1. UPDATE DYNAMIC POPUP ELEMENTS
        document.getElementById('modalLocationText').innerHTML = `📍 Coordinates Locked:<br>Lat: ${lat.toFixed(4)} | Lng: ${lng.toFixed(4)}`;
        document.getElementById('modalMechanicText').innerHTML = `Your allotted mechanic <strong>${mechanic.name}</strong> is arriving now.<br>📞 Phone: ${mechanic.phone}<br>Base Fee: ${mechanic.baseCharge}`;
        
        // Open Modal
        document.getElementById('sosModalOverlay').classList.add('active');
        
        // Highlight allotted card
        renderMechanics(mechanicsData, mechanic.id);

        // 2. DISPATCH DEDICATED CONFIRMATION RECEIPT TEXT DATA
        const msg = `Mobile Garage SOS Verified! Receipt: Allotted Mechanic ${mechanic.name} is coming to your coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}). Phone: ${mechanic.phone}. Charge: ${mechanic.baseCharge}. Stay safe!`;
        
        try {
            await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone, message: msg })
            });
        } catch (e) { console.error(e); }

    }, 2000);
}

document.getElementById('closeSosModal').addEventListener('click', () => {
    document.getElementById('sosModalOverlay').classList.remove('active');
});

loadMechanics();