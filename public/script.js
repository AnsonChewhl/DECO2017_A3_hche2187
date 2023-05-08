// Functions to call when the page finishes loading
document.addEventListener('DOMContentLoaded', function() {
    displayMovie();
    sectionOffsetCheck();
});

// Nav-bar animation
// Create a variable to reference the toggle <button>
var navbarToggle = navbar.querySelector("#navbar-toggle");

// Create a variable to reference the nav menu container <div>
var navbarMenu = document.querySelector("#navbar-menu");

// Create a variable to reference the <ul> list of nav links
var navbarLinksContainer = navbarMenu.querySelector(".navbar-links");

// Add or remove the 'active' class on the toggle <button> when clicked
navbarToggle.addEventListener("click", () => {navbarToggle.classList.toggle('active')});

// Remove the 'active' class on the menu container <div> when clicked 
// This will close the menu if the user clicks outside the nav link <ul>
navbarMenu.addEventListener("click", () => {navbarToggle.classList.remove('active')});

// Stop clicks on the navbar links from toggling the menu (for when it's not mobile)
navbarLinksContainer.addEventListener("click", (e) => e.stopPropagation());

// Function for the nav bar current selection underliner
const allNavLinks = document.querySelectorAll(".navbar-link");
const allSections = document.querySelectorAll(".main-section"); // Selecting all the key section headers
let sectionOffset = [0, 0, 0, 0];
let currentSection = 0;

// A function that recorded all sections' offset position
function sectionOffsetCheck() {
    for (var i = 0; i < 4; i++){
        sectionOffset[i] = allSections[i].offsetTop;
        // console.log(i + ": " + allSections[i].offsetTop);
    }
}

window.onscroll = function(event) {
    // console.log(window.pageYOffset);
    for (var i = 0; i < 4; i++){
        // Check whether the scroll position arrived a new section
        if (window.pageYOffset >= sectionOffset[i] && i != currentSection) {
            // Change the id attribute to restyle the nav bar and current selection
            allNavLinks[currentSection].removeAttribute("id");
            allNavLinks[i].setAttribute("id", "current-section");
            currentSection = i;
        }
    }
};

// A function that will be triggered when the users submit the new movie form
// Submit function has to be added to the form instead of the button: https://stackoverflow.com/questions/32637920/why-does-a-submit-event-listener-not-work-on-a-submit-button
const form = document.getElementById('movie-form');
form.addEventListener("submit", function(event){
    event.preventDefault();

    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    movieLst.push(getMovieDetails());
    movieLst.sort(watchedDateOrder);
    localStorage.setItem('movieLst', JSON.stringify(movieLst));
    console.log(JSON.parse(localStorage.getItem('movieLst')));
    form.reset();

    displayMovie();

    let url = window.location.href;
    if (url.indexOf("#") != -1) {url = url.split('#')[0]}
    window.location.href = url + "#history";
});

function getMovieDetails() {
    const movieName = document.querySelector('input[name="movieName"]').value;
    const movieGenre = document.querySelector('input[name="movieGenre"]').value;
    const watchedDate = document.querySelector('input[name="watchedDate"]').value;
    const movieDuration = document.querySelector('input[name="movieDuration"]').value;
    const movieRating = document.querySelector('input[name="rating"]:checked').value;
    const movieComment = document.querySelector('input[name="movieComment"]').value;
    const uid = generateUUID();

    // Get date function https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/
    const date = new Date();
    let d = date.getDate();
    let m = date.getMonth() + 1;
    let y = date.getFullYear();
    const commentDate = `${d}/${m}/${y}`;

    const movie = {movieName: movieName, movieGenre: movieGenre, watchedDate: watchedDate, 
        movieDuration: movieDuration, movieRating: movieRating, movieComment: movieComment, 
        commentDate: commentDate, uid: uid}
    
    return movie
}

// A function that helps to sort the objects by their watched date https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function watchedDateOrder(a, b) {
    if ( a.watchedDate < b.watchedDate ){
      return 1;
    }
    if ( a.watchedDate > b.watchedDate ){
      return -1;
    }
    return 0;
}

// Use to generate a unique set of id for the objects, which makes the tracking process easier
function generateUUID() {
    let uuid = '';
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    randomValues[6] &= 0x0f;
    randomValues[6] |= 0x40;
    randomValues[8] &= 0x3f;
    randomValues[8] |= 0x80;
    uuid += randomValues.slice(0, 4).join('');
    uuid += '-';
    uuid += randomValues.slice(4, 6).join('');
    uuid += '-';
    uuid += randomValues.slice(6, 8).join('');
    uuid += '-';
    uuid += randomValues.slice(8, 10).join('');
    uuid += '-';
    uuid += randomValues.slice(10).join('');
    return uuid;
}

function displayMovie() {
    const historyLst = document.getElementById('history-lst');
    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];

    while (historyLst.firstChild) historyLst.removeChild(historyLst.firstChild); // Removing all childs

    if (movieLst.length < 1) {
        let notice = document.createElement("h3");
        notice.setAttribute("id", "notice");
        notice.innerText = "You have not yet added any movie...";
        historyLst.appendChild(notice);
        return;
    }

    movieLst.forEach(movie => {
        let parentDiv = document.createElement("div");
        parentDiv.setAttribute("id", movie.uid);
        historyLst.appendChild(parentDiv);

        let gridDiv = document.createElement("div");
        gridDiv.setAttribute("class", "history-info");
        parentDiv.appendChild(gridDiv);

        const movieGenre = movie.movieGenre;
        let movieImg = document.createElement("img");
        movieImg = setGenreIcon(movieImg, movie.movieGenre.toLowerCase());
        gridDiv.appendChild(movieImg);

        let movieDetails = document.createElement("div");
        movieDetails.setAttribute("class", "movie-details");
        gridDiv.appendChild(movieDetails);

        let movieName = document.createElement("h5");
        movieName.setAttribute("class", "movie-name");
        movieName.innerText = movie.movieName;
        movieDetails.appendChild(movieName);
        
        let watchedDate = document.createElement("h5");
        watchedDate.setAttribute("class", "movie-watched-date");
        watchedDate.innerHTML = `${movie.watchedDate} <span>watched</span>`;
        movieDetails.appendChild(watchedDate);

        let hr = Math.floor(movie.movieDuration / 60);
        let min = movie.movieDuration % 60;
        let movieDuration = document.createElement("h5");
        movieDuration.setAttribute("class", "movie-length");
        movieDuration.innerText = `${hr}hr ${min}min`;
        movieDetails.appendChild(movieDuration);

        let movieRatingContainer = document.createElement("div");
        movieRatingContainer.setAttribute("class", "movie-rating");
        movieDetails.appendChild(movieRatingContainer);

        for (let i = 0; i < 5; i++) {
            let movieRating = document.createElement("span");
            if (i < movie.movieRating) movieRating.setAttribute("class", "fa fa-star rating-checked");
            else movieRating.setAttribute("class", "fa fa-star");
            movieRatingContainer.appendChild(movieRating);
        }

        let movieComment = document.createElement("h5");
        movieComment.setAttribute("class", "movie-comment");
        movieComment.innerHTML = `&quot${movie.movieComment}&quot <span> - commented ${movie.commentDate}</span>`;
        movieDetails.appendChild(movieComment);

        let deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("class", "delete-btn");
        deleteBtn.addEventListener("click", removeMovie.bind(null, deleteBtn)); // Add functionality to the delete btn using bind https://stackoverflow.com/questions/21616393/javascript-event-listener-firing-on-page-load-not-click-event
        gridDiv.appendChild(deleteBtn);

        let deleteBtnImg = document.createElement("img");
        deleteBtnImg.setAttribute("src", "image/section_history/delete-btn.png");
        deleteBtnImg.setAttribute("alt", "A bin icon that represents deletion");
        deleteBtn.appendChild(deleteBtnImg);

        let seperateLine = document.createElement("span");
        seperateLine.setAttribute("class", "seperate-line");
        parentDiv.appendChild(seperateLine);
    });

    // Re-calculate the offset position of each section
    sectionOffsetCheck();
}

const mainGenre = ["action", "adventure", "comedy", "fantasy", "horror", "romance", "sci-fi", "war"];
function setGenreIcon(img, genre) {
    img.setAttribute("class", "movie-img");

    if (mainGenre.includes(genre)){
        img.setAttribute("src", `image/section_history/icons/${genre.toLowerCase()}.png`);
        img.setAttribute("alt", "An icon that represents the genre of the movie");
    } else {
        img.setAttribute("src", `image/section_history/icons/other.png`);
        img.setAttribute("alt", "An icon with a unpacked box and question mark in the middle");
    }

    return img
}

let showAll = false;
const showAllBtn = document.getElementById('show-all-btn');
showAllBtn.addEventListener("click", () => {
    const history = document.getElementById('history');

    if (!showAll) {
        showAllBtn.innerText = "Show Less"
        history.style.maxHeight = "none";
        history.style.overflow = "visible";
        showAll = true;
    } else {
        showAllBtn.innerText = "Show All"
        history.style.maxHeight = "100vh";
        history.style.overflow = "hidden";
        showAll = false;
    }
})

function clearHistory() {
    // Confirmation panel for destructive action https://www.codexworld.com/how-to/show-delete-confirmation-message-dialog-javascript/
    var confirmation = confirm("Are you sure to clear ALL the history?");

    if(confirmation){
        localStorage.removeItem('movieLst');
        displayMovie();
    }
}

function removeMovie(obj) {
    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    let id = obj.parentNode.parentNode.id;

    for (var i = 0; i < movieLst.length; i++){
        if (movieLst[i].uid == id) {
            movieLst.splice(i, 1);
            console.log("Movie has been removed");
            break;
        }
    }

    localStorage.setItem('movieLst', JSON.stringify(movieLst));
    console.log(JSON.parse(localStorage.getItem('movieLst')));

    displayMovie();
}

movieData();
function movieData() {
    const movieLst = JSON.parse(localStorage.getItem('movieLst'));

    var allGenre = [];
    movieLst.forEach(movie => {
        var genre = movie.movieGenre;
        allGenre.push(genre);
    });

    let data = [];
    let unique = allGenre.filter(onlyUnique)
    for (var i = 0; i < unique.length; i++) {
        var newGenre = {genre: unique[i], totalDuration: 0, totalRating: 0, watchTime: 0};
        data.push(newGenre);
    }

    movieLst.forEach(movie => {
        var genre = movie.movieGenre;
        var duration = movie.movieDuration;
        var rating = movie.movieRating;

        for (var i = 0; i < data.length; i++) {
            if (genre == data[i].genre) {
                data[i].totalDuration += Number(duration);
                data[i].totalRating += Number(rating);
                data[i].watchTime += 1;
                break;
            }
        }
    });

    let favGenre = checkFavGenre(data)[0];
    let favRating = checkFavGenre(data)[1];
}

// Filtering unique value https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

function checkFavGenre(data) {
    let lst = []
    for (var i = 0; i < data.length; i++) {
        var avgRating = data[i].totalRating / data[i].watchTime;
        lst.push(avgRating);
    }

    // Check max number index in the data array https://stackoverflow.com/questions/22911722/how-to-find-array-index-of-largest-value
    let maxAt = 0;
    for (var i = 0; i < lst.length; i++) {
        maxAt = lst[i] > lst[maxAt] ? i : maxAt;
    }

    let fav = [data[maxAt].genre, lst[maxAt]];
    return fav;
}