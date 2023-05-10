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

window.addEventListener('resize', function(event) {
    contentUpdate();
}, true);

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
        weeklyComparison(movieLst);
        movieWeekPlot(movieLst);
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

    const date = getDate(0);
    const commentDate = `${date[0]}/${date[1]}/${date[2]}`

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
function formatDate(date) {
    var datePart = date.match(/\d+/g);
    year = datePart[0];
    month = datePart[1];
    day = datePart[2];

    return day + '/' + month + '/' + year;
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

    return [d, m, y];
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

function weeklyComparison(movieLst) {
    const weeklyTotal = document.getElementById("data-compare-watchTime");
    const watchTimeChange = document.getElementById("data-compare-percent");

    var watchTime = [];
    for (var week = 0; week < 2; week++) {
        var startDate = week * 7;
        var total = 0;
        for (var day = startDate; day < startDate + 7; day++) {
            const date = getDate(day);
            const fullDate = `${date[0]}/${date[1]}/${date[2]}`;

            movieLst.forEach(movie => {
                if (movie.watchedDate == fullDate) {
                    total += Number(movie.movieDuration);
                }
            });
        };
        watchTime.push(total);
    }

    weeklyTotal.textContent = `${Math.floor(watchTime[0] / 60)}hr ${watchTime[0] % 60}min`

    var percentChange = (watchTime[0]-watchTime[1])/watchTime[1] * 100;
    if (percentChange == Infinity) {
        watchTimeChange.textContent = "-";
        return;
    }
    else {
        watchTimeChange.textContent = `${Math.floor(percentChange)} %`;

        if (watchTime[0] >= 240 * 7 && percentChange > -10) watchTimeChange.style.background = "#dd1414"; // Over watching
        else if (watchTime[0] >= 210 * 7 && percentChange > 30) watchTimeChange.style.background = "##b9b41e"; // Warning - in an increasing trend
        else watchTimeChange.style.background = "#30c35f";
    }
}

function movieWeekPlot(movieLst) {
    const plotDiv = document.getElementById("data-bar");

    var dateLst = [];
    var watchTime = [];
    for (var week = 0; week < 2; week++) {
        var startDate = week * 7;
        var total = 0;
        for (var day = startDate; day < startDate + 7; day++) {
            const date = getDate(day);
            const fullDate = `${date[0]}/${date[1]}/${date[2]}`;

            movieLst.forEach(movie => {
                if (movie.watchedDate == fullDate) {
                    total += Number(movie.movieDuration);
                }
            });
        };
        watchTime.push(total);
    }

    weeklyTotal.textContent = `${Math.floor(watchTime[0] / 60)}hr ${watchTime[0] % 60}min`

    var percentChange = (watchTime[0]-watchTime[1])/watchTime[1] * 100;
    if (percentChange == Infinity) {
        watchTimeChange.textContent = "-";
        return;
    }
    else {
        watchTimeChange.textContent = `${Math.floor(percentChange)} %`;

        if (watchTime[0] >= 240 * 7 && percentChange > -10) watchTimeChange.style.background = "#dd1414"; // Over watching
        else if (watchTime[0] >= 210 * 7 && percentChange > 30) watchTimeChange.style.background = "##b9b41e"; // Warning - in an increasing trend
        else watchTimeChange.style.background = "#30c35f";
    }
}

function movieWeekPlot(movieLst) {
    const plotDiv = document.getElementById("data-bar");
    for (var i = 0; i < 7; i++) {
        const date = getDate(i);
        const fullDate = `${date[0]}/${date[1]}/${date[2]}`;

        var time = 0;
        movieLst.forEach(movie => {
            if (movie.watchedDate == fullDate) {
                time += Number(movie.movieDuration/60);
            }
        });

        watchTime.push(time);
        dateLst.push(`${date[0]}/${date[1]}`);
    }

    var data = [{
        x: dateLst,
        y: watchTime,
        type: 'bar',
        hoverinfo: 'none',
        marker: {
            color: ['#FF9900', '#603A02', '#603A02', '#603A02', '#603A02', '#603A02', '#603A02']
        }
    }]

    var layout = {
        title: {
            font: { family: "Open Sans", size: 20, color: "#FFFFFF" },
            text: "Previous 7 days records (hr)",
        },
        xaxis: {
            autorange: 'reversed',
            color: '#FFFFFF',
        },
        yaxis: {
            zerolinecolor: '#454545',
            gridcolor: '#454545',
            color: '#ffffff',
        },
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        dragmode: false // fix the plot to disable default scroll / drag movement (users can still do so by using the pan function)
    };

    Plotly.newPlot(plotDiv, data, layout);
}

function movieTotalPlot() {
    //     const plotDiv = document.getElementById("watch-time");

    //     var data = [{
    //         x: ['giraffes', 'orangutans', 'monkeys'],
    //         y: [20, 14, 23],
    //         labels: reasonStr,
    //         values: countNum,

    //         textinfo: "label+percent",

    //         hovertemplate: '<i>Reason</i>: %{customdata[0][0]}' + '<br><b>Recorded cases</b>: %{customdata[0][1]}<extra></extra>',

    //         // Follow the design pattern used in tutorial task 2: https://community.plotly.com/t/plotly-pie-chart-order-of-slices/35484
    //         direction: 'clockwise',
    //         sort: false,

    //         hole: .5,
    //         type: 'pie'
    //     }]

    //     var layout = {
    //         title: {
    //             // https://stackoverflow.com/questions/64991752/plotly-express-title-styling
    //             font: { family: "Impact", size: 38 },

    //             // https://community.plotly.com/t/multiple-color-in-title-text/64067/2
    //             text: "Numerous of Dogs were <span style='color:red'>left</span> in the <br> Adoption Center due to following reasons",

    //             y: 0.925
    //         },
    //         images: [{
    //             // https://plotly.com/javascript/reference/layout/images/
    //             x: 0.5,
    //             y: 0.75,
    //             sizex: .5,
    //             sizey: .5,
    //             opacity: .3,
    //             source: "icon.png",
    //             xanchor: "center",
    //             yanchor: "center",
    //         }],
    //         margin: { t: 150, b: 150 },
    //         height: 750,
    //         width: 750,
    //         showlegend: false,
    //     };

    //     Plotly.newPlot(plotDiv, data, layout);
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
    // console.log(JSON.parse(localStorage.getItem('movieLst')));
    form.reset();

    let url = window.location.href;
    if (url.indexOf("#") != -1) { url = url.split('#')[0] }
    window.location.href = url + "#history";

    contentUpdate();
});

// A function to avoid users selecting the future date as the date watched the movie
document.querySelector('input[name="watchedDate"]').setAttribute("max", maxDateInput());
function maxDateInput() {
    const date = new getDate(0);
    return `${date[2]}-${date[1]}-${date[0]}`;
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