function getWeather() {
    const apiKey = '8013a57678a95a589595d0dfb3aa7dee';
    const cityInput = document.getElementById('cityInput').value.trim();
    const weatherContainer = document.getElementById('weather-container');
    const forecastContainer = document.getElementById('forecast-container');

    if (cityInput === '') {
        alert('Please enter the name of a city.');
        return;
    }

    // Fetch weather data
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}`)
        .then(response => response.json())
        .then(weatherData => {
            // Store city in localStorage
            saveCity(cityInput);

            // Display weather data
            displayWeather(weatherData, weatherContainer);

            // Fetch 5-day forecast data
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(forecastData => {
            // Display 5-day forecast data
            displayForecast(forecastData, forecastContainer);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please try again.');
        });
}

function displayWeather(weatherData, container) {
    console.log(weatherData);
    const temperatureFahrenheit = convertKelvinToFahrenheit(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const weatherIcon = weatherData.weather[0].icon;
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;

    const currentWeatherHtml = `
        <div class="current-weather">
            <h2>Current Weather in ${weatherData.name}</h2>
            <div class="current-weather-details">
                <p>Temperature: ${temperatureFahrenheit} °F</p>
                <p>Description: ${description}</p>
                <p>Wind Speed: ${windSpeed} m/s</p>
                <p>Humidity: ${humidity}%</p>
                <img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="${description}">
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforebegin', currentWeatherHtml);
}


function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('cities')) || [];
    if (cities.length >= 4) {
        cities.shift(); // Remove the oldest city if there are already 5 cities
    }
    cities.push(city);
    localStorage.setItem('cities', JSON.stringify(cities));
    displaySavedCities(cities);
}

function displaySavedCities(cities) {
    const savedCitiesContainer = document.getElementById('savedCities');
    savedCitiesContainer.innerHTML = '';
    cities.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.onclick = function() {
            // When a saved city button is clicked, fetch and display its weather and forecast
            document.getElementById('cityInput').value = city;
            getWeather();
        };
        savedCitiesContainer.appendChild(button);
    });
}

window.onload = function() {
    // On page load, display the last 5 searched cities
    const cities = JSON.parse(localStorage.getItem('cities')) || [];
    displaySavedCities(cities);
};

function displayWeather(weatherData, container) {
    const temperatureFahrenheit = convertKelvinToFahrenheit(weatherData.main.temp);
    container.innerHTML = `<h2>Current Weather in ${weatherData.name}</h2>`;
    container.innerHTML += `<p>Temperature: ${temperatureFahrenheit} °F</p>`;
}

function displayForecast(forecastData, container) {
    container.innerHTML = `<h2>5-Day Forecast for ${forecastData.city.name}</h2>`;
    container.innerHTML += '<div class="forecast-list">';

    const groupedForecastData = groupForecastDataByDay(forecastData.list);

    let dayCount = 0;
    for (const dayKey in groupedForecastData) {
        if (dayCount >= 1 && dayCount <= 5) {
            const dayData = groupedForecastData[dayKey];
            const date = new Date(dayData[0].dt * 1000);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            const highTemperature = convertKelvinToFahrenheit(dayData[0].main.temp_max);
            const lowTemperature = convertKelvinToFahrenheit(dayData[0].main.temp_min);
            const description = dayData[0].weather[0].description;
            const windSpeed = dayData[0].wind.speed;
            const humidity = dayData[0].main.humidity;
            const weatherIcon = dayData[0].weather[0].icon;

            container.innerHTML += `
                <div class="forecast-item">
                    <p>${dayOfWeek}</p>
                    <img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="${description}">
                    <p>High: ${highTemperature} °F</p>
                    <p>Low: ${lowTemperature} °F</p>
                    <p>Wind Speed: ${windSpeed} m/s</p>
                    <p>Humidity: ${humidity}%</p>
                    <p>Description: ${description}</p>
                </div>
            `;
        }
        dayCount++;
    }

    container.innerHTML += '</div>';
}

function convertKelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9 / 5 + 32).toFixed(2);
}

function groupForecastDataByDay(forecastData) {
    const groupedData = {};
    forecastData.forEach(data => {
        const date = new Date(data.dt * 1000);
        const dayKey = date.toDateString();
        if (!groupedData[dayKey]) {
            groupedData[dayKey] = [];
        }
        groupedData[dayKey].push(data);
    });
    return groupedData;
}
