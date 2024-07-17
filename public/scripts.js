$(document).ready(function() {
    $.getJSON('/library.json', function(library) {
        const libraryContainer = $('#library-container');
        library.forEach(item => {
            const card = `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Author: ${item.author}</h6>
                            <a href="${item.url}" class="btn btn-light-blue" target="_blank">View Song</a>
                        </div>
                    </div>
                </div>
            `;
            libraryContainer.append(card);
        });
    }).fail(function() {
        alert("Failed to load library.json");
    });
});
