const API_KEY = '7ea9e3fe77c67f4baecc1958847a2ea6'; // ← PUT YOUR KEY HERE
const GRID = document.getElementById('grid');
const MODAL = document.getElementById('modal');
const SEARCH = document.getElementById('search');
const OUTPUT = document.getElementById('output');
const LOADING = document.getElementById('loading');
const ERROR_MSG = document.getElementById('error-msg');
const SOURCE_LIST = document.getElementById('source-list');
const EPISODE_SELECTOR = document.getElementById('episode-selector');
const SEASON_TABS = document.getElementById('season-tabs');
const EPISODE_LIST = document.getElementById('episode-list');

let currentShow = null;
let currentSeason = 1;
let currentEpisode = 1;
let currentTMDBId = null;
let currentType = 'movie';
let activeProvider = 'vidrock';

// EVERY SOURCE (VidRock Primary, then everything else)
const PROVIDERS = [
    { name: 'VidRock (Primary)', id: 'vidrock', base: 'https://vidrock.to' },
    { name: 'VidSrc (Main)', id: 'vidsrc_to', base: 'https://vidsrc.to' },
    { name: 'VidSrc (Backup)', id: 'vidsrc_me', base: 'https://vidsrc.me' },
    { name: 'VidSrc (Alt)', id: 'vidsrc_cc', base: 'https://vidsrc.cc' },
    { name: 'VidSrc (V2)', id: 'vidsrc_v2', base: 'https://vidsrc.xyz' },
    { name: 'Embed.su', id: 'embed_su', base: 'https://embed.su' },
    { name: 'Embed.su (Alt)', id: 'embed_su_alt', base: 'https://embedsu.cc' },
    { name: '2Embed', id: '2embed', base: 'https://2embed.cc' },
    { name: '2Embed (Alt)', id: '2embed_alt', base: 'https://2embed.to' },
    { name: 'MultiEmbed', id: 'multiembed', base: 'https://multiembed.mov' },
    { name: 'MultiEmbed (V2)', id: 'multiembed_v2', base: 'https://multiembed.cc' },
    { name: 'MoviesAPI', id: 'moviesapi', base: 'https://moviesapi.club' },
    { name: 'MoviesAPI (Alt)', id: 'moviesapi_alt', base: 'https://moviesapi.cc' },
    { name: 'AutoEmbed', id: 'autoembed', base: 'https://autoembed.co' },
    { name: 'AutoEmbed (Alt)', id: 'autoembed_alt', base: 'https://autoembed.cc' },
    { name: 'SuperEmbed', id: 'superembed', base: 'https://multiembed.mov' },
    { name: 'SuperEmbed (V2)', id: 'superembed_v2', base: 'https://superembed.cc' },
    { name: 'VidCloud', id: 'vidcloud', base: 'https://vidcloud.icu' },
    { name: 'VidCloud (Alt)', id: 'vidcloud_alt', base: 'https://vidcloud.to' },
    { name: 'UpCloud', id: 'upcloud', base: 'https://upcloud.pro' },
    { name: 'UpCloud (Alt)', id: 'upcloud_alt', base: 'https://upcloud.cc' },
    { name: 'VidPlay', id: 'vidplay', base: 'https://vidplay.online' },
    { name: 'VidPlay (Alt)', id: 'vidplay_alt', base: 'https://vidplay.to' },
    { name: 'VidFast', id: 'vidfast', base: 'https://vidfast.pro' },
    { name: 'VidFast (Alt)', id: 'vidfast_alt', base: 'https://vidfast.cc' },
    { name: 'VidCore', id: 'vidcore', base: 'https://vidcore.to' },
    { name: 'VidCore (Alt)', id: 'vidcore_alt', base: 'https://vidcore.cc' },
    { name: 'VidBolt', id: 'vidbolt', base: 'https://vidbolt.com' },
    { name: 'VidBolt (Alt)', id: 'vidbolt_alt', base: 'https://vidbolt.cc' },
    { name: 'Fmov', id: 'fmov', base: 'https://fmov.to' },
    { name: 'Fmov (Alt)', id: 'fmov_alt', base: 'https://fmov.cc' },
    { name: 'PrimeSRC', id: 'primesrc', base: 'https://primesrc.to' },
    { name: 'PrimeSRC (Alt)', id: 'primesrc_alt', base: 'https://primesrc.cc' },
    { name: 'CinemaOS', id: 'cinemaos', base: 'https://cinemaos.to' },
    { name: 'CinemaOS (Alt)', id: 'cinemaos_alt', base: 'https://cinemaos.cc' },
    { name: '0vidads', id: '0vidads', base: 'https://0vidads.com' },
    { name: '0vidads (Alt)', id: '0vidads_alt', base: 'https://0vidads.cc' },
    { name: 'StreamHub', id: 'streamhub', base: 'https://streamhub.to' },
    { name: 'StreamHub (Alt)', id: 'streamhub_alt', base: 'https://streamhub.cc' },
    { name: 'MovieHunt', id: 'moviehunt', base: 'https://moviehunt.to' },
    { name: 'MovieHunt (Alt)', id: 'moviehunt_alt', base: 'https://moviehunt.cc' },
    { name: 'CineFlow', id: 'cineflow', base: 'https://cineflow.to' },
    { name: 'CineFlow (Alt)', id: 'cineflow_alt', base: 'https://cineflow.cc' },
    { name: 'StreamVault', id: 'streamvault', base: 'https://streamvault.to' },
    { name: 'StreamVault (Alt)', id: 'streamvault_alt', base: 'https://streamvault.cc' },
    { name: 'FilmWave', id: 'filmwave', base: 'https://filmwave.to' },
    { name: 'FilmWave (Alt)', id: 'filmwave_alt', base: 'https://filmwave.cc' },
    { name: 'MediaPlex', id: 'mediaplex', base: 'https://mediaplex.to' },
    { name: 'MediaPlex (Alt)', id: 'mediaplex_alt', base: 'https://mediaplex.cc' }
];

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

async function searchTMDB(query, type = 'movie') {
    const url = type === 'movie' 
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
        : `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        renderGrid(data.results, type);
    } catch (e) { console.error('TMDB error:', e); }
}

function renderGrid(items, type) {
    GRID.innerHTML = '';
    items.forEach(item => {
        if (!item.poster_path) return;
        const title = type === 'movie' ? item.title : item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
            <h3>${title}</h3>
            <div class="year">${year}</div>
        `;
        card.onclick = () => openModal(item, type);
        GRID.appendChild(card);
    });
}

function getEmbedUrl(providerId, tmdbId, season, episode) {
    const provider = PROVIDERS.find(p => p.id === providerId) || PROVIDERS[0];
    const base = provider.base;
    
    // Most providers use the same structure, with minor variations
    if (currentType === 'movie') {
        // Special cases
        if (providerId === 'vidsrc_me' || providerId === 'vidsrc_cc' || providerId === 'vidsrc_v2') {
            return `${base}/embed/movie?tmdb=${tmdbId}`;
        }
        if (providerId === 'multiembed' || providerId === 'multiembed_v2' || providerId === 'superembed' || providerId === 'superembed_v2') {
            return `${base}/?video_id=${tmdbId}&tmdb=1`;
        }
        if (providerId === 'moviesapi' || providerId === 'moviesapi_alt' || providerId === 'autoembed' || providerId === 'autoembed_alt') {
            return `${base}/movie/${tmdbId}`;
        }
        // Default structure for most providers
        return `${base}/embed/movie/${tmdbId}`;
    } else {
        // TV shows
        if (providerId === 'vidsrc_me' || providerId === 'vidsrc_cc' || providerId === 'vidsrc_v2') {
            return `${base}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
        }
        if (providerId === 'multiembed' || providerId === 'multiembed_v2' || providerId === 'superembed' || providerId === 'superembed_v2') {
            return `${base}/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
        }
        if (providerId === 'moviesapi' || providerId === 'moviesapi_alt') {
            return `${base}/tv/${tmdbId}-${season}-${episode}`;
        }
        if (providerId === 'autoembed' || providerId === 'autoembed_alt') {
            return `${base}/tv/${tmdbId}/${season}/${episode}`;
        }
        // Default structure
        return `${base}/embed/tv/${tmdbId}/${season}/${episode}`;
    }
}

function playStream(url) {
    LOADING.classList.remove('hidden');
    ERROR_MSG.classList.add('hidden');
    OUTPUT.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allowFullscreen = true;
    iframe.allow = "encrypted-media; autoplay; clipboard-write";
    
    iframe.onerror = () => {
        LOADING.classList.add('hidden');
        ERROR_MSG.classList.remove('hidden');
    };

    setTimeout(() => {
        LOADING.classList.add('hidden');
    }, 4000);
    
    OUTPUT.appendChild(iframe);
}

function displaySourceButtons() {
    SOURCE_LIST.innerHTML = '';
    
    PROVIDERS.forEach((provider) => {
        const btn = document.createElement('button');
        btn.className = 'source-btn';
        btn.innerText = provider.name;
        btn.dataset.id = provider.id;
        
        if (provider.id === activeProvider) btn.classList.add('active');
        
        btn.onclick = () => {
            activeProvider = provider.id;
            document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const url = getEmbedUrl(activeProvider, currentTMDBId, currentSeason, currentEpisode);
            playStream(url);
        };
        SOURCE_LIST.appendChild(btn);
    });
    
    const url = getEmbedUrl(activeProvider, currentTMDBId, currentSeason, currentEpisode);
    playStream(url);
}

async function getShowDetails(tvId) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`);
    return await res.json();
}

async function renderEpisodeSelector(show) {
    const details = await getShowDetails(show.id);
    currentShow = show;
    currentTMDBId = show.id;
    currentSeason = 1;
    currentEpisode = 1;
    
    SEASON_TABS.innerHTML = '';
    details.seasons.forEach(season => {
        if (season.season_number === 0) return;
        
        const tab = document.createElement('button');
        tab.className = 'season-tab' + (season.season_number === 1 ? ' active' : '');
        tab.textContent = `Season ${season.season_number}`;
        tab.onclick = () => selectSeason(season.season_number, details.seasons);
        SEASON_TABS.appendChild(tab);
    });
    
    selectSeason(1, details.seasons);
    EPISODE_SELECTOR.classList.remove('hidden');
}

async function selectSeason(seasonNum, seasons) {
    currentSeason = seasonNum;
    currentEpisode = 1;
    
    document.querySelectorAll('.season-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === `Season ${seasonNum}`) tab.classList.add('active');
    });
    
    const season = seasons.find(s => s.season_number === seasonNum);
    if (!season) return;
    
    const res = await fetch(`https://api.themoviedb.org/3/tv/${currentShow.id}/season/${seasonNum}?api_key=${API_KEY}`);
    const seasonData = await res.json();
    
    EPISODE_LIST.innerHTML = '';
    seasonData.episodes.forEach(ep => {
        const btn = document.createElement('button');
        btn.className = 'episode-btn';
        btn.textContent = `E${ep.episode_number}: ${ep.name}`;
        btn.onclick = () => selectEpisode(ep.episode_number);
        EPISODE_LIST.appendChild(btn);
    });
    
    selectEpisode(1);
}

function selectEpisode(episodeNum) {
    currentEpisode = episodeNum;
    
    document.querySelectorAll('.episode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.startsWith(`E${episodeNum}:`)) btn.classList.add('active');
    });
    
    const url = getEmbedUrl(activeProvider, currentTMDBId, currentSeason, currentEpisode);
    playStream(url);
}

async function openModal(item, type) {
    currentType = type;
    currentTMDBId = item.id;
    currentSeason = 1;
    currentEpisode = 1;
    activeProvider = 'vidrock';
    
    const title = type === 'movie' ? item.title : item.name;
    
    document.getElementById('m-title').innerText = title;
    document.getElementById('m-plot').innerText = item.overview;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    
    SOURCE_LIST.innerHTML = '';
    OUTPUT.innerHTML = '';
    LOADING.classList.remove('hidden');
    ERROR_MSG.classList.add('hidden');
    EPISODE_SELECTOR.classList.add('hidden');
    
    if (type === 'movie') {
        displaySourceButtons();
    } else {
        await renderEpisodeSelector(item);
        displaySourceButtons();
    }
    
    MODAL.classList.remove('hidden');
}

document.getElementById('close').onclick = () => {
    MODAL.classList.add('hidden');
    OUTPUT.innerHTML = '';
};

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.type;
        searchTMDB(SEARCH.value || 'avengers', type);
    };
});

SEARCH.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const type = document.querySelector('.nav-btn.active').dataset.type;
        searchTMDB(e.target.value, type);
    }
});

searchTMDB('avengers', 'movie');
