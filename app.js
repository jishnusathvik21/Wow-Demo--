document.addEventListener('DOMContentLoaded', () => {
    const sosBtn = document.getElementById('sosBtn');
    const locationCard = document.getElementById('locationCard');
    const coordsText = document.getElementById('coordsText');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const mechanicsList = document.getElementById('mechanicsList');

    // Initial load of all mechanics
    fetchMechanics('All');

    // Filter Change Event Handler
    specialtyFilter.addEventListener('change', (e) => {
        fetchMechanics(e.target.value);
    });

    // SOS Geolocation Dispatcher
    sosBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        sosBtn.classList.add('animate-pulse');
        locationCard.classList.remove('hidden');
        coordsText.textContent = "Fetching precise satellite telemetry...";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(5);
                const lng = position.coords.longitude.toFixed(5);
                coordsText.innerHTML = `Latitude: <span class="text-white font-bold">${lat}</span> <br> Longitude: <span class="text-white font-bold">${lng}</span> <br><span class="text-emerald-400 text-xs font-semibold">📍 Alert broadcasted to nearest garages!</span>`;
                sosBtn.classList.remove('animate-pulse');
            },
            (error) => {
                coordsText.innerHTML = `Ghat Route Configured: <span class="text-amber-400 font-bold">Western Ghats Bypass Zone</span>`;
                sosBtn.classList.remove('animate-pulse');
            }
        );
    });

    // Async Fetch function calling Node.js backend
    async function fetchMechanics(filterType) {
        mechanicsList.innerHTML = `<p class="text-slate-400 text-sm col-span-2 text-center py-8">Scanning for active mechanics along the grid...</p>`;
        
        try {
            const response = await fetch(`/api/mechanics?specialty=${filterType}`);
            const mechanics = await response.json();

            mechanicsList.innerHTML = ''; 

            if (mechanics.length === 0) {
                mechanicsList.innerHTML = `<p class="text-slate-500 text-sm col-span-2 text-center py-8">No mechanics found for this specific category along this stretch.</p>`;
                return;
            }

            mechanics.forEach(mechanic => {
                const card = document.createElement('div');
                card.className = "bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all flex flex-col justify-between";
                
                card.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="text-lg font-bold text-slate-100">${mechanic.name}</h4>
                            <span class="text-xs bg-slate-700 text-amber-400 px-2 py-0.5 rounded font-mono">${mechanic.distanceKM} KM away</span>
                        </div>
                        <p class="text-sm text-amber-500 font-medium mb-3">🔧 ${mechanic.specialty}</p>
                        <p class="text-xs text-slate-400 mb-1">📍 Location: ${mechanic.location}</p>
                        <p class="text-xs text-slate-400">💰 Est Base Fee: <span class="text-emerald-400 font-semibold">${mechanic.baseCharge}</span> (${mechanic.priceRating})</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                        <a href="tel:${mechanic.phone}" class="w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm tracking-wide transition-colors">
                            📞 Contact Mechanic
                        </a>
                    </div>
                `;
                mechanicsList.appendChild(card);
            });

        } catch (error) {
            mechanicsList.innerHTML = `<p class="text-red-400 text-sm col-span-2 text-center py-8">Error establishing connection with backend server.</p>`;
        }
    }
});