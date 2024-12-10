$(document).ready(function() {
    const apiKey = 'fdd1d925e2b9031628a2b83818835293';
    const baseUrl = 'https://api.openweathermap.org/data/2.5/';

    function validateCityName(city) {
        const regex = /^[A-Za-z\s]+$/;
        return regex.test(city);
    }

    function showError(message) {
        $('#error-message').text(message).show();
    }

    function clearError() {
        $('#error-message').hide();
    }

    function showLoading() {
        $('#loading-spinner').show();
    }

    function hideLoading() {
        $('#loading-spinner').hide();
    }

    function fetchWeatherData(city) {
        showLoading();
        clearError();
        $.getJSON(`${baseUrl}weather?q=${city}&appid=${apiKey}&units=metric`, function(data) {
            displayCurrentWeather(data);
            fetchForecast(city);
        }).fail(function() {
            showError('Failed to retrieve data. Please check the city name and try again.');
            hideLoading();
        });
    }

    function fetchForecast(city) {
        $.getJSON(`${baseUrl}forecast?q=${city}&appid=${apiKey}&units=metric`, function(data) {
            displayForecast(data);
            hideLoading();
        }).fail(function() {
            showError('Failed to retrieve forecast data.');
            hideLoading();
        });
    }

    function displayCurrentWeather(data) {
        $('#city-name-text').text(data.name);
        $('#current-weather').html(`
            <p>Temperature: ${Math.round(data.main.temp)}°C</p>  <!-- Rounded to nearest integer -->
            <p>Weather: ${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
        `);
        $('#weather-data').fadeIn();
    }

    function displayForecast(data) {
        let forecastHtml = '<h3>5-Day Forecast</h3><div class="forecast-container">';
        for (let i = 0; i < 5; i++) {
            const forecast = data.list[i * 8]; // Take the forecast for each of the 5 days
            forecastHtml += `
                <div class="forecast-day">
                    <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
                    <p>Temp: ${Math.round(forecast.main.temp)}°C</p> <!-- Rounded to nearest integer -->
                    <p>${forecast.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon">
                </div>
            `;
        }
        forecastHtml += '</div>';
        $('#forecast').html(forecastHtml).fadeIn();

        // Slide-in animation for forecast days
        $('.forecast-day').each(function(index) {
            $(this).delay(index * 200).animate({ opacity: 1, marginLeft: "0" }, 1000);
        });
    }

    function saveFavoriteCity(city) {
        let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        if (!favorites.includes(city)) {
            favorites.push(city);
            localStorage.setItem('favoriteCities', JSON.stringify(favorites));
            displayFavoriteCities();
        }
    }

    function displayFavoriteCities() {
        const favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        let favoritesHtml = '';
        favorites.forEach(city => {
            favoritesHtml += `<li>${city} <button class="remove-favorite" data-city="${city}">❌</button></li>`;
        });
        $('#favorite-cities').html(favoritesHtml);
    }

    function applyCustomStyles() {
        const bgColor = $('#bg-color').val();
        const textColor = $('#text-color').val();
        const fontSize = $('#font-size').val() + 'px';
        document.documentElement.style.setProperty('--bg-color', bgColor);
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--font-size', fontSize);
    }

    $('#search-button').click(function() {
        const city = $('#city-input').val().trim();
        if (validateCityName(city)) {
            clearError();
            fetchWeatherData(city);
        } else {
            showError('Please enter a valid city name.');
        }
    });

    $('#favorite-button').click(function() {
        const city = $('#city-name-text').text();
        saveFavoriteCity(city);
    });

    $('#customize-button').click(function() {
        $('#customize-dialog').dialog({
            width: 400, 
            height: 'auto',
            modal: true 
        });
    });

    $('#apply-styles-button').click(function() {
        applyCustomStyles();
        $('#customize-dialog').dialog('close');
    });

    $('#favorite-cities').on('click', '.remove-favorite', function() {
        const city = $(this).data('city');
        let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        favorites = favorites.filter(fav => fav !== city);
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
        displayFavoriteCities();
    });

    $('#favorite-cities').on('click', 'li', function() {
        const city = $(this).text().replace(' ❌', '');
        fetchWeatherData(city);
    });

    displayFavoriteCities();
});
