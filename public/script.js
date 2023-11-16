// Variables for highlighting user current section
const allNavLinks = document.querySelectorAll(".navbar-link");
const allSections = document.querySelectorAll(".main-section"); // Selecting all the key section headers
let sectionOffset = [0, 0, 0, 0];
let currentSection = 0;

// The input form which user filled the watched movie data
const form = document.getElementById('movie-form');

// The preset genre that are directly avaliable from the dropdown
const mainGenre = ["action", "adventure", "comedy", "fantasy", "horror", "romance", "sci-fi", "war"];





// Functions to call when the page finishes loading
document.addEventListener('DOMContentLoaded', () => {
    // Setup the navbar to resize when the screen size is small
    navbarAnimation();
    contentUpdate();
});

window.addEventListener('resize', ()=> {contentUpdate()}, true);

window.onscroll = () => {
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
    // Create and display the movie history in the history section
    // Use the local storage data -> sort in an ascending order -> sort by the current order
    displayMovie(sortOrder(null, true, null));
    
    // Create and display the plots in the profile section
    plotData(); 
    
    // Re-calculate the offset position of each section
    sectionOffsetCheck();
}





/* Main functions */
// @param movieLst (object): The list of movies to display
function displayMovie(movieLst) {
    //  Delete all displayed movie first
    const historyLst = document.getElementById('history-lst');
    removeChilds(historyLst);

    // Check if there are any movies stored in the local storage
    if (movieLst.length < 1) {
        let notice = document.createElement("h3");
        notice.setAttribute("class", "notice");
        notice.innerText = "You have not yet added any movie...";
        historyLst.appendChild(notice);

        document.getElementById("sort-btn-container").style.display = "none";
        document.getElementById("clear-history-btn").style.display = "none";
    } else {
        document.getElementById("sort-btn-container").style.display = "block";
        document.getElementById("clear-history-btn").style.display = "block";

        let instruction = document.createElement("p");
        instruction.setAttribute("id", "history-instruction");
        instruction.innerText = "(Click the genre icon to see all data)";
        historyLst.appendChild(instruction);

        // Display all the movies that are stored in the local storage
        movieLst.forEach(movie => {
            // The outer container of the whole movie
            let parentDiv = document.createElement("div");
            parentDiv.setAttribute("id", movie.uid);
            historyLst.appendChild(parentDiv);

            // The inner container of the movie details
            let gridDiv = document.createElement("div");
            gridDiv.setAttribute("class", "history-info");
            parentDiv.appendChild(gridDiv);

            // The first child of the inner container
            let movieImg = document.createElement("img");
            movieImg = setGenreIcon(movieImg, movie.movieGenre.toLowerCase());
            gridDiv.appendChild(movieImg);

            // The second child of the inner container
            let movieDetails = document.createElement("div");
            movieDetails.setAttribute("class", "movie-details");
            gridDiv.appendChild(movieDetails);

            // The details to be added to the movieDetails container
            addMovieDetails(movie, movieImg, movieDetails);

            // The third child of the inner container
            let deleteBtn = document.createElement("button");
            deleteBtn.setAttribute("class", "delete-btn");
            deleteBtn.addEventListener("click", removeMovie.bind(null, deleteBtn)); // Add functionality to the delete btn using bind https://stackoverflow.com/questions/21616393/javascript-event-listener-firing-on-page-load-not-click-event
            gridDiv.appendChild(deleteBtn);

            // A bin icon to replace the default appearance of a button, which provides a more engaging experience
            let deleteBtnImg = document.createElement("img");
            deleteBtnImg.setAttribute("src", "image/section_history/delete-btn.png");
            deleteBtnImg.setAttribute("alt", "A red color bin icon that represents deletion");
            deleteBtn.appendChild(deleteBtnImg);

            // A seperation line for better readability
            let seperateLine = document.createElement("span");
            seperateLine.setAttribute("class", "seperate-line");
            parentDiv.appendChild(seperateLine);
        });
    }
}

function plotData() {
    // Display the user movie data in the profile section
    const movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    const profileData = document.getElementById('profile-data');
    const profileDataNone = document.getElementById('profile-data-none');
    const favMovie = favData(movieLst);

    // Check if any data is found first
    if (movieLst.length < 1) {
        profileData.style.display = "none";
        profileDataNone.style.display = "block";
    } else {
        // If there is data, display the plots
        profileData.style.display = "flex";
        profileDataNone.style.display = "none";
        timeComparison(movieLst);
        favGenreRating(favMovie);
        movieWeekPlot(movieLst);
        movieTotalPlot(movieLst);
    }

    // Display the recommendation movie / If no data, display the default recommendtion
    favRecommendation(favMovie);
}





/* Sub functions */
// A function that recorded all sections' offset position
function sectionOffsetCheck() {
    for (var i = 0; i < 4; i++) {
        sectionOffset[i] = allSections[i].offsetTop - 0.5; // To avoid wrong section caused by rounding
        // console.log(i + ": " + allSections[i].offsetTop);
    }
}

// Create a set of texts showing the movie data and display them within the movieDetails container
// @param movie (object): The movie that contains all its date
// @param movieImg (object): The movie genre icon that has been created
// @param movieDetails (object): The container that will be storing the texts
function addMovieDetails(movie, movieImg, movieDetails) {
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
    movieComment.style.display = "none";
    movieDetails.appendChild(movieComment);

    // Display the movieComment when user clicks the icon (movieImg) / Hide it when user clicks again
    movieImg.addEventListener("click", toggleDisplayMode.bind(null, movieComment));
}

// A function that retrieves the data from the input field of the movie form
function getMovieDetails() {
    const movieName = document.querySelector('input[name="movieName"]').value;
    const movieGenre = document.querySelector('input[name="movieGenre"]').value;
    const watchedDate = document.querySelector('input[name="watchedDate"]').value;
    const movieDuration = parseInt(document.querySelector('input[name="movieDuration"]').value);
    const movieRating = parseInt(document.querySelector('input[name="rating"]:checked').value);
    const movieComment = document.querySelector('input[name="movieComment"]').value;
    const uid = generateUUID();

    // Get the date when user submit the form
    const date = getDate(0);
    const commentDate = `${date[0]}/${date[1]}/${date[2]}`

    // Save everything into an object
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

// A function to format date to dd/mm/yyyy https://stackoverflow.com/questions/2086744/javascript-function-to-convert-date-yyyy-mm-dd-to-dd-mm-yy
// @param date (string): A date that want to be re-formated into dd/mm/yyyy
function formatDate(date) {
    var datePart = date.match(/\d+/g);
    year = datePart[0];
    month = datePart[1];
    day = datePart[2];

    return day + '/' + month + '/' + year;
}

// A function to retrieve the date
// @param day (number): A number / integer that will be subtracted by today date, which helps to search for the date in the past (e.g. yesterday -> 1)
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
}

// An object that contains the icons based on genres of the movie and the icons' alt text
const genreIcons = {
    "action": "An icon with a spy wearing a suit and carrying a gun, which represents the action is romance genre",
    "adventure": "An icon with a adventurer carrying a torch, which represents the movie is adventure genre",
    "comedy": "An icon with two smily faces, which represents the movie is comedy genre",
    "fantasy": "An icon with a wizard, which represents the movie is fantasy genre",
    "horror": "An icon with a couple in it, which represents the movie is romance genre",
    "romance": "An icon with a ghost opening its mouth, which represents the movie is horror genre",
    "sci-fi": "An icon with a floating UFO, which represents the movie is sci-fi genre",
    "war": "An icon with a soldier shooting, which represents the movie is war genre",
}

// A function that sets the icon for the genre (for display in the history section)
// @param img (object): An image HTML element
// @param genre (string): The genre of the movie
function setGenreIcon(img, genre) {
    img.setAttribute("class", "movie-img");

    // Check if the input genre is within the defined scope
    if (mainGenre.includes(genre)) {
        img.setAttribute("src", `image/section_history/icons/${genre.toLowerCase()}.png`);
        img.setAttribute("alt", genreIcons[genre.toLowerCase()]);
    } else {
        img.setAttribute("src", `image/section_history/icons/other.png`);
        img.setAttribute("alt", "An icon with a unpacked box and question mark in the middle");
    }

    return img
}

// A function that removes all childs of the provided element
// @param element (object): A parent element that has to remove all its children element
function removeChilds(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
}

// A function that helps to sort the objects https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
// Sort in ascending order
function sortOrderA(a, b) {
    // Getting the values of the object https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
    a = Object.values(a)[temSort];
    b = Object.values(b)[temSort];

    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
}

// Sort in descending order
function sortOrderD(a, b) {
    a = Object.values(a)[temSort];
    b = Object.values(b)[temSort];
    
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}

// @variable sortValue: Will be changed when user clicks another sorting option, by default it is sorting by the watched date
// @variable temSort: For tempory sorting e.g. saving the movie list in a specific order, without affecting the sorting order of the movies display
let sortValue = 2; 
let temSort = sortValue; 

// A function that sorts the movie display based on the sorting order
// @param movieLst (object): A list of movie data
// @param ascending (boolean): Sort by ascending (true) / descending (false)
// @param value (number): A list of movie data
function sortOrder(movieLst, ascending, value) {
    if (movieLst == null) movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    // console.log(Object.keys(movieLst[0]));
    // console.log(Object.values(movieLst[0]));

    if (value != null) temSort = value;
    else temSort = sortValue;

    if (ascending) {
        movieLst.sort(sortOrderA);
    }
    else {
        movieLst.sort(sortOrderD);
    }

    // console.log(movieLst);
    return movieLst;
}

// A function that searches for user favourite movies
// @param movieLst (object): A list of movie data
function favData(movieLst) {
    var allGenre = [];

    movieLst.forEach(movie => {
        var genre = movie.movieGenre;
        allGenre.push(genre);
    });

    // Remove duplicated genres
    let data = [];
    let unique = allGenre.filter(onlyUnique)
    for (var i = 0; i < unique.length; i++) {
        // Create a new object with the unqiue genre and add to the data list
        var newGenre = { genre: unique[i], totalDuration: 0, totalRating: 0, watchTime: 0};
        data.push(newGenre);
    }

    // Loop through all existing movie data
    movieLst.forEach(movie => {
        var genre = movie.movieGenre;
        var duration = movie.movieDuration;
        var rating = movie.movieRating;

        // Add up their duration and rating based on their genre
        for (var i = 0; i < data.length; i++) {
            if (genre == data[i].genre) {
                data[i].totalDuration += duration;
                data[i].totalRating += rating;
                data[i].watchTime += 1;
                break;
            }
        }
    });

    // Sort the data list based on a scaled user rating
    return data.sort(favGenreOrder);
}

// A function that filters unique value https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

// A function that sorts and looks for user's favourite genre based on Average Rating > Watch Time > Total Duration
// New ranking system to avoid dominant of movie that has been watched once
function favGenreOrder(a, b) {
    // The ratio to calculate the score of each movie is: Average rating (60%) + Watch time (30%) + Total duration (10%)
    var aScore = (a.totalRating / a.watchTime * 6) + (a.watchTime * 3) + (a.totalDuration / 100);
    var bScore = (b.totalRating / b.watchTime * 6) + (b.watchTime * 3) + (b.totalDuration / 100);
    
    // The higher score of the genre, the higher it's rank
    if (aScore < bScore) return 1;
    else if (aScore > bScore) return -1;
    else return 0;
}

// A function that displays user's favourite genre and its rating
// @param data (object): A set of genre data that has been sorted by the favourite scores
function favGenreRating(data) {
    const favourite = document.getElementById('favourite');
    removeChilds(favourite);

    // To avoid the favourite genre being overrated
    let favGenre, avgRating = -1;
    for (var i = 0; i < data.length; i++){
        var average = data[i].totalRating / data[i].watchTime;
        if (average >= 3){
            favGenre = i;
            avgRating = average;
            break;
        }
    }
    
    // If favourite movie genre found, display its genre and average rating
    if (favGenre > -1) {
        // First row to display the genre
        var genreDiv = document.createElement("div");
        favourite.appendChild(genreDiv);

        var genreHeading = document.createElement("p");
        genreHeading.setAttribute("class", "heading");
        genreHeading.textContent = "Favourite genre:";
        genreDiv.appendChild(genreHeading);

        var genreResult = document.createElement("p");
        genreResult.setAttribute("class", "result");
        genreResult.textContent = data[favGenre].genre;
        genreDiv.appendChild(genreResult);

        // Second row to display the average ratings
        var ratingDiv = document.createElement("div");
        favourite.appendChild(ratingDiv);

        var ratingHeading = document.createElement("p");
        ratingHeading.setAttribute("class", "heading");
        ratingHeading.textContent = "Average ratings:";
        ratingDiv.appendChild(ratingHeading);

        var ratingeResult = document.createElement("div");
        ratingeResult.setAttribute("class", "result");
        ratingDiv.appendChild(ratingeResult);

        // Fill out the star ratings for better visual communication than plain text
        for (var i = 0; i < 5; i++) {
            var star = document.createElement("span");
    
            if (i + 1 <= Math.round(avgRating)) { star.setAttribute("class", "fa fa-star rating-checked"); }
            else { star.setAttribute("class", "fa fa-star"); }
    
            ratingeResult.appendChild(star);
        }
    } else {
        let notice = document.createElement("h3");
        notice.setAttribute("class", "notice");
        notice.innerText = "No favourite genre found...";
        favourite.appendChild(notice);
    }
}

// An object that stores all different genres and their posters' alt texts
const posterAlt = {
    "action": [
        {
            "alt": "A movie poster of Revenge, in which a woman is carrying a gun and looking forward"
        }, {
            "alt": "A movie poster of Top Gun, in which a man and a woman are standing in front of an American flag"
        }, {
            "alt": "A movie poster of A Touch of Zen, in which a man is holding a sword inside a bamboo forest"
        }, {
            "alt": "A movie poster of Shoot Them Up, in which a man is wearing a brown jacket carrying dual wield with a woman wearing purple suit behind him and another man carrying a shotgun"
        }, {
            "alt": "A movie poster of The Villainess, in which there is a woman in a ponytail, carrying a pistol gun and wearing a black jacket"
        }
    ],
    "adventure": [
        {
            "alt": "A movie poster of King Kong, in which a giant gorilla is yelling and holding a plane and a man"
        }, {
            "alt": "A movie poster of Robin Hood Prince of Thieves, in which there is a man with a scar on his face aiming with a bowl"
        }, {
            "alt": "A movie poster of Indiana Jones, in which a man is wearing a hat and riding a horse"
        }, {
            "alt": "A movie poster of The Jungle Book, in which there is a boy only wearing a loincloth and standing on a tree, with a bear and a tiger underneath"
        }, {
            "alt": "A movie poster of Pirates of Caribbean, in which a male pirate is wearing a red bandana cap and carrying a pistol and saber"
        }
    ],
    "comedy": [
        {
            "alt": "A movie poster of Parents can be such blockers, which three teenage girls are standing in front with unwilling faces and three adults smiling happily behind"
        }, {
            "alt": "A movie poster of Pitch Perfect, in which seven girls are posing and one of them is holding a mic"
        }, {
            "alt": "A movie poster of Bill & Ted's Excellent Adventure, in which two boys are sitting on a time machine with a man behind placing his hands on their shoulder"
        }, {
            "alt": "A movie poster of In The Loop, in which two cartoon men are talking with a string phone"
        }, {
            "alt": "A movie poster of Shalin Soccer, in which a man is kicking a soccer with a kung fu pose and a woman following behind"
        }
    ],
    "fantasy": [
        {
            "alt": "A movie poster of The Hobbit: An Unexpected Journey, in which a man is wearing a medieval costume and carrying a sword inside a forest"
        }, {
            "alt": "A movie poster of The House With A Clock In Its Walls, in which a man is looking at a house in front of the gate, with a shining clock on the house upper part"
        }, {
            "alt": "A movie poster of Nanny Mcphee, which a woman is standing in front of a door, with some kids and their parents surrounding"
        }, {
            "alt": "A movie poster of The Chronicles Of Narnia: The Lion, The Witch And The Wardrobe, in which there is a lion in the middle and some soldiers and a witch in white clothes in front of it"
        }, {
            "alt": "A movie poster of Where The Wild Things Are, in which a gigantic cat is looking at a little boy in the desert"
        }
    ],
    "horror": [
        {
            "alt": "A movie poster of Hellraiser, in which there is a man whose face is full of needles"
        }, {
            "alt": "A movie poster of Oculus, in which a little boy is hiding behind a little girl and both of them look scared"
        }, {
            "alt": "A movie poster of Eden Lake, in which a woman is hiding behind a tree and some people are looking for her"
        }, {
            "alt": "A movie poster of Land Of The Dead, in which there is a crawling hand and some zombies behind"
        }, {
            "alt": "A movie poster of Shadow Of The Vampire, in which a man who wears a hat, with a vampire who has long fingernails behind"
        }
    ],
    "romance": [
        {
            "alt": "A movie poster of The Big Sick, in which a man is holding a giraffe toy with a woman next to him and their own family members behind them with smiley faces"
        }, {
            "alt": "A movie poster of The Princess Bride, in which a man who wears a suit and a girl who wears a dress look at each other closely under the sunset"
        }, {
            "alt": "A movie poster of Bull Durham, in which a man is holding a baseball bat and sitting on the back of a car being kissed by a woman"
        }, {
            "alt": "A movie poster of The Half Of It, in which there are a girl who wears glass and a boy who is carrying a bag looking at a woman together "
        }, {
            "alt": "A movie poster of I'm Your Man, in which there is a man who wears a black suit and a woman who wears a white suit looking at each other closely"
        }
    ],
    "sci-fi": [
        {
            "alt": "A movie poster of ET The Extra Terrestrial, in which an alien is using its finger to touch a human's finger edge"
        }, {
            "alt": "A movie poster of Tron Legacy, in which a man is raising his hands and a woman is next to him. They both wear a high-tech armour suit"
        }, {
            "alt": "A movie poster of Ender's Game, in which an astronaut is wearing a helmet in front of a high-tech machine"
        }, {
            "alt": "A movie poster of Prometheus, in which a person is carrying a flashlight and pointing at a huge head that is full of scars"
        }, {
            "alt": "A movie poster of Avatar, in which there is a man who has blue skin riding a huge animal that has a pair of wings"
        }
    ],
    "war":  [
        {
            "alt": "A movie poster of Grave Of The Fireflies, in which there is a boy who wears a white vest carrying his little sister and holding a broken umbrella"
        }, {
            "alt": "A movie poster of All Quiet On The Western Front, in which some soldiers are fighting in the front line of the battlefield"
        }, {
            "alt": "A movie poster of The Hurt Locker, in which a soldier is carrying an assault rifle and there is a huge explosion behind him and his teammates"
        }, {
            "alt": "A movie poster of Son of Saul, in which a soldier is looking at another soldier who wears a hat angrily"
        }, {
            "alt": "A movie poster of Saving Private Ryan, in which a soldier walks in the middle with some other soldiers illusion behind"
        }
    ]
}

// A function that creates the movie posters based on user's interest and display them
// @param data (object): A set of genre data that has been sorted by the favourite scores
function favRecommendation(data) {
    const recommendation = document.getElementById('recommendation');
    removeChilds(recommendation);

    // Default recommendation
    let genre = "action";

    // Check whether can find movie posters are that genre from the list
    for (var i = 0; i < data.length; i++) {
        if (mainGenre.includes(data[i].genre.toLowerCase()) && data[i].totalRating / data[i].watchTime >= 3) {
            genre = data[i].genre.toLowerCase();
            break;
        }
    }

    // Create and display the posters
    for (var i = 0; i < 5; i++) {
        let poster = document.createElement("img");
        poster.setAttribute("src", `image/section_profile/recommendation/${genre}/poster${i + 1}.png`);
        poster.setAttribute("alt", posterAlt[genre][i].alt);
        poster.style.borderRadius = "5px";
        recommendation.appendChild(poster);
    }
}

// A function that compares and display the differences between user average watch time in this week and overall average 
// @param movieLst (object): A list of movie data
function timeComparison(movieLst) {
    const dailyAverage = document.getElementById("data-compare-watchTime");
    const watchTimeChange = document.getElementById("data-compare-percent");

    // Calculate the total watch time in previous 7 days
    var total = 0;
    for (var day = 0; day < 7; day++) {
        const date = getDate(day);
        const fullDate = `${date[0]}/${date[1]}/${date[2]}`;

        movieLst.forEach(movie => {if (movie.watchedDate == fullDate) {total += movie.movieDuration;}});
    };

    // Divide the total watch time by 7 to find the average watch time
    var average = total/7;
    dailyAverage.textContent = `${Math.floor(average / 60)}hr ${Math.ceil(average % 60)}min`
    // console.log(average);

    // Calculate the overall watch time by adding all movie duration and get all the date that users have watched any movie
    var overallAverage = 0;
    var allDate = []
    movieLst.forEach(movie => {
        overallAverage += movie.movieDuration;

        // Check if the date already exist, if not add it to the list
        if (!allDate.includes(movie.watchedDate)) allDate.push(movie.watchedDate);
    });

    // Calculate the overall average
    overallAverage /= allDate.length;
    // console.log(overallAverage);

    // Calculate the percentage change
    var percentChange = (average - overallAverage)/overallAverage * 100;
    if (percentChange == Infinity || allDate.length < 7) {
        watchTimeChange.textContent = "-";
        watchTimeChange.style.background = "#454545";
        return;
    }
    else {
        // Assigning the text content and background color for better visualisation
        watchTimeChange.textContent = `${Math.floor(percentChange)} %`;

        if (average >= 300 || average >= 240 && percentChange > -10) watchTimeChange.style.background = "#dd1414"; // Over watching
        else if (average >= 210 && percentChange > 30) watchTimeChange.style.background = "#b9b41e"; // Warning - in an increasing trend
        else watchTimeChange.style.background = "rgb(24 135 59)";
    }
}

// A function that creates a bar chart which shows how much time the user has streamed in previous 7 days
// @param movieLst (object): A list of movie data
function movieWeekPlot(movieLst) {
    const plotDiv = document.getElementById("data-bar");

    var dateLst = [];
    var watchTime = [];

    for (var i = 0; i < 7; i++) {
        const date = getDate(i);
        const fullDate = `${date[0]}/${date[1]}/${date[2]}`;

        var time = 0;
        movieLst.forEach(movie => {
            if (movie.watchedDate == fullDate) {
                time += movie.movieDuration/60;
            }
        });

        watchTime.push(Math.round(time * 100) / 100);
        dateLst.push(`${date[0]}/${date[1]}`);
    }

    var data = [{
        x: dateLst,
        y: watchTime,
        type: 'bar',
        hoverinfo: 'none',
        marker: {
            color: ['#FF9900', '#603A02', '#603A02', '#603A02', '#603A02', '#603A02', '#603A02']
        },
        text: watchTime,
        textposition: 'auto',
    }]

    var layout = {
        xaxis: {
            autorange: 'reversed',
            color: '#FFFFFF',
        },
        yaxis: {
            zerolinecolor: '#454545',
            gridcolor: '#454545',
            color: '#ffffff',
            rangemode: 'tozero'
        },
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 100
        },
        showlegend: false,
        responsive: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        dragmode: false // fix the plot to disable default scroll / drag movement
    };

    // Hiding the floating toolbar https://timonweb.com/javascript/how-to-hide-the-floating-toolbar-in-plotly/
    const config = {
        displayModeBar: false
    };

    Plotly.newPlot(plotDiv, data, layout, config);
}

// A function that creates a bar chart which shows the time spend on watching different genres
// @param movieLst (object): A list of movie data
function movieTotalPlot(movieLst) {
    const plotDiv = document.getElementById("watch-time");

    // Using a object list is easier to complete the steps after
    var genreWatchTime = {}; 

    movieLst.forEach(movie => {
        // Check if the object has the key https://www.freecodecamp.org/news/how-to-check-if-an-object-has-a-key-in-javascript/
        var genre = movie.movieGenre;
        var time = movie.movieDuration;
        if (genre in genreWatchTime) {
            // Update the key value https://hackernoon.com/how-to-update-object-key-values-using-javascript
            genreWatchTime[genre] += time;
        } else {
            // Add new key and value to object https://stackoverflow.com/questions/1168807/how-can-i-add-a-key-value-pair-to-a-javascript-object
            genreWatchTime[genre] = time;
        }
    });

    // Sorting the object list
    let sortable = [];
    for (var movie in genreWatchTime) sortable.push([movie, genreWatchTime[movie]]);
    sortable.sort((a, b) => {
        if (a[1] < b[1]) return 1;
        if (a[1] > b[1]) return -1;
        return 0;
    });

    // Cutting the list to length of 3
    while (sortable.length > 3) sortable.pop();

    var genre = [];
    var time = [];
    sortable.forEach(movie => {
        genre.push(movie[0]);
        time.push(Math.round(movie[1]/60 * 100) / 100); // Round to 2 decimal places
    });

    var data = [{
        x: time,
        y: genre,
        type: 'bar',
        hoverinfo: 'none',
        marker: {color: ['#FF9900', '#603A02', '#603A02']},
        text: time,
        textposition: 'auto',
        orientation: 'h'
    }]

    var layout = {
        xaxis: {
            color: '#FFFFFF',
        },
        yaxis: {
            autorange: 'reversed',
            zerolinecolor: '#454545',
            gridcolor: '#454545',
            color: '#ffffff',
            rangemode: 'tozero'
        },
        margin: {
            l: 90,
            r: 30,
            b: 50,
            t: 70,
            pad: 10
        },
        responsive: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        dragmode: false // fix the plot to disable default scroll / drag movement
    };

    const config = {
        // Only display the chart and hide other display elements
        displayModeBar: false,
    };

    Plotly.newPlot(plotDiv, data, layout, config);
}






/* Button functions */
// A function that adds responsiveness to the navbar
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

    // Close the nav bar menu when users click any section tag
    for (var i = 0; i < allNavLinks.length; i++) {
        allNavLinks[i].addEventListener("click", () => { navbarToggle.classList.remove('active') });
    }

    navbarMenu.addEventListener("click", () => { navbarToggle.classList.remove('active') });

    // Stop clicks on the navbar links from toggling the menu (for when it's not mobile)
    navbarLinksContainer.addEventListener("click", (e) => e.stopPropagation());
}

// A function that will be triggered when the user submits the new movie form
// Submit function has to be added to the form instead of the button: https://stackoverflow.com/questions/32637920/why-does-a-submit-event-listener-not-work-on-a-submit-button
form.addEventListener("submit", function (event) {
    event.preventDefault();

    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    movieLst.push(getMovieDetails());
    // Sorting the movieLst based on watched date
    sortOrder(movieLst, true, 2);
    localStorage.setItem('movieLst', JSON.stringify(movieLst));
    // console.log(JSON.parse(localStorage.getItem('movieLst')));
    form.reset();

    let url = window.location.href;
    if (url.indexOf("#") != -1) { url = url.split('#')[0] }
    window.location.href = url + "#history";

    contentUpdate();
});

// A function to avoid the user selecting the future date as the date watched the movie
document.querySelector('input[name="watchedDate"]').setAttribute("max", maxDateInput());
document.querySelector('input[name="watchedDate"]').defaultValue = maxDateInput();
function maxDateInput() {
    const date = new getDate(0);
    return `${date[2]}-${date[1]}-${date[0]}`;
}

// A function that allows the user to click on the same button to switch between hide / show
// @param obj (object): The object that is clicked
function toggleDisplayMode(obj) {
    if (obj.style.display == "none") obj.style.display = "block";
    else obj.style.display = "none";
}

// A function to hide / show the dropdown menu
const sortDropdown = document.getElementById('sort-dropdown');
sortDropdown.style.display = "none";
function toggleDropdown() {
    toggleDisplayMode(sortDropdown);
}

// A function that will be triggered when the user clicks a specific sorting order button
// @param obj (object): The object that is clicked
// @param ascending (boolean): A boolean that tells whether it has to be sort by ascending (true) or descending (false) order
// @param sort (number): The order to sort (e.g. 2 -> sort by watched date)
let currectOrder = 0;
const sortContent = document.querySelectorAll('#sort-dropdown > .sort-order');
function selectDropdown(obj, ascending, sort) {
    // Check whether the user is selecting another sorting format
    if (obj == sortContent[currectOrder]) return;

    // When users selected another sorting format
    sortContent[currectOrder].removeAttribute("id");
    obj.setAttribute("id", "sort-selected");

    // Change the sorting format
    for (var i = 0; i < sortContent.length; i++) {
        // Find the sort order that user want
        if (sortContent[i] == obj) {
            currectOrder = i;
            displayMovie(sortOrder(null, ascending, sort));
            toggleDropdown(); // Close the dropdown menu
            return;
        }
    }
}

// A function that allows the user to erase all movies from the watch history
function clearHistory() {
    // Confirmation panel for destructive action https://www.codexworld.com/how-to/show-delete-confirmation-message-dialog-javascript/
    var confirmation = confirm("Are you sure to clear ALL the history?");

    if (confirmation) {
        localStorage.removeItem('movieLst');
        contentUpdate();
    }
}

// A function that allows the user to remove the movie from the watch history
// @param obj (object): The object that has to be removed
function removeMovie(obj) {
    let movieLst = JSON.parse(localStorage.getItem('movieLst')) || [];
    let id = obj.parentNode.parentNode.id;

    for (var i = 0; i < movieLst.length; i++) {
        // Using the movie uid helps to ensure the removed movie is the same as the one user clicked to remove
        // Especially when the website is developed further with other specific functions (e.g. favourite) and all there are movies with the same details (e.g. name, genre)
        if (movieLst[i].uid == id) {
            movieLst.splice(i, 1);
            // console.log("Movie has been removed");
            break;
        }
    }

    localStorage.setItem('movieLst', JSON.stringify(movieLst));
    // console.log(JSON.parse(localStorage.getItem('movieLst')));

    contentUpdate();
}