document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const playlistElement = document.getElementById('playlist');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    let fullPlaylist = [];

    // Obtener la lista M3U
    const m3uUrl = 'Listas.m3u';
    
    fetch(m3uUrl)
        .then(response => response.text())
        .then(data => {
            fullPlaylist = parseM3U(data);
            displayPlaylist(fullPlaylist);
        })
        .catch(error => console.error('Error al cargar la lista M3U:', error));

    // Función para analizar el contenido del archivo M3U
    function parseM3U(data) {
        const lines = data.split('\n');
        const list = [];
        let currentItem = {};

        for (const line of lines) {
            if (line.startsWith('#EXTINF:')) {
                const titleMatch = line.match(/#EXTINF:.*,(.*)/);
                currentItem.title = titleMatch ? titleMatch[1].trim() : 'Desconocido';
            } else if (line.startsWith('http')) {
                currentItem.url = line.trim();
                currentItem.category = categorizeItem(currentItem.title, currentItem.url);
                list.push(currentItem);
                currentItem = {};
            }
        }
        return list;
    }

    // Función para categorizar el contenido
    function categorizeItem(title, url) {
        if (url.includes('series')) {
            return 'series';
        }
        if (url.includes('movie')) {
            return 'peliculas';
        }
        return 'canales';
    }

    // Función para mostrar la lista en la interfaz
    function displayPlaylist(listToShow) {
        playlistElement.innerHTML = '';
        listToShow.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.title;
            li.dataset.url = item.url;
            li.dataset.category = item.category;

            li.addEventListener('click', () => {
                const videoUrl = li.dataset.url;
                
                // Limpiar cualquier instancia anterior de HLS.js
                if (window.hlsInstance) {
                    window.hlsInstance.destroy();
                }

                // Verificar si la URL termina en .m3u8 o es un canal
                if (videoUrl.endsWith('.m3u8') || item.category === 'canales') {
                    // Usar hls.js para los canales/streams
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(videoUrl);
                        hls.attachMedia(player);
                        window.hlsInstance = hls; // Guardar la instancia para poder destruirla
                    } else {
                        // Si el navegador no soporta HLS.js
                        player.src = videoUrl;
                    }
                } else {
                    // Usar el reproductor nativo para películas y series (archivos directos)
                    player.src = videoUrl;
                }
                
                player.play();
            });

            playlistElement.appendChild(li);
        });
    }

    // Lógica para la búsqueda rápida
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredList = fullPlaylist.filter(item => 
            item.title.toLowerCase().includes(searchTerm)
        );
        displayPlaylist(filteredList);
    });

    // Lógica para los filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterType = button.dataset.filter;
            if (filterType === 'all') {
                displayPlaylist(fullPlaylist);
            } else {
                const filteredList = fullPlaylist.filter(item => item.category === filterType);
                displayPlaylist(filteredList);
            }
        });
    });
});