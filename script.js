document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const langToggle = document.getElementById('lang-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const loader = document.getElementById('loader');
    const audioPlayer = document.getElementById('audio-player');
    const singleAyahPlayer = document.getElementById('single-ayah-player');
    const mainPlayBtn = document.getElementById('main-play-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const views = document.querySelectorAll('.view');
    const surahListReading = document.getElementById('surah-list-reading');
    const surahListListening = document.getElementById('surah-list-listening');
    const reciterSelects = document.querySelectorAll('[data-role="reciter-select"]');
    const riwayaSelects = document.querySelectorAll('[data-role="riwaya-select"]');
    const ayahContainer = document.getElementById('ayah-container');
    const radioList = document.getElementById('radio-list');
    const globalPlayerBar = document.getElementById('global-player-bar');
    const seekThumb = document.getElementById('seek-thumb');
    const seekBarContainer = document.getElementById('seek-bar-container');
    const surahSearchInput = document.getElementById('surah-search-input');
    const listeningSearchInput = document.getElementById('listening-search-input');
    const radioSearchInput = document.getElementById('radio-search-input');
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    const contactForm = document.getElementById('contact-form');
    const formSuccessMessage = document.getElementById('form-success-message');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontTypeSelect = document.getElementById('font-type-select');
    const bookmarksList = document.getElementById('bookmarks-list');
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const settingsWrapper = document.querySelector('.sidebar-settings-wrapper');

    // --- State Management ---
    const API_AUDIO_BASE = 'https://mp3quran.net/api/v3';
    const API_TEXT_BASE = 'https://api.alquran.cloud/v1';
    let allReciters = [], allSuwarAudio = [], allSuwarText = [], allRadios = [], bookmarks = [];
    let selectedReciter = null, selectedMoshaf = null, activePlayableItem = null, activeReadingItem = null;
    let currentTheme = localStorage.getItem('quranTheme') || 'light';
    let currentLang = localStorage.getItem('quranLang') || 'en';
    let isDragging = false;
    let currentFontSize = localStorage.getItem('quranFontSize') || '2.5';
    let currentFontFamily = localStorage.getItem('quranFontFamily') || "'KFGQPC Uthman Taha Naskh', serif";
    const CACHE_KEYS = { reciters: (lang) => `quranReciters_${lang}`, suwarAudio: (lang) => `quranSuwarAudio_${lang}`, suwarText: `quranSuwarText`, radios: (lang) => `quranRadios_${lang}` };

    // --- ICONS & TRANSLATIONS ---
    const ICONS = { settings: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`, play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`, pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`, sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.64 5.64c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.64 5.64zm12.72 12.72c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.41-1.41zM18.36 5.64l-1.41 1.41c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.41-1.41c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0zm-12.72 12.72l-1.41 1.41c-.39-.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.41-1.41c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0z"/></svg>`, moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.37 5.51C9.19 6.15 9.1 6.82 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg>`, upArrow: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/></svg>`, bookmark: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>`, copy: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`, remove: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`, tafsir: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M19,5v14H5V5H19 M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3L19,3z"/> <path d="M14,17H7v-2h7V17z M17,13H7v-2h10V13z M17,9H7V7h10V9z"/></g></g></svg>` };
    const TRANSLATIONS = {
        en: { langCode: 'eng', langToggle: 'ع', appTitle: 'QuranWay', appSubtitle: 'Your path to reflection and understanding', chaptersTitle: 'The Chapters', readingPlaceholder: 'Select a Surah from the list to begin reading.', selectReciter: 'Select Reciter', selectNarration: 'Select Narration', modeReading: 'Reading', modeListening: 'Listening', modeRadio: 'Live Radio', liveQuranRadio: 'Live Quran Radio', listeningTitle: 'Surah Audio Player', searchSurah: "Search Surah...", searchRadio: "Search Radio Station...", modeContact: 'Contact Us', contactTitle: 'Contact Us', labelName: 'Name', labelEmail: 'Email', labelMessage: 'Message', buttonSubmit: 'Submit', formSuccess: 'Thank you for your message!', modeBookmarks: 'Bookmarks', bookmarksTitle: 'My Bookmarks', noBookmarks: 'You have no saved bookmarks yet.', readingSettings: 'Reading Settings', fontSize: 'Font Size', fontType: 'Quranic Font', audioSettings: 'Audio Settings', listenToFullSurah: 'Listen to Full Surah', tafsirButton: 'Tafsir', ayahsText: 'Ayahs', revelationType: (type) => type },
        ar: { langCode: 'ara', langToggle: 'EN', appTitle: 'رحلات قرآنية', appSubtitle: 'طريقك للتفكر والتدبر', chaptersTitle: 'السور', readingPlaceholder: 'اختر سورة من القائمة لبدء القراءة.', selectReciter: 'اختر القارئ', selectNarration: 'اختر الرواية', modeReading: 'قراءة', modeListening: 'استماع', modeRadio: 'بث مباشر', liveQuranRadio: 'بث مباشر للقرآن', listeningTitle: 'الاستماع للسور', searchSurah: "ابحث عن سورة...", searchRadio: "ابحث عن إذاعة...", modeContact: 'تواصل معنا', contactTitle: 'تواصل معنا', labelName: 'الاسم', labelEmail: 'البريد الإلكتروني', labelMessage: 'الرسالة', buttonSubmit: 'إرسال', formSuccess: 'شكراً لرسالتك!', modeBookmarks: 'المحفوظات', bookmarksTitle: 'الآيات المحفوظة', noBookmarks: 'لا يوجد لديك آيات محفوظة بعد.', readingSettings: 'إعدادات القراءة', fontSize: 'حجم الخط', fontType: 'الخط القرآني', audioSettings: 'إعدادات الصوت', listenToFullSurah: 'استمع للسورة كاملة', tafsirButton: 'تفسير', ayahsText: 'آيات', revelationType: (type) => type === 'Meccan' ? 'مكية' : 'مدنية' }
    };

    // --- Core App Logic ---
    const toggleLoader = (show) => loader.classList.toggle('visible', show);
    const applyTheme = (theme) => { document.body.classList.toggle('dark-mode', theme === 'dark'); themeToggle.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon; localStorage.setItem('quranTheme', theme); currentTheme = theme; };
    const formatTime = (time) => { const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return isNaN(minutes) ? '0:00' : `${minutes}:${seconds.toString().padStart(2, '0')}`; };
    
    function setMode(mode) {
        if(mode !== 'reading') stopPlayback();
        views.forEach(v => v.classList.remove('active'));
        const activeView = document.getElementById(`${mode}-view`);
        if(activeView) activeView.classList.add('active');
        
        modeButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('href') === `#${mode}`);
        });
        if(mode === 'bookmarks') populateBookmarksView();
    }

    function handleRouteChange() {
        const hash = window.location.hash || '#reading';
        const validModes = Array.from(modeButtons).map(b => b.dataset.mode);
        const mode = validModes.includes(hash.substring(1)) ? hash.substring(1) : 'not-found';
        setMode(mode);
    }

    function applyLanguage(lang) { const t = TRANSLATIONS[lang]; document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.querySelectorAll('[data-translate]').forEach(el => { el.textContent = t[el.dataset.translate]; }); langToggle.textContent = t.langToggle; surahSearchInput.placeholder = t.searchSurah; radioSearchInput.placeholder = t.searchRadio; listeningSearchInput.placeholder = t.searchSurah; localStorage.setItem('quranLang', lang); currentLang = lang; fetchAllData(); }
    function stopPlayback() { audioPlayer.pause(); audioPlayer.src = ''; singleAyahPlayer.pause(); singleAyahPlayer.src = ''; globalPlayerBar.classList.remove('visible'); if (activePlayableItem) activePlayableItem.classList.remove('playing'); activePlayableItem = null; }
    function playAudio(url, type, contextElement) { stopPlayback(); const player = type === 'single-ayah' ? singleAyahPlayer : audioPlayer; player.src = url; player.play().catch(e => console.error("Playback error:", e)); if (type !== 'single-ayah') { activePlayableItem = contextElement; activePlayableItem.classList.add('playing'); globalPlayerBar.classList.add('visible'); globalPlayerBar.classList.toggle('is-livestream', type === 'livestream'); } }

    // --- Font & Bookmark Logic ---
    function applyFontSize(size) { document.documentElement.style.setProperty('--arabic-font-size', `${size}rem`); localStorage.setItem('quranFontSize', size); }
    function applyFontFamily(font) { document.documentElement.style.setProperty('--arabic-font-family', font); localStorage.setItem('quranFontFamily', font); }
    function loadBookmarks() { bookmarks = JSON.parse(localStorage.getItem('quranBookmarks')) || []; }
    function saveBookmarks() { localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks)); }
    function handleBookmarkClick(surahNumber, ayahNumberInSurah, arabicText, englishText, surahName) { const bookmarkId = `${surahNumber}:${ayahNumberInSurah}`; const existingIndex = bookmarks.findIndex(b => b.id === bookmarkId); if (existingIndex > -1) { bookmarks.splice(existingIndex, 1); } else { bookmarks.push({ id: bookmarkId, surahNumber, ayahNumberInSurah, arabicText, englishText, surahName }); } saveBookmarks(); }
    function populateBookmarksView() { if (!bookmarksList) return; if (bookmarks.length === 0) { bookmarksList.innerHTML = `<p class="ayah-placeholder" data-translate="noBookmarks">${TRANSLATIONS[currentLang].noBookmarks}</p>`; return; } bookmarksList.innerHTML = bookmarks.map(b => `<div class="bookmark-item"><div class="bookmark-header"><span class="bookmark-title">${b.surahName} (${b.surahNumber}:${b.ayahNumberInSurah})</span><button class="bookmark-remove-btn" data-id="${b.id}">${ICONS.remove}</button></div><div class="bookmark-content"><p class="ayah-text-arabic">${b.arabicText}</p><p class="ayah-text-english">“${b.englishText}”</p></div></div>`).join(''); }
    
    // --- API & Data Handling ---
    async function fetchAllData() { toggleLoader(true); const langCode = TRANSLATIONS[currentLang].langCode; try { const [recitersRes, suwarAudioRes, radiosRes, suwarTextRes] = await Promise.all([ fetch(`${API_AUDIO_BASE}/reciters?language=${langCode}`), fetch(`${API_AUDIO_BASE}/suwar?language=${langCode}`), fetch(`${API_AUDIO_BASE}/radios?language=${langCode}`), fetch(`${API_TEXT_BASE}/meta`) ]); allReciters = (await recitersRes.json()).reciters; allReciters.sort((a, b) => a.name.localeCompare(b.name, currentLang === 'ar' ? 'ar-u-co-sort' : undefined)); allSuwarAudio = (await suwarAudioRes.json()).suwar; allSuwarText = (await suwarTextRes.json()).data.surahs.references; allRadios = (await radiosRes.json()).radios; populateAllViews(); } catch (error) { console.error('Failed to fetch data:', error); } finally { toggleLoader(false); } }
    function populateAllViews() { populateReciterSelects(); populateSurahReadingList(allSuwarText); populateSurahListeningList(allSuwarAudio); populateRadioList(allRadios); populateBookmarksView(); }
    function populateReciterSelects() { const savedReciterId = localStorage.getItem('quranReciterId') || '7'; const reciterId = savedReciterId; reciterSelects.forEach(select => { select.innerHTML = allReciters.map(r => `<option value="${r.id}" ${r.id == reciterId ? 'selected' : ''}>${r.name}</option>`).join(''); }); handleReciterChange({ target: { value: reciterId } }); }
    function populateSurahReadingList(suwar) { const t = TRANSLATIONS[currentLang]; surahListReading.innerHTML = suwar.map(s => `<div class="surah-item" data-surah-number="${s.number}"><div class="surah-number">${s.number}</div><div class="surah-details"><div class="surah-name-main">${currentLang === 'ar' ? s.name : s.englishName}</div><div class="surah-info-secondary">${t.revelationType(s.revelationType)} - ${s.numberOfAyahs} ${t.ayahsText}</div></div></div>`).join(''); }
    function populateSurahListeningList(suwar) { surahListListening.innerHTML = suwar.map(s => `<div class="item-card locked" data-surah-number="${s.id}" data-type="mp3"><h3>${s.name}</h3><button class="item-card-play-btn">${ICONS.play}</button></div>`).join(''); if(selectedMoshaf) { surahListListening.querySelectorAll('.item-card').forEach(item => item.classList.remove('locked')); } }
    function populateRadioList(radios) { radioList.innerHTML = radios.map(r => `<div class="item-card" data-url="${r.url}" data-type="livestream"><h3>${r.name}</h3><button class="item-card-play-btn">${ICONS.play}</button></div>`).join(''); }
    function handleReciterChange(event) { const reciterId = event.target.value; selectedReciter = allReciters.find(r => r.id == reciterId); if (!selectedReciter) return; localStorage.setItem('quranReciterId', reciterId); reciterSelects.forEach(s => s.value = reciterId); const riwayaOptions = selectedReciter.moshaf.map((m, i) => `<option value="${i}">${m.name}</option>`).join(''); riwayaSelects.forEach(s => { s.innerHTML = riwayaOptions; s.disabled = false; }); handleRiwayaChange({ target: { value: riwayaSelects[0].value }}); }
    function handleRiwayaChange(event) { const moshafIndex = event.target.value; if(selectedReciter.moshaf[moshafIndex]) { selectedMoshaf = selectedReciter.moshaf[moshafIndex]; riwayaSelects.forEach(s => s.value = moshafIndex); surahListListening.querySelectorAll('.item-card').forEach(item => item.classList.remove('locked')); audioPlayer.src = ''; } }

    async function handleSurahTextDisplay(surahNumber, surahItem) {
        if (activeReadingItem) activeReadingItem.classList.remove('active');
        activeReadingItem = surahItem;
        activeReadingItem.classList.add('active');
        toggleLoader(true);
        try {
            const { data } = await (await fetch(`${API_TEXT_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.muyassar`)).json();
            const [quranData, translationData, tafsirData] = data;
            const fullSurahPlayBtnDisabled = !selectedReciter || !selectedMoshaf;
            const headerHtml = `<div class="ayah-container-header"><h2 id="surah-title-reading">${quranData.englishName}</h2><p id="surah-title-arabic-reading">${quranData.name}</p><p id="surah-info-reading">${TRANSLATIONS[currentLang].revelationType(quranData.revelationType)} - ${quranData.numberOfAyahs} ${TRANSLATIONS[currentLang].ayahsText}</p><button class="full-surah-play-btn" data-surah-number="${surahNumber}" ${fullSurahPlayBtnDisabled ? 'disabled' : ''}>${ICONS.play} <span data-translate="listenToFullSurah">${TRANSLATIONS[currentLang].listenToFullSurah}</span></button></div>`;
            const ayahsHtml = quranData.ayahs.map((ayah, index) => { const isBookmarked = bookmarks.some(b => b.id === `${surahNumber}:${ayah.numberInSurah}`); return `<div class="ayah" data-surah-number="${surahNumber}" data-surah-name="${quranData.englishName}" data-ayah-in-surah="${ayah.numberInSurah}"><div class="ayah-header"><div class="ayah-number">${ayah.numberInSurah}</div><div class="ayah-actions"><button class="ayah-action-btn" data-action="tafsir" title="${TRANSLATIONS[currentLang].tafsirButton}">${ICONS.tafsir}</button><button class="ayah-action-btn" data-action="play" data-ayah-number="${ayah.number}" title="Play Ayah">${ICONS.play}</button><button class="ayah-action-btn" data-action="copy" title="Copy Ayah">${ICONS.copy}</button><button class="ayah-action-btn ${isBookmarked ? 'bookmarked' : ''}" data-action="bookmark" title="Bookmark Ayah">${ICONS.bookmark}</button></div></div><p class="ayah-text-arabic">${ayah.text}</p><p class="ayah-text-english">“${translationData.ayahs[index].text}”</p><div class="tafsir-content"><p>${tafsirData.ayahs[index].text}</p></div></div>`; }).join('');
            ayahContainer.innerHTML = headerHtml + `<div class="ayah-content-wrapper">${ayahsHtml}</div>`;
            ayahContainer.scrollTop = 0;
        } catch (error) { console.error('Failed to fetch Surah text:', error); } finally { toggleLoader(false); }
    }

    // --- Event Listeners ---
    themeToggle.addEventListener('click', () => applyTheme(currentTheme === 'light' ? 'dark' : 'light'));
    langToggle.addEventListener('click', () => applyLanguage(currentLang === 'en' ? 'ar' : 'en'));
    window.addEventListener('hashchange', handleRouteChange);
    reciterSelects.forEach(s => s.addEventListener('change', handleReciterChange));
    riwayaSelects.forEach(s => s.addEventListener('change', handleRiwayaChange));
    surahListReading.addEventListener('click', (e) => { const item = e.target.closest('.surah-item'); if (item) handleSurahTextDisplay(item.dataset.surahNumber, item); });
    const handleAudioPlay = (e) => { const card = e.target.closest('.item-card'); if (!card || card.classList.contains('locked')) return; (activePlayableItem === card && !audioPlayer.paused) ? stopPlayback() : playAudio(card.dataset.url || `${selectedMoshaf.server}${String(card.dataset.surahNumber).padStart(3, '0')}.mp3`, card.dataset.type, card); };
    surahListListening.addEventListener('click', handleAudioPlay);
    radioList.addEventListener('click', handleAudioPlay);
    ayahContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button'); if (!target) return;
        const action = target.dataset.action; const ayahDiv = target.closest('.ayah');
        if (target.classList.contains('full-surah-play-btn')) { const surahItem = surahListListening.querySelector(`[data-surah-number="${target.dataset.surahNumber}"]`); if (surahItem) handleAudioPlay({ target: surahItem }); }
        if (action === 'play') { playAudio(`https://cdn.islamic.network/quran/audio/128/${selectedReciter?.identifier || 'ar.alafasy'}/${target.dataset.ayahNumber}.mp3`, 'single-ayah'); }
        if (action === 'copy') { const arabic = ayahDiv.querySelector('.ayah-text-arabic').textContent; const english = ayahDiv.querySelector('.ayah-text-english').textContent; navigator.clipboard.writeText(`${arabic}\n${english}`); target.style.color = 'var(--accent-gold)'; setTimeout(() => target.style.color = '', 1000); }
        if (action === 'bookmark') { const { surahNumber, surahName, ayahInSurah } = ayahDiv.dataset; const arabicText = ayahDiv.querySelector('.ayah-text-arabic').textContent; const englishText = ayahDiv.querySelector('.ayah-text-english').textContent; handleBookmarkClick(surahNumber, ayahInSurah, arabicText, englishText, surahName); target.classList.toggle('bookmarked'); }
        if (action === 'tafsir') { const tafsirContent = ayahDiv.querySelector('.tafsir-content'); const wasVisible = tafsirContent.classList.contains('visible'); document.querySelectorAll('.tafsir-content.visible, .ayah-action-btn[data-action="tafsir"].active').forEach(el => el.classList.remove('visible', 'active')); if (!wasVisible) { tafsirContent.classList.add('visible'); target.classList.add('active'); } }
    });
    mainPlayBtn.addEventListener('click', () => { if (audioPlayer.src && audioPlayer.src !== '') { audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause(); }});
    audioPlayer.addEventListener('play', () => { if (activePlayableItem) { mainPlayBtn.innerHTML = ICONS.pause; const btn = activePlayableItem.querySelector('.item-card-play-btn'); if (btn) btn.innerHTML = ICONS.pause; } });
    audioPlayer.addEventListener('pause', () => { if (activePlayableItem) { mainPlayBtn.innerHTML = ICONS.play; const btn = activePlayableItem.querySelector('.item-card-play-btn'); if (btn) btn.innerHTML = ICONS.play; } });
    audioPlayer.addEventListener('ended', stopPlayback);
    audioPlayer.addEventListener('timeupdate', () => { if (isDragging) return; const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100; document.getElementById('current-time').textContent = formatTime(audioPlayer.currentTime); document.getElementById('seek-bar-progress').style.width = `${progress}%`; seekThumb.style.left = `${progress}%`; });
    const seek = (e) => { if (isNaN(audioPlayer.duration)) return; const rect = seekBarContainer.getBoundingClientRect(); const percentage = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1); audioPlayer.currentTime = audioPlayer.duration * percentage; };
    seekBarContainer.addEventListener('mousedown', (e) => { isDragging = true; seek(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) seek(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });
    const filterList = (input, populator, list, primaryProp, secondaryProp) => { const term = input.value.toLowerCase(); populator(list.filter(item => (item[primaryProp] && item[primaryProp].toLowerCase().includes(term)) || (item[secondaryProp] && item[secondaryProp].toLowerCase().includes(term)) || (item.number && item.number.toString().includes(term)) || (item.id && item.id.toString().includes(term)))); };
    surahSearchInput.addEventListener('input', () => filterList(surahSearchInput, populateSurahReadingList, allSuwarText, 'name', 'englishName'));
    listeningSearchInput.addEventListener('input', () => filterList(listeningSearchInput, populateSurahListeningList, allSuwarAudio));
    radioSearchInput.addEventListener('input', () => filterList(radioSearchInput, populateRadioList, allRadios));
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => { scrollTopBtn.classList.toggle('visible', window.scrollY > 300); });
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('#submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = TRANSLATIONS[currentLang].submitting || 'Submitting...';

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(new FormData(form)).toString(),
        })
        .then(() => {
            formSuccessMessage.classList.add('active');
            form.reset();
            setTimeout(() => formSuccessMessage.classList.remove('active'), 5000);
        })
        .catch((error) => alert('Sorry, there was an error submitting your form. Please try again.'))
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });
    });
    fontSizeSlider.addEventListener('input', (e) => applyFontSize(e.target.value));
    fontTypeSelect.addEventListener('change', (e) => applyFontFamily(e.target.value));
    bookmarksList.addEventListener('click', (e) => { const btn = e.target.closest('.bookmark-remove-btn'); if(btn) { const id = btn.dataset.id; const existingIndex = bookmarks.findIndex(b => b.id === id); if (existingIndex > -1) { bookmarks.splice(existingIndex, 1); saveBookmarks(); populateBookmarksView(); const [surahNumber, ayahInSurah] = id.split(':'); const ayahDiv = ayahContainer.querySelector(`[data-surah-number="${surahNumber}"][data-ayah-in-surah="${ayahInSurah}"]`); if (ayahDiv) { ayahDiv.querySelector('[data-action="bookmark"]').classList.remove('bookmarked'); } } } });
    toggleSettingsBtn.addEventListener('click', (e) => { settingsWrapper.classList.toggle('visible'); e.currentTarget.classList.toggle('active', settingsWrapper.classList.contains('visible')); });

    // --- Initialization ---
    function init() {
        applyTheme(currentTheme);
        loadBookmarks();
        applyLanguage(currentLang);
        handleRouteChange(); // Handle initial route
        mainPlayBtn.innerHTML = ICONS.play;
        scrollTopBtn.innerHTML = ICONS.upArrow;
        toggleSettingsBtn.innerHTML = ICONS.settings;
        fontSizeSlider.value = currentFontSize;
        fontTypeSelect.value = currentFontFamily;
        applyFontSize(currentFontSize);
        applyFontFamily(currentFontFamily);
    }
    
    init();
});
