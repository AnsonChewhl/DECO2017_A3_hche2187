const allNavLinks = document.querySelectorAll(".navbar-link");
const allSections = document.querySelectorAll(".main-section"); // Selecting all the key section headers
let sectionOffset = [0, 0, 0, 0];
let currentSection = 0;

const form = document.getElementById('movie-form');

let showAll = false;
const showAllBtn = document.getElementById('show-all-btn');

const mainGenre = ["action", "adventure", "comedy", "fantasy", "horror", "romance", "sci-fi", "war"];





// Functions to call when the page finishes loading
document.addEventListener('DOMContentLoaded', function () {
    navbarAnimation();
    contentUpdate();
});

window.onscroll = function (event) {
    // console.log(window.pageYOffset);

    const totalSections = sectionOffset.length;
    for (var i = 0; i < totalSections; i++) {
        // Check whether the scroll position arrived a new section
        if (window.pageYOffset >= sectionOffset[i] && i != currentSection) {
            // Function for the nav bar current selection underliner
            // Change the id attribute to restyle the nav bar and current selection
            allNavLinks[currentSection].removeAttribute("id");
            allNavLinks[i].setAttribute("id", "current-section");
            currentSection = i;
        }
    }

    // Check if the users have reached the bottom part inspired by https://stackoverflow.com/questions/3898130/check-if-a-user-has-scrolled-to-the-bottom-not-just-the-window-but-any-element
    // The concept was made to deal with the situation which the last section is less than 100vh
    var lastSectionHeight = document.body.scrollHeight - sectionOffset[totalSections - 1];
    var lastSectionPoint = document.body.scrollHeight - window.innerHeight; // The whole document height minus the viewport height
    if (window.pageYOffset + lastSectionHeight == lastSectionHeight + lastSectionPoint) {
        allNavLinks[currentSection].removeAttribute("id");
        allNavLinks[totalSections - 1].setAttribute("id", "current-section");
        currentSection = totalSections - 1;
    }
};

function contentUpdate() {
    displayMovie();
    plotData();
    sectionOffsetCheck(); // Re-calculate the offset position of each section
}





// Main functions
function displayMovie() {
    const historyLst = document.getElementById('history-lst');
    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];

    removeChilds(historyLst);

    if (movieLst.length < 1) {
        let notice = document.createElement("h3");
        notice.setAttribute("class", "notice");
        notice.innerText = "You have not yet added any movie...";
        historyLst.appendChild(notice);
    } else {
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
    }
}

function plotData() {
    const movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    const profileData = document.getElementById('profile-data');
    const profileDataNone = document.getElementById('profile-data-none');
    const favMovie = favData(movieLst);

    if (movieLst.length < 1) {
        profileData.style.display = "none";
        profileDataNone.style.display = "block";
    } else {
        profileData.style.display = "flex";
        profileDataNone.style.display = "none";
        movieWeekPlot(movieLst);;
        favGenreRating(favMovie);
    }

    favRecommendation(favMovie);
}





// Sub functions
// A function that recorded all sections' offset position
function sectionOffsetCheck() {
    for (var i = 0; i < 4; i++) {
        sectionOffset[i] = allSections[i].offsetTop;
        // console.log(i + ": " + allSections[i].offsetTop);
    }
}

function getMovieDetails() {
    const movieName = document.querySelector('input[name="movieName"]').value;
    const movieGenre = document.querySelector('input[name="movieGenre"]').value;
    const watchedDate = document.querySelector('input[name="watchedDate"]').value;
    const movieDuration = document.querySelector('input[name="movieDuration"]').value;
    const movieRating = document.querySelector('input[name="rating"]:checked').value;
    const movieComment = document.querySelector('input[name="movieComment"]').value;
    const uid = generateUUID();

    const day = getDate(0);
    const commentDate = `${day[0]}/${day[1]}/${day[2]}`

    const movie = {
        movieName: movieName, movieGenre: movieGenre, watchedDate: formatDate(watchedDate),
        movieDuration: movieDuration, movieRating: movieRating, movieComment: movieComment,
        commentDate: commentDate, uid: uid
    }

    return movie
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

// Function to format date to dd/mm/yyyy https://stackoverflow.com/questions/2086744/javascript-function-to-convert-date-yyyy-mm-dd-to-dd-mm-yy
function formatDate (date) {
    var datePart = date.match(/\d+/g);
    year = datePart[0];
    month = datePart[1];
    day = datePart[2];
  
    return day+'/'+month+'/'+year;
}

function getDate(day) {
    // Get date function https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/
    const date = new Date();

    // Get yesterday date https://stackoverflow.com/questions/5511323/calculate-the-date-yesterday-in-javascript
    date.setDate(date.getDate() - day);

    // Return the date in double digits https://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date
    let d = ("0" + date.getDate()).slice(-2);
    let m = ("0" + (date.getMonth() + 1)).slice(-2);
    let y = date.getFullYear();

    return [d,m,y];
    if (!yearReturn) return `${d}/${m}`;
}

function setGenreIcon(img, genre) {
    img.setAttribute("class", "movie-img");

    if (mainGenre.includes(genre)) {
        img.setAttribute("src", `image/section_history/icons/${genre.toLowerCase()}.png`);
        img.setAttribute("alt", `An icon that represents the movie is ${genre.toLowerCase()} genre`);
    } else {
        img.setAttribute("src", `image/section_history/icons/other.png`);
        img.setAttribute("alt", "An icon with a unpacked box and question mark in the middle");
    }

    return img
}

function removeChilds(element) {
    while (element.firstChild) element.removeChild(element.firstChild); // Removing all childs
}

// A function that helps to sort the objects by their watched date https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function watchedDateOrder(a, b) {
    if (a.watchedDate < b.watchedDate) {
        return 1;
    }
    if (a.watchedDate > b.watchedDate) {
        return -1;
    }
    return 0;
}

function favData(movieLst) {
    var allGenre = [];

    movieLst.forEach(movie => {
        var genre = movie.movieGenre;
        allGenre.push(genre);
    });

    let data = [];
    let unique = allGenre.filter(onlyUnique)
    for (var i = 0; i < unique.length; i++) {
        var newGenre = { genre: unique[i], totalDuration: 0, totalRating: 0, watchTime: 0 };
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

    data.sort(favGenreOrder);
    // console.log(data);
    
    return data;
}

// Filtering unique value https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

// Sort and find users favoruite genre based on Average Rating > Watch Time > Total Duration
function favGenreOrder(a, b) {
    var aAvgRating = a.totalRating / a.watchTime;
    var bAvgRating = b.totalRating / b.watchTime;

    if (aAvgRating < bAvgRating) {
        return 1;
    }
    else if (aAvgRating > bAvgRating) {
        return -1;
    }
    else {
        // If the average rating are the same, check their watchTime
        if (a.watchTime < b.watchTime) {
            return 1;
        }
        else if (a.watchTime > b.watchTime) {
            return -1;
        }
        else {
            // If the watchTime are still the same, check their total duration instead
            if (a.totalDuration < b.totalDuration) {
                return 1;
            }
            else if (a.totalDuration > b.totalDuration) {
                return -1;
            }
            return 0;
        }
    }
}

function favGenreRating(data) {
    const genre = document.querySelector('#fav-genre > .result');
    const ratings = document.querySelector('#fav-ratings > .result');

    genre.textContent = data[0].genre;

    removeChilds(ratings);
    const avgRating = data[0].totalRating / data[0].watchTime;
    for (var i = 0; i < 5; i++) {
        var star = document.createElement("span");

        if (i + 1 <= Math.round(avgRating)) { star.setAttribute("class", "fa fa-star rating-checked"); }
        else { star.setAttribute("class", "fa fa-star"); }

        ratings.appendChild(star);
    }
}

function favRecommendation(data) {
    const recommendation = document.getElementById('recommendation');
    removeChilds(recommendation);

    let genre = "action";
    for (var i = 0; i < data.length; i++) {
        if (mainGenre.includes(data[i].genre.toLowerCase())) {
            genre = data[i].genre.toLowerCase();
            break;
        }
    }

    for (var i = 0; i < 5; i++) {
        let poster = document.createElement("img");
        poster.setAttribute("src", `image/section_profile/recommendation/${genre}/poster${i + 1}.png`);
        poster.setAttribute("alt", `A poster of a ${genre} genre movie`);
        poster.style.borderRadius = "5px";
        recommendation.appendChild(poster);
    }

    // console.log(genre);
}

function movieWeekPlot(movieLst) {
    const plotDiv = document.getElementById("data-bar");
    
    var date = [];
    var watchTime = [];

    for (var i = 0; i < 7; i++) {
        const day = getDate(i);
        const fullDay = `${day[0]}/${day[1]}/${day[2]}`;

        var time = 0;
        movieLst.forEach(movie => {
            if (movie.watchedDate == fullDay) {
                time += Number(movie.movieDuration);
            }
        });

        watchTime.push(time);
        date.push(`${day[0]}/${day[1]}`);
    }

    console.log(watchTime);
    console.log(date);
}

function movieTotalPlot() {

}






// Button functions
function navbarAnimation() {
    // Nav-bar animation
    // Create a variable to reference the toggle <button>
    var navbarToggle = navbar.querySelector("#navbar-toggle");

    // Create a variable to reference the nav menu container <div>
    var navbarMenu = document.querySelector("#navbar-menu");

    // Create a variable to reference the <ul> list of nav links
    var navbarLinksContainer = navbarMenu.querySelector(".navbar-links");

    // Add or remove the 'active' class on the toggle <button> when clicked
    navbarToggle.addEventListener("click", () => { navbarToggle.classList.toggle('active') });

    // Remove the 'active' class on the menu container <div> when clicked 
    // This will close the menu if the user clicks outside the nav link <ul>
    navbarMenu.addEventListener("click", () => { navbarToggle.classList.remove('active') });

    // Stop clicks on the navbar links from toggling the menu (for when it's not mobile)
    navbarLinksContainer.addEventListener("click", (e) => e.stopPropagation());
}

// A function that will be triggered when the users submit the new movie form
// Submit function has to be added to the form instead of the button: https://stackoverflow.com/questions/32637920/why-does-a-submit-event-listener-not-work-on-a-submit-button
form.addEventListener("submit", function (event) {
    event.preventDefault();

    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    movieLst.push(getMovieDetails());
    movieLst.sort(watchedDateOrder);
    localStorage.setItem('movieLst', JSON.stringify(movieLst));
    console.log(JSON.parse(localStorage.getItem('movieLst')));
    form.reset();

    let url = window.location.href;
    if (url.indexOf("#") != -1) { url = url.split('#')[0] }
    window.location.href = url + "#history";

    contentUpdate();
});

// A function to avoid users selecting the future date as the date watched the movie
document.querySelector('input[name="watchedDate"]').setAttribute("max", maxDateInput());
function maxDateInput() {
    const day = new getDate(0);
    return`${day[2]}-${day[1]}-${day[0]}`;
}

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

    sectionOffsetCheck();
})

function clearHistory() {
    // Confirmation panel for destructive action https://www.codexworld.com/how-to/show-delete-confirmation-message-dialog-javascript/
    var confirmation = confirm("Are you sure to clear ALL the history?");

    if (confirmation) {
        localStorage.removeItem('movieLst');
        contentUpdate();
    }
}

function removeMovie(obj) {
    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    let id = obj.parentNode.parentNode.id;

    for (var i = 0; i < movieLst.length; i++) {
        if (movieLst[i].uid == id) {
            movieLst.splice(i, 1);
            console.log("Movie has been removed");
            break;
        }
    }

    localStorage.setItem('movieLst', JSON.stringify(movieLst));
    console.log(JSON.parse(localStorage.getItem('movieLst')));

    contentUpdate();
}