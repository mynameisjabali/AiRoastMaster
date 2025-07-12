// Ultimate Viral-Ready AI Roast Me JavaScript with Real-time Features

document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentRoast = '';
    let currentDescription = '';
    let currentMode = 'single';
    let currentLanguage = 'en';
    let socket = null;
    let achievements = JSON.parse(localStorage.getItem('roast_achievements') || '[]');
    let userStats = JSON.parse(localStorage.getItem('roast_stats') || '{"roasts_generated": 0, "battles_won": 0, "tts_used": 0}');
    
    // DOM Elements
    const userDescription = document.getElementById('userDescription');
    const userDescription1 = document.getElementById('userDescription1');
    const userDescription2 = document.getElementById('userDescription2');
    const storyDescription = document.getElementById('storyDescription');
    const roastBtn = document.getElementById('roastBtn');
    const battleBtn = document.getElementById('battleBtn');
    const storyBtn = document.getElementById('storyBtn');
    const roastBtnText = document.getElementById('roastBtnText');
    const roastBtnSpinner = document.getElementById('roastBtnSpinner');
    const roastResult = document.getElementById('roastResult');
    const battleResult = document.getElementById('battleResult');
    const storyResult = document.getElementById('storyResult');
    const roastText = document.getElementById('roastText');
    const battleRoast1 = document.getElementById('battleRoast1');
    const battleRoast2 = document.getElementById('battleRoast2');
    const battleVerdict = document.getElementById('battleVerdict');
    const storyParts = document.getElementById('storyParts');
    const charCount = document.getElementById('charCount');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const personaSelect = document.getElementById('personaSelect');
    const languageSelect = document.getElementById('languageSelect');
    const makePublicCheck = document.getElementById('makePublicCheck');
    const singleMode = document.getElementById('singleMode');
    const battleMode = document.getElementById('battleMode');
    const storyMode = document.getElementById('storyMode');
    const singleModeBtn = document.getElementById('singleModeBtn');
    const battleModeBtn = document.getElementById('battleModeBtn');
    const storyModeBtn = document.getElementById('storyModeBtn');
    const surpriseBtn = document.getElementById('surpriseBtn');
    const roastAudio = document.getElementById('roastAudio');
    const memeGenerator = document.getElementById('memeGenerator');
    const achievementCard = document.getElementById('achievementCard');
    const achievementBadges = document.getElementById('achievementBadges');

    // Initialize app
    init();

    function init() {
        setupEventListeners();
        initializeWebSocket();
        loadRoastHistory();
        loadLeaderboard();
        updateCharacterCount();
        updateAchievements();
        
        // Check for debug mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === '1') {
            document.body.classList.add('debug-mode');
        }
    }

    function setupEventListeners() {
        // Mode switching
        singleModeBtn.addEventListener('click', () => switchMode('single'));
        battleModeBtn.addEventListener('click', () => switchMode('battle'));
        storyModeBtn.addEventListener('click', () => switchMode('story'));
        
        // Main action buttons
        roastBtn.addEventListener('click', handleRoastRequest);
        battleBtn.addEventListener('click', handleBattleRequest);
        storyBtn.addEventListener('click', handleStoryRequest);
        surpriseBtn.addEventListener('click', handleSurpriseRequest);
        
        // Settings
        languageSelect.addEventListener('change', handleLanguageChange);
        
        // Character counting
        userDescription.addEventListener('input', updateCharacterCount);
        
        // Action buttons (will be attached dynamically)
        document.addEventListener('click', handleDynamicClicks);
        
        // Enter key support
        userDescription.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                handleRoastRequest();
            }
        });
        
        storyDescription.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                handleStoryRequest();
            }
        });
    }

    function switchMode(mode) {
        currentMode = mode;
        
        // Update button states
        singleModeBtn.classList.toggle('active', mode === 'single');
        battleModeBtn.classList.toggle('active', mode === 'battle');
        storyModeBtn.classList.toggle('active', mode === 'story');
        
        // Show/hide appropriate forms
        singleMode.classList.toggle('d-none', mode !== 'single');
        battleMode.classList.toggle('d-none', mode !== 'battle');
        storyMode.classList.toggle('d-none', mode !== 'story');
        
        // Hide results
        hideResults();
        hideError();
    }

    function updateCharacterCount() {
        const count = userDescription.value.length;
        charCount.textContent = count;
        charCount.style.color = count > 450 ? 'var(--bs-warning)' : 'var(--bs-muted)';
    }

    async function handleRoastRequest() {
        const description = userDescription.value.trim();
        
        if (!description) {
            showError('Please describe yourself first!');
            return;
        }
        
        if (description.length > 500) {
            showError('Description too long! Keep it under 500 characters.');
            return;
        }
        
        const persona = personaSelect.value;
        
        setLoadingState(true);
        hideError();
        hideResults();
        
        try {
            const response = await fetch('/roast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
                    persona: persona,
                    mode: 'single'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate roast');
            }
            
            const data = await response.json();
            
            if (data.roast) {
                currentRoast = data.roast;
                currentDescription = description;
                showRoastResult(data.roast);
                saveRoastToHistory(description, data.roast);
                playRoastSound();
                highlightDetectedKeywords(description);
            } else {
                throw new Error('No roast received from server');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to generate roast. Please try again.');
        } finally {
            setLoadingState(false);
        }
    }

    async function handleBattleRequest() {
        const description1 = userDescription1.value.trim();
        const description2 = userDescription2.value.trim();
        
        if (!description1 || !description2) {
            showError('Please describe both fighters!');
            return;
        }
        
        const persona = personaSelect.value;
        
        setLoadingState(true, 'battle');
        hideError();
        hideResults();
        
        try {
            const response = await fetch('/roast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description1,
                    description2: description2,
                    persona: persona,
                    mode: 'battle'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate battle roasts');
            }
            
            const data = await response.json();
            
            if (data.roast1 && data.roast2 && data.verdict) {
                showBattleResult(data.roast1, data.roast2, data.verdict);
                saveRoastToHistory(`${description1} vs ${description2}`, `Battle: ${data.verdict}`);
                playRoastSound();
            } else {
                throw new Error('Incomplete battle data received');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to generate battle. Please try again.');
        } finally {
            setLoadingState(false, 'battle');
        }
    }

    async function handleSurpriseRequest() {
        try {
            const response = await fetch('/surprise');
            
            if (!response.ok) {
                throw new Error('Failed to get surprise description');
            }
            
            const data = await response.json();
            
            if (data.description) {
                userDescription.value = data.description;
                updateCharacterCount();
                
                // Auto-submit after a brief delay
                setTimeout(() => {
                    handleRoastRequest();
                }, 500);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to generate surprise description. Please try again.');
        }
    }

    function handleDynamicClicks(e) {
        // Roast again
        if (e.target.id === 'roastAgainBtn') {
            handleRoastRequest();
        }
        
        // Copy roast
        if (e.target.id === 'copyRoastBtn') {
            copyRoastToClipboard();
        }
        
        // Download image
        if (e.target.id === 'downloadImageBtn') {
            downloadRoastImage();
        }
        
        // Play roast
        if (e.target.id === 'playRoastBtn') {
            playRoastTTS();
        }
        
        // Rate roast
        if (e.target.id === 'rateRoastBtn') {
            rateRoast();
        }
    }

    function setLoadingState(isLoading, mode = 'single') {
        if (mode === 'single') {
            roastBtn.disabled = isLoading;
            roastBtnText.classList.toggle('d-none', isLoading);
            roastBtnSpinner.classList.toggle('d-none', !isLoading);
        } else {
            battleBtn.disabled = isLoading;
            battleBtn.innerHTML = isLoading ? 
                '<span class="spinner-border spinner-border-sm me-2"></span>BATTLING...' : 
                '⚔️ START BATTLE';
        }
        
        document.body.classList.toggle('loading', isLoading);
    }

    function showRoastResult(roast) {
        roastText.textContent = roast;
        roastResult.classList.remove('d-none');
        battleResult.classList.add('d-none');
        
        // Scroll to result
        setTimeout(() => {
            roastResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function showBattleResult(roast1, roast2, verdict) {
        battleRoast1.textContent = roast1;
        battleRoast2.textContent = roast2;
        battleVerdict.textContent = verdict;
        
        battleResult.classList.remove('d-none');
        roastResult.classList.add('d-none');
        
        // Scroll to result
        setTimeout(() => {
            battleResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function hideResults() {
        roastResult.classList.add('d-none');
        battleResult.classList.add('d-none');
        storyResult.classList.add('d-none');
        memeGenerator.classList.add('d-none');
        
        // Clear keyword detection
        const keywordDetection = document.getElementById('keywordDetection');
        if (keywordDetection) {
            keywordDetection.remove();
        }
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('d-none');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    function hideError() {
        errorMessage.classList.add('d-none');
    }

    async function copyRoastToClipboard() {
        const textToCopy = currentMode === 'single' ? currentRoast : 
            `${battleRoast1.textContent}\n\n${battleRoast2.textContent}\n\n${battleVerdict.textContent}`;
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                fallbackCopyTextToClipboard(textToCopy);
            }
            showSuccessToast('Roast copied to clipboard! 📋');
        } catch (error) {
            console.error('Copy failed:', error);
            fallbackCopyTextToClipboard(textToCopy);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                showSuccessToast('Roast copied to clipboard! 📋');
            } else {
                showSuccessToast('Please manually copy the roast text.');
            }
        } catch (error) {
            console.error('Fallback copy failed:', error);
            showSuccessToast('Please manually copy the roast text.');
        }
    }

    async function downloadRoastImage() {
        try {
            const element = currentMode === 'single' ? 
                document.getElementById('roastCard') : 
                document.getElementById('battleResult');
                
            if (!element) {
                throw new Error('No roast to download');
            }
            
            showSuccessToast('Generating image... 📸');
            
            const canvas = await html2canvas(element, {
                backgroundColor: '#0d1117',
                scale: 2,
                logging: false,
                allowTaint: true,
                useCORS: true
            });
            
            const link = document.createElement('a');
            link.download = `roast-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            showSuccessToast('Roast image downloaded! 🎉');
        } catch (error) {
            console.error('Download failed:', error);
            showSuccessToast('Download failed. Please try again.');
        }
    }

    function playRoastSound() {
        try {
            roastAudio.currentTime = 0;
            roastAudio.play().catch(e => {
                console.log('Audio play failed (user interaction required):', e);
            });
        } catch (error) {
            console.error('Audio play failed:', error);
        }
    }

    function playRoastTTS() {
        try {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                speechSynthesis.cancel();
                
                const textToSpeak = currentMode === 'single' ? currentRoast : 
                    `Fighter A: ${battleRoast1.textContent}. Fighter B: ${battleRoast2.textContent}. ${battleVerdict.textContent}`;
                
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                
                // Configure voice settings
                utterance.rate = 0.9;
                utterance.pitch = 0.8;
                utterance.volume = 0.8;
                
                // Try to use a more interesting voice
                const voices = speechSynthesis.getVoices();
                const preferredVoices = voices.filter(voice => 
                    voice.lang.includes('en') && 
                    (voice.name.includes('Male') || voice.name.includes('Female'))
                );
                
                if (preferredVoices.length > 0) {
                    utterance.voice = preferredVoices[0];
                }
                
                utterance.onstart = () => {
                    document.getElementById('playRoastBtn').innerHTML = '⏸️ Stop';
                };
                
                utterance.onend = () => {
                    document.getElementById('playRoastBtn').innerHTML = '🔊 Play';
                };
                
                speechSynthesis.speak(utterance);
                showSuccessToast('Playing roast with TTS! 🔊');
            } else {
                showSuccessToast('Text-to-speech not supported in this browser.');
            }
        } catch (error) {
            console.error('TTS failed:', error);
            showSuccessToast('Text-to-speech failed. Please try again.');
        }
    }

    async function rateRoast() {
        try {
            const response = await fetch('/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roast: currentRoast,
                    description: currentDescription
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to rate roast');
            }
            
            const data = await response.json();
            showSuccessToast(`Rated as brutal! 👍 (${data.votes} votes)`);
            loadLeaderboard(); // Refresh leaderboard
        } catch (error) {
            console.error('Rating failed:', error);
            showSuccessToast('Failed to rate roast. Please try again.');
        }
    }

    function saveRoastToHistory(description, roast) {
        try {
            let history = JSON.parse(sessionStorage.getItem('roastHistory') || '[]');
            
            const entry = {
                description: description,
                roast: roast,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };
            
            history.unshift(entry);
            
            // Keep only last 20 entries
            if (history.length > 20) {
                history = history.slice(0, 20);
            }
            
            sessionStorage.setItem('roastHistory', JSON.stringify(history));
            updateHistoryDisplay();
        } catch (error) {
            console.error('Failed to save to history:', error);
        }
    }

    function loadRoastHistory() {
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        try {
            const history = JSON.parse(sessionStorage.getItem('roastHistory') || '[]');
            const historyElement = document.getElementById('roastHistory');
            const historyList = document.getElementById('historyList');
            const historyCount = document.getElementById('historyCount');
            
            if (history.length === 0) {
                historyElement.classList.add('d-none');
                return;
            }
            
            historyElement.classList.remove('d-none');
            historyCount.textContent = history.length;
            
            historyList.innerHTML = history.map(item => {
                const date = new Date(item.timestamp).toLocaleString();
                return `
                    <div class="history-item">
                        <div class="history-item-text">
                            <strong>Description:</strong> ${escapeHtml(item.description)}<br>
                            <strong>Roast:</strong> ${escapeHtml(item.roast)}
                        </div>
                        <div class="history-item-time">${date}</div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to update history display:', error);
        }
    }

    async function loadLeaderboard() {
        try {
            const response = await fetch('/leaderboard');
            
            if (!response.ok) {
                return;
            }
            
            const data = await response.json();
            updateLeaderboardDisplay(data.leaderboard || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    function updateLeaderboardDisplay(leaderboard) {
        const leaderboardContent = document.getElementById('leaderboardContent');
        const mobileLeaderboard = document.getElementById('mobileLeaderboard');
        
        if (leaderboard.length === 0) {
            const emptyMessage = '<div class="text-muted small">No brutal roasts yet...</div>';
            if (leaderboardContent) leaderboardContent.innerHTML = emptyMessage;
            if (mobileLeaderboard) mobileLeaderboard.innerHTML = emptyMessage;
            return;
        }
        
        const leaderboardHTML = leaderboard.map((item, index) => `
            <div class="leaderboard-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="fw-bold text-warning">#${index + 1}</div>
                        <div class="small text-muted mb-1">${escapeHtml(item.description)}</div>
                        <div class="small">${escapeHtml(item.roast.substring(0, 80))}...</div>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-danger">${item.votes} 👍</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (leaderboardContent) leaderboardContent.innerHTML = leaderboardHTML;
        if (mobileLeaderboard) mobileLeaderboard.innerHTML = leaderboardHTML;
    }

    function showSuccessToast(message) {
        try {
            const toastElement = document.querySelector('#successToast .toast');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        } catch (error) {
            console.error('Toast failed:', error);
        }
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Keyword categories for detection and highlighting
    const keywordCategories = {
        'developer': ['developer', 'code', 'coding', 'software', 'engineer', 'programming', 'bug', 'debug', 'python', 'javascript', 'tech', 'computer', 'laptop', 'github', 'stack overflow', 'framework', 'backend', 'frontend', 'api', 'database'],
        'cat_lover': ['cat', 'kitten', 'feline', 'meow', 'purr', 'cat lady', 'cat person', 'kitty', 'tabby', 'persian', 'siamese', 'pet', 'litter box'],
        'nerdy': ['smart', 'nerd', 'genius', 'iq', 'science', 'math', 'physics', 'chemistry', 'intellectual', 'book', 'reading', 'study', 'academic', 'research', 'phd', 'doctorate', 'quantum'],
        'gamer': ['game', 'gaming', 'gamer', 'fortnite', 'controller', 'keyboard', 'xbox', 'playstation', 'nintendo', 'twitch', 'stream', 'fps', 'mmo', 'rpg', 'console', 'pc gaming', 'esports'],
        'gym': ['gym', 'workout', 'fitness', 'muscle', 'protein', 'gains', 'lifting', 'bodybuilding', 'crossfit', 'cardio', 'abs', 'biceps', 'shredded', 'swole', 'alpha', 'beast mode', 'deadlift', 'squat'],
        'student': ['student', 'college', 'university', 'exam', 'homework', 'study', 'class', 'semester', 'grade', 'professor', 'dorm', 'campus', 'major', 'degree', 'graduate', 'tuition'],
        'boring': ['average', 'normal', 'ordinary', 'basic', 'nothing special', 'regular', 'typical', 'common', 'plain', 'vanilla', 'mediocre', 'bland', 'unremarkable', 'standard'],
        'vain': ['attractive', 'pretty', 'beautiful', 'hot', 'gorgeous', 'handsome', 'model', 'selfie', 'instagram', 'mirror', 'makeup', 'fashion', 'style', 'looks', 'appearance', 'influencer'],
        'crypto': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'nft', 'defi', 'hodl', 'diamond hands', 'to the moon', 'web3', 'metaverse', 'mining', 'wallet'],
        'hipster': ['hipster', 'artisan', 'craft beer', 'vinyl', 'vintage', 'organic', 'sustainable', 'fair trade', 'local', 'indie', 'alternative', 'ironic'],
        'vegan': ['vegan', 'plant based', 'vegetarian', 'tofu', 'quinoa', 'kale', 'almond milk', 'ethical', 'cruelty free', 'meat free', 'dairy free'],
        'ai': ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'openai', 'neural network', 'algorithm', 'automation', 'robot', 'singularity']
    };

    function highlightDetectedKeywords(description) {
        try {
            const descriptionLower = description.toLowerCase();
            const detectedCategories = [];
            const detectedKeywords = [];
            
            // Find matching categories and keywords
            Object.entries(keywordCategories).forEach(([category, keywords]) => {
                const matchedKeywords = keywords.filter(keyword => 
                    descriptionLower.includes(keyword.toLowerCase())
                );
                if (matchedKeywords.length > 0) {
                    detectedCategories.push(category);
                    detectedKeywords.push(...matchedKeywords);
                }
            });
            
            if (detectedKeywords.length > 0) {
                // Create highlighted version of description
                let highlightedDescription = description;
                
                // Sort keywords by length (longest first) to avoid partial replacements
                const sortedKeywords = [...new Set(detectedKeywords)].sort((a, b) => b.length - a.length);
                
                sortedKeywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                    highlightedDescription = highlightedDescription.replace(regex, 
                        `<span class="keyword-highlight">${keyword}</span>`
                    );
                });
                
                // Show detection info
                showKeywordDetection(detectedCategories, highlightedDescription);
            }
        } catch (error) {
            console.error('Keyword highlighting failed:', error);
            // Fail silently - this is a bonus feature
        }
    }

    function showKeywordDetection(categories, highlightedDescription) {
        try {
            // Create or update keyword detection display
            let detectionDiv = document.getElementById('keywordDetection');
            if (!detectionDiv) {
                detectionDiv = document.createElement('div');
                detectionDiv.id = 'keywordDetection';
                detectionDiv.className = 'keyword-detection mt-3 p-3 bg-dark rounded border';
                roastResult.appendChild(detectionDiv);
            }
            
            const categoryTags = categories.map(cat => 
                `<span class="badge bg-secondary me-1">${cat.replace('_', ' ')}</span>`
            ).join('');
            
            detectionDiv.innerHTML = `
                <div class="small text-muted mb-2">
                    <strong>🎯 Detected Categories:</strong> ${categoryTags}
                </div>
                <div class="small">
                    <strong>📝 Your Description:</strong> <span class="highlighted-text">${highlightedDescription}</span>
                </div>
            `;
        } catch (error) {
            console.error('Failed to show keyword detection:', error);
        }
    }

    // Load voices for TTS when available
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = function() {
            // Voices loaded - ready for TTS
        };
    }

    // Auto-refresh leaderboard every 30 seconds
    setInterval(loadLeaderboard, 30000);
    
    // New Ultimate Features
    window.initializeWebSocket = function() {
        if (typeof io !== 'undefined') {
            socket = io();
            
            socket.on('connect', function() {
                console.log('Connected to real-time server');
                socket.emit('join_leaderboard');
            });
            
            socket.on('leaderboard_update', function(data) {
                updateLeaderboardDisplay(data.leaderboard);
            });
            
            socket.on('new_public_roast', function(roast) {
                showSuccessToast('New public roast shared!');
            });
        }
    };
    
    window.handleLanguageChange = function() {
        currentLanguage = languageSelect.value;
        const url = new URL(window.location);
        url.searchParams.set('lang', currentLanguage);
        window.history.replaceState({}, '', url);
    };
    
    window.handleStoryRequest = async function() {
        const description = storyDescription ? storyDescription.value.trim() : '';
        
        if (!description) {
            showError('Please provide a description for your roast story!');
            return;
        }
        
        try {
            const response = await fetch('/roast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
                    persona: personaSelect.value,
                    language: currentLanguage || 'en',
                    mode: 'story',
                    make_public: makePublicCheck ? makePublicCheck.checked : false
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate story roast');
            }
            
            const data = await response.json();
            
            if (data.story_parts) {
                showStoryResult(data.story_parts);
                saveRoastToHistory(description, data.story_parts.join(' '));
                playRoastSound();
            }
        } catch (error) {
            console.error('Story request error:', error);
            showError(error.message || 'Failed to generate story roast. Please try again.');
        }
    };
    
    window.showStoryResult = function(storyPartsArray) {
        if (!storyResult || !storyParts) return;
        
        storyResult.classList.remove('d-none');
        battleResult.classList.add('d-none');
        roastResult.classList.add('d-none');
        
        storyParts.innerHTML = '';
        
        storyPartsArray.forEach((part, index) => {
            setTimeout(() => {
                const partDiv = document.createElement('div');
                partDiv.className = 'story-part mb-3 p-3 bg-dark rounded border-start border-warning border-3';
                partDiv.innerHTML = `
                    <div class="story-part-number text-warning fw-bold mb-2">Chapter ${index + 1}</div>
                    <div class="story-part-text">${escapeHtml(part)}</div>
                `;
                storyParts.appendChild(partDiv);
                
                partDiv.style.opacity = '0';
                partDiv.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    partDiv.style.transition = 'all 0.5s ease';
                    partDiv.style.opacity = '1';
                    partDiv.style.transform = 'translateY(0)';
                }, 100);
            }, index * 1500);
        });
        
        setTimeout(() => {
            storyResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };
    
    // Initialize WebSocket if available
    if (typeof io !== 'undefined') {
        initializeWebSocket();
    }
    
    // Add language change listener if element exists
    if (languageSelect) {
        languageSelect.addEventListener('change', handleLanguageChange);
    }
    
    // Add story mode button listener if element exists
    if (storyBtn) {
        storyBtn.addEventListener('click', handleStoryRequest);
    }
});