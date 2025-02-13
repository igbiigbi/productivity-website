document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements - Timer Controls
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    const decreaseButton30 = document.getElementById('decrease30');
    const decreaseButton60 = document.getElementById('decrease60');
    const decreaseButton300 = document.getElementById('decrease300');
    const increaseButton30 = document.getElementById('increase30');
    const increaseButton60 = document.getElementById('increase60');
    const increaseButton300 = document.getElementById('increase300');
    const timerDisplay = document.getElementById('time');
    const hiddenInput = document.getElementById('hiddenInput');
    const categoryDropdown = document.getElementById('categoryDropdown');

    // DOM Elements - Settings & UI
    const endSound = document.getElementById('endSound');
    const menuButton = document.getElementById('menuButton');
    const sideMenu = document.querySelector('.side-menu');
    const themeToggleButton = document.querySelector('.theme-toggle-button');
    const overlay = document.querySelector('.overlay');
    const optionsWindows = document.querySelectorAll('.options-window');
    const menuButtons = document.querySelectorAll('.menu-section-button');
    const closeButtons = document.querySelectorAll('.close-options');
    const optionItems = document.querySelectorAll('.option-item');
    const testSound = document.getElementById('testSound');
    const volumeValue = document.querySelector('.volume-value');
    const totalSessionsDisplay = document.getElementById('totalSessions');
    const totalTimeDisplay = document.getElementById('totalTime');
    const dailyStreakDisplay = document.getElementById('dailyStreak');
    const mostUsedDisplay = document.getElementById('mostUsed');
    const categoryStatsDisplay = document.getElementById('categoryStats');
    const resetStatsButton = document.getElementById('resetStats');

    // DOM Elements - Settings Controls
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const volumeControl = document.getElementById('volumeControl');
    const soundSelect = document.getElementById('soundSelect');

    // Settings & Statistics
    let settings = {
        sound: true,
        volume: 50,
        soundType: 'bell',
        defaultTime: 25
    };

    // Load saved settings and statistics
    const savedSettings = localStorage.getItem('timerSettings');
    if (savedSettings) {
        settings = {...settings, ...JSON.parse(savedSettings)};
    }

    let statistics = {
        totalSessions: 0,
        totalTime: 0,
        categories: {},
        dailyStreak: 0,
        lastActive: new Date().toISOString().split('T')[0]
    };

    const savedStats = localStorage.getItem('timerStatistics');
    if (savedStats) {
        statistics = JSON.parse(savedStats);
    }

    console.log('Loaded settings:', settings);
    console.log('Loaded statistics:', statistics);

    // Theme handling
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);

    // Initialize UI
    updateSettingsUI();
    updateStatisticsDisplay();

    initializeMenuControls();


    // Timer Variables
    let countdown;
    let totalTime = 0;
    let isRunning = false;
    let isPaused = false;
    let timeRemaining = 0;
    let sessionCount = 0;
    let progressRing = null;
    let progressCircle = null;
    const radius = 120;
    const circumference = radius * 2 * Math.PI;

    // Category Colors
    const categoryColors = {
        'Sport': { 
            bg: 'rgba(21, 190, 173, 0.1)', 
            border: '#0e8a7f', 
            text: '#0e8a7f' 
        },
        'Education': { 
            bg: 'rgba(121, 85, 72, 0.1)', 
            border: '#5D4037', 
            text: '#5D4037' 
        },
        'Family': { 
            bg: 'rgba(103, 58, 183, 0.1)', 
            border: '#512DA8', 
            text: '#512DA8' 
        },
        'Gaming': { 
            bg: 'rgba(233, 30, 99, 0.1)', 
            border: '#C2185B', 
            text: '#C2185B' 
        },
        'Work': { 
            bg: 'rgba(76, 175, 80, 0.1)', 
            border: '#388E3C', 
            text: '#388E3C' 
        },
        'Creativity': { 
            bg: 'rgba(33, 150, 243, 0.1)', 
            border: '#1976D2', 
            text: '#1976D2' 
        },
        'Finance': { 
            bg: 'rgba(204, 25, 210, 0.1)', 
            border: '#cc19d2', 
            text: '#cc19d2' 
        },
        'Health': { 
            bg: 'rgba(207, 160, 30, 0.1)', 
            border: '#cfa01e', 
            text: '#cfa01e' 
        }
    };





    // Progress Ring Functions
    function createProgressRing() {
        if (!progressRing) {
            progressRing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            progressRing.setAttribute('class', 'progress-ring');
            progressRing.setAttribute('viewBox', '0 0 250 250');

            progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            progressCircle.setAttribute('class', 'progress-ring__circle');
            progressCircle.setAttribute('r', radius);
            progressCircle.setAttribute('cx', '125');
            progressCircle.setAttribute('cy', '125');
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            
            progressRing.appendChild(progressCircle);
            document.querySelector('.timer').insertBefore(progressRing, timerDisplay);
            
            progressRing.offsetHeight;
            progressRing.classList.add('visible');
        }
        setProgress((timeRemaining / totalTime) * 100);
    }

    function removeProgressRing() {
        if (progressRing) {
            progressRing.classList.remove('visible');
            setTimeout(() => {
                if (progressRing && progressRing.parentNode) {
                    progressRing.remove();
                    progressRing = null;
                    progressCircle = null;
                }
            }, 400);
        }
    }

    function setProgress(percent) {
        if (progressCircle) {
            const offset = circumference - (percent / 100 * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    // Timer Functions
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (timeRemaining > 0) {
            createProgressRing();
        } else {
            removeProgressRing();
        }
    }

    function startTimer() {
        let hasError = false;

        if (!timeRemaining) {
            hasError = true;
            hiddenInput.classList.add('shake-red');
            document.querySelectorAll('.time-controls-left button, .time-controls-right button').forEach(button => {
                button.classList.add('shake-red');
            });
            setTimeout(() => {
                hiddenInput.classList.remove('shake-red');
                document.querySelectorAll('.time-controls-left button, .time-controls-right button').forEach(button => {
                    button.classList.remove('shake-red');
                });
            }, 500);
        }

        if (!categoryDropdown.value || categoryDropdown.value === "Select category") {
            hasError = true;
            categoryDropdown.classList.add('shake-red');
            setTimeout(() => categoryDropdown.classList.remove('shake-red'), 500);
        }

        if (hasError) return;

        clearInterval(countdown);
        isRunning = true;
        isPaused = false;
        startButton.textContent = 'Pause';
        categoryDropdown.disabled = true;
        
        countdown = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                clearInterval(countdown);
                isRunning = false;
                startButton.textContent = 'Start';
                categoryDropdown.disabled = false;
                
                // Updated sound handling
                if (settings.sound && endSound) {
                    try {
                        endSound.src = `sounds/${settings.soundType}.mp3`; // Ensure correct sound is loaded
                        endSound.currentTime = 0;
                        endSound.volume = settings.volume / 100;
                        const playPromise = endSound.play();
                        
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.error('Sound play failed:', error);
                                // Fallback to bell sound if other sound fails
                                endSound.src = 'sounds/bell.mp3';
                                endSound.play().catch(e => console.error('Fallback sound failed:', e));
                            });
                        }
                    } catch (error) {
                        console.error('Sound error:', error);
                    }
                }
                
                updateStatistics();
                removeProgressRing();
            }
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(countdown);
        isRunning = false;
        isPaused = true;
        startButton.textContent = 'Start';
        categoryDropdown.disabled = false;
    }

    function resetTimer() {
        clearInterval(countdown);
        isRunning = false;
        isPaused = false;
        timeRemaining = 0;
        totalTime = 0;
        startButton.textContent = 'Start';
        timerDisplay.textContent = '00:00';
        categoryDropdown.disabled = false;
        categoryDropdown.value = '';
        removeProgressRing();
        
        categoryDropdown.style.setProperty('background-color', 'rgba(255, 255, 255, 0.9)', 'important');
        categoryDropdown.style.setProperty('border-color', '#004d40', 'important');
        categoryDropdown.style.setProperty('color', '#004d40', 'important');
    }

    function decreaseTime(seconds) {
        if (!isRunning || isPaused) {
            if (timeRemaining === 0) {
                document.querySelectorAll('.time-controls-left button').forEach(button => {
                    button.classList.add('shake-red');
                    setTimeout(() => button.classList.remove('shake-red'), 500);
                });
                return;
            }
            timeRemaining = Math.max(0, timeRemaining - seconds);
            totalTime = timeRemaining;
            updateTimerDisplay();
        }
    }

    function increaseTime(seconds) {
        if (!isRunning || isPaused) {
            timeRemaining += seconds;
            totalTime = timeRemaining;
            updateTimerDisplay();
        }
    }

    if (endSound) {
        endSound.load(); // Preload the sound
        endSound.volume = settings.volume / 100;
    }

    // UI Update Functions
    function updateThemeButton(theme) {
        const icon = themeToggleButton.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggleButton.textContent = theme === 'dark' ? 'Toggle Light Mode ' : 'Toggle Dark Mode ';
        themeToggleButton.appendChild(icon);
    }

    function updateSettingsUI() {
        if (soundToggleBtn) {
            soundToggleBtn.classList.toggle('enabled', settings.sound);
            soundToggleBtn.querySelector('.toggle-status').textContent = 
                `Sound: ${settings.sound ? 'ON' : 'OFF'}`;
        }
        if (volumeControl) volumeControl.value = settings.volume;
        if (soundSelect) soundSelect.value = settings.soundType;
        if (endSound) endSound.volume = settings.volume / 100;
        volumeValue.textContent = `${settings.volume}%`;
    }

    function updateStatisticsDisplay() {
        totalSessionsDisplay.textContent = statistics.totalSessions;
        
        const hours = Math.floor(statistics.totalTime / 60);
        const minutes = Math.round(statistics.totalTime % 60);
        totalTimeDisplay.textContent = `${hours}h ${minutes}m`;
        
        dailyStreakDisplay.textContent = statistics.dailyStreak;
        
        // Find most used category
        let mostUsedCategory = '-';
        let maxSessions = 0;
        
        for (const [category, stats] of Object.entries(statistics.categories)) {
            if (stats.sessions > maxSessions) {
                maxSessions = stats.sessions;
                mostUsedCategory = category;
            }
        }
        
        mostUsedDisplay.textContent = mostUsedCategory;
        
        // Update category breakdown
        categoryStatsDisplay.innerHTML = '';
        
        Object.entries(statistics.categories).forEach(([category, stats]) => {
            const hours = Math.floor(stats.totalTime / 60);
            const minutes = Math.round(stats.totalTime % 60);
            
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category-stat');
            categoryDiv.innerHTML = `
                <span class="category-name">${category}</span>
                <span class="category-details">
                    ${stats.sessions} sessions (${hours}h ${minutes}m)
                </span>
            `;
            categoryStatsDisplay.appendChild(categoryDiv);
        });
    }

    function updateStatistics() {
        // Update total sessions
        statistics.totalSessions++;
        
        // Update total time
        const sessionTime = totalTime / 60; // Convert seconds to minutes
        statistics.totalTime += sessionTime;
        
        // Update category stats
        const category = categoryDropdown.value;
        if (!statistics.categories[category]) {
            statistics.categories[category] = {
                sessions: 0,
                totalTime: 0
            };
        }
        statistics.categories[category].sessions++;
        statistics.categories[category].totalTime += sessionTime;
        
        // Update streak
        const today = new Date().toISOString().split('T')[0];
        if (statistics.lastActive !== today) {
            if (new Date(statistics.lastActive).getTime() === new Date(today).getTime() - 86400000) {
                statistics.dailyStreak++;
            } else {
                statistics.dailyStreak = 1;
            }
            statistics.lastActive = today;
        }
        
        // Save to localStorage
        localStorage.setItem('timerStatistics', JSON.stringify(statistics));
        
        // Update display
        updateStatisticsDisplay();
    }

    
    // Event Listeners - Settings
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            settings.sound = !settings.sound;
            localStorage.setItem('timerSettings', JSON.stringify(settings));
            updateSettingsUI();
        });
    }

    if (volumeControl) {
        volumeControl.addEventListener('input', () => {
            settings.volume = volumeControl.value;
            localStorage.setItem('timerSettings', JSON.stringify(settings));
            updateSettingsUI();
        });
    }

    if (soundSelect) {
        soundSelect.addEventListener('change', () => {
            settings.soundType = soundSelect.value;
            // Update the endSound source immediately
            if (endSound) {
                endSound.src = `sounds/${settings.soundType}.mp3`;
                // Preload the new sound
                endSound.load();
            }
            localStorage.setItem('timerSettings', JSON.stringify(settings));
        });
    }

    if (testSound) {
        testSound.addEventListener('click', () => {
            if (settings.sound) {
                const testAudio = new Audio(`sounds/${settings.soundType}.mp3`);
                testAudio.volume = settings.volume / 100;
                testAudio.play();
            }
        });
    }

    // Event Listeners - Timer Controls
    startButton.addEventListener('click', () => {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    resetButton.addEventListener('click', resetTimer);

    decreaseButton30.addEventListener('click', () => decreaseTime(30));
    decreaseButton60.addEventListener('click', () => decreaseTime(60));
    decreaseButton300.addEventListener('click', () => decreaseTime(300));
    increaseButton30.addEventListener('click', () => increaseTime(30));
    increaseButton60.addEventListener('click', () => increaseTime(60));
    increaseButton300.addEventListener('click', () => increaseTime(300));

    // Event Listeners - Category and Menu
    categoryDropdown.addEventListener('change', () => {
        if (!isRunning) {
            const colors = categoryColors[categoryDropdown.value];
            if (colors) {
                categoryDropdown.style.setProperty('background-color', colors.bg, 'important');
                categoryDropdown.style.setProperty('border-color', colors.border, 'important');
                categoryDropdown.style.setProperty('color', colors.text, 'important');
            }
        }
    });

    function closeAllWindows() {
        overlay?.classList.remove('active');
        sideMenu?.classList.remove('active');
        menuButton?.classList.remove('active');
        optionsWindows?.forEach(window => window.classList.remove('active'));
    }

    function initializeMenuControls() {
        // Menu button
        menuButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            menuButton.classList.toggle('active');
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        };
    
        // Menu section buttons (Settings and Statistics)
        menuButtons.forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const windowId = button.dataset.window + 'Options';
                const optionsWindow = document.getElementById(windowId);
                console.log('Clicking menu button:', windowId); // Debug log
                if (optionsWindow) {
                    optionsWindows.forEach(window => window.classList.remove('active'));
                    optionsWindow.classList.add('active');
                    overlay.classList.add('active');
                }
            };
        });
    
        // Close buttons
        closeButtons.forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeAllWindows();
            };
        });
    
        // Overlay
        overlay.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAllWindows();
        };
    
        // Side menu click stop propagation
        sideMenu.onclick = (e) => {
            e.stopPropagation();
        };
    
        // Document click for outside clicks
        document.onclick = (e) => {
            if (!sideMenu?.contains(e.target) && 
                !menuButton?.contains(e.target) && 
                !Array.from(optionsWindows || []).some(window => window?.contains(e.target)) && 
                sideMenu?.classList.contains('active')) {
                closeAllWindows();
            }
        };
    }
    
    
    // Event Listeners - Statistics
    resetStatsButton.addEventListener('click', () => {
        statistics = {
            totalSessions: 0,
            totalTime: 0,
            categories: {},
            lastSession: null,
            dailyStreak: 0,
            lastActive: new Date().toISOString().split('T')[0]
        };
        localStorage.setItem('timerStatistics', JSON.stringify(statistics));
        updateStatisticsDisplay();
    });

    // Event Listeners - Other
    hiddenInput.addEventListener('input', () => {
        if (!isRunning) {
            const inputMinutes = parseInt(hiddenInput.value, 10);
            if (!isNaN(inputMinutes)) {
                timeRemaining = inputMinutes * 60;
                totalTime = timeRemaining;
                updateTimerDisplay();
            }
        }
    });

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
});