// Comprehensive Global Cities & Timezone Database
const CITIES_DB = [
    { name: "New York", country: "USA", zone: "America/New_York", tag: "EST" },
    { name: "London", country: "UK", zone: "Europe/London", tag: "GMT" },
    { name: "San Francisco", country: "USA", zone: "America/Los_Angeles", tag: "PST" },
    { name: "Tokyo", country: "Japan", zone: "Asia/Tokyo", tag: "JST" },
    { name: "China", country: "China", zone: "Asia/Shanghai", tag: "CST" },
    { name: "Shanghai", country: "China", zone: "Asia/Shanghai", tag: "CST" },
    { name: "Beijing", country: "China", zone: "Asia/Shanghai", tag: "CST" },
    { name: "India", country: "India", zone: "Asia/Kolkata", tag: "IST" },
    { name: "New Delhi", country: "India", zone: "Asia/Kolkata", tag: "IST" },
    { name: "Mumbai", country: "India", zone: "Asia/Kolkata", tag: "IST" },
    { name: "Bengaluru", country: "India", zone: "Asia/Kolkata", tag: "IST" },
    { name: "Berlin", country: "Germany", zone: "Europe/Berlin", tag: "CET" },
    { name: "Sydney", country: "Australia", zone: "Australia/Sydney", tag: "AEST" },
    { name: "Toronto", country: "Canada", zone: "America/Toronto", tag: "EST" },
    { name: "Dubai", country: "UAE", zone: "Asia/Dubai", tag: "GST" }
];

let selectedCities = ["New York", "London", "San Francisco", "Tokyo", "India"];
let selectedDate = new Date();
let selectedHourIndex = 0;
let is24HourFormat = false;
let deferredPrompt;

document.addEventListener("DOMContentLoaded", () => {
    loadStateFromUrl();
    initDatePicker();
    initRouter();
    renderGrid();
    setupEventListeners();
    initPWA();
    
    setInterval(updateLiveClocks, 1000);
});

// Load state if opened via shared link
function loadStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const citiesParam = params.get('cities');
    const dateParam = params.get('date');
    const hourParam = params.get('hour');

    if (citiesParam) {
        selectedCities = citiesParam.split(',').map(c => c.trim());
    }
    if (dateParam) {
        const parts = dateParam.split('-');
        if (parts.length === 3) {
            selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        }
    }
    if (hourParam !== null) {
        selectedHourIndex = parseInt(hourParam, 10) || 0;
    }
}

function initDatePicker() {
    const dateInput = document.getElementById("meeting-date");
    const todayStr = selectedDate.toISOString().split('T')[0];
    dateInput.value = todayStr;

    dateInput.addEventListener("change", (e) => {
        if (e.target.value) {
            const parts = e.target.value.split('-');
            selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
            renderGrid();
        }
    });
}

function initRouter() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    
    if (path.length > 0 && path !== "index.html" && !window.location.search.includes('cities')) {
        const parts = path.split("-to-");
        if (parts.length === 2) {
            const source = parts[0].replace(/-/g, " ");
            const target = parts[1].replace(/-/g, " ");
            
            document.getElementById("dynamic-h1").innerText = `${source.toUpperCase()} to ${target.toUpperCase()} Time Zone Converter`;
            document.getElementById("page-title").innerText = `${source.toUpperCase()} to ${target.toUpperCase()} Time Zone Converter - Global Time and Date`;
            document.getElementById("page-desc").content = `Convert time accurately between ${source} and ${target}. View dynamic hour grid and business meeting planner.`;
            
            const foundSource = findCityData(source);
            const foundTarget = findCityData(target);
            
            if (foundSource && foundTarget) {
                selectedCities = [foundSource.name, foundTarget.name];
            }

            const seoBlock = document.getElementById("pseo-info-block");
            const seoTitle = document.getElementById("pseo-title");
            const seoContent = document.getElementById("pseo-content");
            
            seoBlock.classList.remove("hidden");
            seoTitle.innerText = `Converting Time from ${source.toUpperCase()} to ${target.toUpperCase()}`;
            seoContent.innerHTML = `<p>When planning meetings or calls between <strong>${source.toUpperCase()}</strong> and <strong>${target.toUpperCase()}</strong>, managing time differences is essential. Use the visual grid above to select hours and find overlapping work slots instantly.</p>`;
        }
    }
}

function findCityData(query) {
    const cleanQuery = query.trim().toLowerCase();
    return CITIES_DB.find(c => 
        c.name.toLowerCase() === cleanQuery || 
        c.tag.toLowerCase() === cleanQuery || 
        c.country.toLowerCase() === cleanQuery
    );
}

function updateLiveClocks() {
    const now = new Date();
    selectedCities.forEach((cityName) => {
        const cityData = findCityData(cityName) || { name: cityName, zone: "UTC", tag: "UTC" };
        const clockEl = document.getElementById(`clock-${cityName.replace(/\s+/g, '')}`);
        
        if (clockEl) {
            const cityTimeStr = new Intl.DateTimeFormat('en-US', {
                timeZone: cityData.zone,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour12: !is24HourFormat
            }).format(now);
            clockEl.innerText = cityTimeStr;
        }
    });
}

function convertTimeZone(dateStr, fromZone, toZone) {
    const dummyDate = new Date(dateStr);
    const utcDate = new Date(dummyDate.toLocaleString('en-US', { timeZone: "UTC" }));
    const tzDateFrom = new Date(dummyDate.toLocaleString('en-US', { timeZone: fromZone }));
    const tzDateTo = new Date(dummyDate.toLocaleString('en-US', { timeZone: toZone }));
    
    const diffToFrom = tzDateFrom - utcDate;
    const diffToTarget = tzDateTo - utcDate;
    
    return new Date(dummyDate.getTime() - diffToFrom + diffToTarget);
}

function renderGrid() {
    const gridContainer = document.getElementById("timezone-grid");
    gridContainer.innerHTML = "";

    if (selectedCities.length === 0) {
        gridContainer.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">No cities selected. Type city names in search above to compare.</div>`;
        return;
    }

    const baseCityData = findCityData(selectedCities[0]) || { name: selectedCities[0], zone: "UTC", tag: "UTC" };

    selectedCities.forEach((cityName, index) => {
        const cityData = findCityData(cityName) || { name: cityName, zone: "UTC", tag: "UTC" };
        
        const row = document.createElement("div");
        row.className = "city-row";

        const now = new Date();
        const cityTimeStr = new Intl.DateTimeFormat('en-US', {
            timeZone: cityData.zone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour12: !is24HourFormat
        }).format(now);

        const cityInfo = document.createElement("div");
        cityInfo.className = "city-info";
        cityInfo.innerHTML = `
            <div class="city-name">${cityData.name} <span style="font-size:0.75rem; color:var(--accent-color);">(${cityData.tag})</span></div>
            <div class="city-time-desc" id="clock-${cityName.replace(/\s+/g, '')}">${cityTimeStr}</div>
        `;

        const tilesContainer = document.createElement("div");
        tilesContainer.className = "time-tiles";

        for (let i = 0; i < 24; i++) {
            const tile = document.createElement("div");
            tile.className = "time-tile";
            
            const y = selectedDate.getFullYear();
            const m = selectedDate.getMonth();
            const d = selectedDate.getDate();
            
            const baseString = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(i).padStart(2, '0')}:00:00`;
            const targetDate = convertTimeZone(baseString, baseCityData.zone, cityData.zone);
            
            const localH = targetDate.getHours();
            const dayShort = new Intl.DateTimeFormat('en-US', {
                timeZone: cityData.zone,
                weekday: 'short',
                day: 'numeric'
            }).format(targetDate);

            if (localH >= 9 && localH <= 17) {
                tile.classList.add("work-hour");
            }

            if (i === selectedHourIndex) {
                tile.classList.add("selected");
            }

            let dateBadgeHTML = "";
            if (localH === 0) {
                dateBadgeHTML = `<span class="date-badge">${dayShort}</span>`;
            }

            if (!is24HourFormat) {
                const displayHour = localH % 12 || 12;
                const ampm = localH >= 12 ? 'PM' : 'AM';
                tile.innerHTML = `${dateBadgeHTML}${displayHour}<span class="ampm">${ampm}</span>`;
            } else {
                const displayHour = localH < 10 ? '0' + localH : localH;
                tile.innerHTML = `${dateBadgeHTML}${displayHour}`;
            }
            
            tile.addEventListener("click", () => {
                selectedHourIndex = i;
                renderGrid();
            });

            tilesContainer.appendChild(tile);
        }

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "row-actions";

        if (index > 0) {
            const upBtn = document.createElement("button");
            upBtn.type = "button";
            upBtn.className = "move-btn";
            upBtn.innerHTML = "▲";
            upBtn.title = "Move Up";
            upBtn.addEventListener("click", () => {
                const temp = selectedCities[index];
                selectedCities[index] = selectedCities[index - 1];
                selectedCities[index - 1] = temp;
                renderGrid();
            });
            actionsDiv.appendChild(upBtn);
        }

        if (index < selectedCities.length - 1) {
            const downBtn = document.createElement("button");
            downBtn.type = "button";
            downBtn.className = "move-btn";
            downBtn.innerHTML = "▼";
            downBtn.title = "Move Down";
            downBtn.addEventListener("click", () => {
                const temp = selectedCities[index];
                selectedCities[index] = selectedCities[index + 1];
                selectedCities[index + 1] = temp;
                renderGrid();
            });
            actionsDiv.appendChild(downBtn);
        }

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-btn";
        removeBtn.innerHTML = "×";
        removeBtn.title = "Remove City";
        removeBtn.addEventListener("click", () => {
            selectedCities = selectedCities.filter(c => c !== cityName);
            renderGrid();
        });
        actionsDiv.appendChild(removeBtn);

        row.appendChild(cityInfo);
        row.appendChild(tilesContainer);
        row.appendChild(actionsDiv);

        gridContainer.appendChild(row);
    });
}

function setupEventListeners() {
    document.getElementById("add-top-btn").addEventListener("click", () => {
        addCityToGrid('top');
    });

    document.getElementById("add-bottom-btn").addEventListener("click", () => {
        addCityToGrid('bottom');
    });

    document.getElementById("compare-btn").addEventListener("click", () => {
        const input = document.getElementById("city-input");
        const val = input.value.trim();
        if (val) {
            const rawCities = val.split(/,|\bto\b/i);
            const matchedList = [];

            rawCities.forEach(raw => {
                const found = findCityData(raw);
                if (found && !matchedList.includes(found.name)) {
                    matchedList.push(found.name);
                } else if (raw.trim()) {
                    matchedList.push(raw.trim());
                }
            });

            if (matchedList.length > 0) {
                selectedCities = matchedList;
                input.value = "";
                renderGrid();
            }
        }
    });

    document.getElementById("add-btn").addEventListener("click", () => {
        addCityToGrid('bottom');
    });

    document.getElementById("city-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("compare-btn").click();
        }
    });

    document.getElementById("toggle-format").addEventListener("click", () => {
        is24HourFormat = !is24HourFormat;
        renderGrid();
    });

    // Share View Link Functionality
    document.getElementById("share-btn").addEventListener("click", () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const citiesParam = encodeURIComponent(selectedCities.join(','));
        const shareUrl = `${window.location.origin}${window.location.pathname}?cities=${citiesParam}&date=${dateStr}&hour=${selectedHourIndex}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            alert("🔗 Meeting view link copied to clipboard! Aap ise WhatsApp ya email par kisi ke sath bhi share kar sakte hain.");
        }).catch(() => {
            prompt("Copy this meeting link:", shareUrl);
        });
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
        selectedCities = ["New York", "London", "San Francisco", "Tokyo", "India"];
        selectedDate = new Date();
        selectedHourIndex = 0;
        document.getElementById("meeting-date").value = selectedDate.toISOString().split('T')[0];
        window.history.replaceState({}, document.title, window.location.pathname);
        renderGrid();
    });
}

function addCityToGrid(position) {
    const input = document.getElementById("city-input");
    const val = input.value.trim();
    if (val) {
        const matchedCity = findCityData(val);
        const cityNameToAdd = matchedCity ? matchedCity.name : (val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
        
        if (!selectedCities.includes(cityNameToAdd)) {
            if (position === 'top') {
                selectedCities.unshift(cityNameToAdd);
            } else {
                selectedCities.push(cityNameToAdd);
            }
            input.value = "";
            renderGrid();
        }
    }
}

function initPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW Registration failed', err));
    }

    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'inline-block';
    });

    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('App Installed Successfully');
                }
                deferredPrompt = null;
            });
        } else {
            alert("App install prompt local file (file://) par direct trigger nahi hota. Jab website Vercel par live (HTTPS) ho jayegi, tab ye button ekdam perfectly kaam karega!");
        }
    });
}
// pSEO City-to-City Dynamic Time Converter
function updateConversions() {
    const path = window.location.pathname;
    const resultEl = document.getElementById('conversion-result');
    if (!resultEl) return;

    const now = new Date();

    if (path.includes('ist-to-pst.html')) {
        const istTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }).format(now);
        const pstTime = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'medium' }).format(now);
        resultEl.innerHTML = `<strong>Current IST:</strong> ${istTime}<br><br><strong>Converted PST:</strong> ${pstTime}`;
    } 
    else if (path.includes('gmt-to-ist.html')) {
        const gmtTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Etc/GMT', dateStyle: 'medium', timeStyle: 'medium' }).format(now);
        const istTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }).format(now);
        resultEl.innerHTML = `<strong>Current GMT:</strong> ${gmtTime}<br><br><strong>Converted IST:</strong> ${istTime}`;
    } 
    else if (path.includes('london-to-tokyo.html')) {
        const londonTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/London', dateStyle: 'medium', timeStyle: 'medium' }).format(now);
        const tokyoTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'medium' }).format(now);
        resultEl.innerHTML = `<strong>Current London Time:</strong> ${londonTime}<br><br><strong>Converted Tokyo Time:</strong> ${tokyoTime}`;
    }
}

// Run immediately and update every second
if (document.getElementById('conversion-result')) {
    updateConversions();
    setInterval(updateConversions, 1000);
}
