const LIBRARY_PATH = './assets/data/library.json';

function getCardHTML(thumbnail = '1.jpg', artist = 'Unknown Artist', album = 'Unknown Album') {
    return `
    <div class="col-xl-2 col-md-3 col-sm-6 col-12 mb-4 d-flex">
        <div class="card">
            <img src="./assets/img/${thumbnail}" class="card-img-top" alt="Album cover">
            <div class="card-body">
                <h5 class="card-title">${artist}</h5>
                <p class="card-text">${album}</p>
            </div>
            <div class="card-footer text-center">
                <button type="button" class="btn btn-primary">
                    Tracklist
                </button>
            </div>
        </div>
    </div>
    `
}

function openModal(title, body) {
    const modal = document.getElementById('exampleModal');
    const mTitle = modal.querySelector('.modal-title');
    const mBody = modal.querySelector('.modal-body');

    mTitle.textContent = title;
    mBody.innerHTML = body;

    const bModal = new bootstrap.Modal(modal);
    bModal.show();
}

window.onload = function () {
    fetch(LIBRARY_PATH)
        .then(response => {
            if (!response.ok)
                throw new Error(`library.json Failed to load, ${response.status}`);

            return response.json();
        })
        .then(data => {
            const albumContainer = document.getElementById('albumContainer');

            data.forEach(entry => {
                albumContainer.insertAdjacentHTML('beforeend', getCardHTML(entry.thumbnail, entry.artist, entry.album));

                const element = albumContainer.lastElementChild;
                if (element) {
                    const btn = element.querySelector('.card-footer button');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            const title = `${entry.artist} - ${entry.album}`;
                            const body = `<ul>${entry.tracklist.map(track => `<li>${track.number}. <a href="${track.url}">${track.title}</a></li>`).join('')}</ul>`;
                            openModal(title, body);
                        });
                    }
                }
            });
        })
        .catch(error => {
            console.log(`library.json failed to load, ${error}`);
        })
}