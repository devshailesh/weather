const search = document.querySelector("#search-box");
const cityName = document.querySelector("#city-name");
const temp = document.querySelector("#temperature");
const feelsLike = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const weatherDescription = document.querySelector("#today-weather-description");
const forecastWeather = document.querySelector(".container-forecast-weather");
const displayDate = document.querySelector('#displayDate');
const displayTime = document.querySelector('#displayTime');
const spinnerLoading = document.querySelector('.loader-overlay');


const apiWhileFetching = {
  loading() {
    spinnerLoading.style.display = 'flex';
  },
  closeLoading() {
    spinnerLoading.style.display = 'none';
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("forecast")) || [];
  },
  set(forecast) {
    localStorage.setItem("forecast", JSON.stringify(forecast));
  },
};

const Forecast = [];

//search city name by pressing enter
search.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (search.value === "") return;
    if (search.value.slice(0, 1) === ",") {
      Swal.fire({
        title: "error!",
        text: "Invalid name",
        icon: "warning",
        confirmButtonText: "Close",
        footer: "City, Country - EX: Toronto, CA"
      });
      search.value = "";
      return;
    }

    searchWeather(search.value);
  }
});

async function searchWeather(city) {
  apiWhileFetching.loading();

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=f50fb40048cb583c6797ce64964afdbe`
  ).then((response) => {
    if (!response.ok) {
      Swal.fire({
        title: "Error!",
        text: "Location not found",
        icon: "error",
        confirmButtonText: "Close",
        footer: "City, Country - EX: Toronto, CA"
      });
      search.value = "";
      apiWhileFetching.closeLoading();
      throw new Error("NOT FOUND");
    }

    return response;
  });

  const data = await response.json();

  cityName.innerText = city;
  temp.innerText = data.main.temp.toFixed() + "°C";
  humidity.innerText = data.main.humidity.toFixed() + "%";
  feelsLike.innerText = data.main.feels_like.toFixed() + "°C";
  wind.innerText = data.wind.speed;
  weatherDescription.innerText = data.weather[0].description;
  search.value = "";
  APP.reload();
  forecastWeatherHTML(data.coord.lat, data.coord.lon);
}

// 7 days weather forecast
async function forecastWeatherHTML(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=f50fb40048cb583c6797ce64964afdbe`
  );
  const data = await response.json();

  Storage.set(data.daily);

  daily = data.daily;
  let counter = -1;

  daily.forEach((forecastDay) => {
    const img = getWeatherImageCode(forecastDay.weather[0].id);
    counter++;

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + counter);

    const dayName = currentDate.toLocaleString("en-us", { weekday: "short" });
    const monthName = currentDate.toLocaleString("en-us", { month: "short" });
    const day = currentDate.toLocaleString("en-us").split("/")[1];

    DOM.add(img, dayName, monthName, day, forecastDay);
    apiWhileFetching.closeLoading();
  });

  addChart.addNewChart();
}

const DOM = {
  add(img, dayName, monthName, day, forecastDay) {
    const weatherContainerDiv = document.createElement("div");
    weatherContainerDiv.classList.add("weather-item-container")
    weatherContainerDiv.innerHTML = DOM.addForecastOnHTML(
      img,
      dayName,
      monthName,
      day,
      forecastDay
    );

    const tempForecastChart = (forecastDay.temp.min + forecastDay.temp.max) / 2;

    // AddChart.getData(tempForecastChart.toFixed())

    forecastWeather.appendChild(weatherContainerDiv);
  },

  addForecastOnHTML(img, dayName, monthName, day, forecastDay) {
    html = `
      <div class="weather-item">
        <div class="bottom">
          <div class="bottom-left">
            <img src="./assets/${img}.png" />
            <div class="weather-cards">
              <p class="day-weather">${dayName}, ${monthName}, ${day}</p>
              <p class="forecast-day">${forecastDay.weather[0].description}</p>
            </div>
          </div>

          <div className="bottom-right">
          <p id="forecastTemp">${forecastDay.temp.min.toFixed()}/${forecastDay.temp.max.toFixed()}°C</p>
          </div>
        </div>
      </div>
      `;

    return html;
  },
};

const APP = {
  //initial weather - Bhopal
  async init() {
    searchWeather("Bhopal , India");
  },

  reload() {
    forecastWeather.innerHTML = "";
  },
};

function getWeatherImageCode(weatherCode) {
  if (weatherCode === 800) return "clear";
  if (weatherCode === 801) return "few";
  if (weatherCode === 802) return "clouds";
  if (weatherCode === 803) return "broken";
  if (weatherCode === 804) return "overcast";

  if (weatherCode >= 700) return "clouds ";

  if (weatherCode >= 600) return "snow";

  if (weatherCode >= 500) return "rain";
  if (weatherCode >= 300) return "rain";

  if (weatherCode >= 200) return "thunderstorm";
}

APP.init();


// date 
const currentDate = new Date();
currentDate.setDate(currentDate.getDate());

const dayName = currentDate.toLocaleString("en-us", { weekday: "short" });
const CompleteDayName = currentDate.toLocaleString("en-us", { weekday: "long" });
const monthName = currentDate.toLocaleString("en-us", { month: "long" });

const day = currentDate.toLocaleString("en-us").split("/")[1];
const month = document.querySelector('#month').innerHTML = CompleteDayName + ", " + day;
displayDate.innerText = dayName + ", " + day + ", " + monthName;


// time
setInterval(function () {

  let currentTime = new Date(),
    hours = currentTime.getHours(),
    minutes = currentTime.getMinutes(),
    ampm = hours > 11 ? 'PM' : 'AM';

    hours += hours < 10 ? '0' : '';
    minutes += minutes < 10 ? '0' : '';

  displayTime.innerHTML = hours + ":" + minutes + " " + ampm;
}, 1000);



////////////////////////////////
// ChartJS //
var myChart;

addChart = {
  getChartDate() {
    const date = [];

    let counter = -1;
    Storage.get("forecast").forEach((forecastDay) => {
      counter++;

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + counter);

      const dayName = currentDate.toLocaleString("en-us", { weekday: "short" });
      const day = currentDate.toLocaleString("en-us").split("/")[1];

      const newDate = dayName + "," + day;

      date.push(newDate);
    });

    return date;
  },

  getChartData() {

    let chartData = [];

    for (let i = 0; i < 8; i++) {
      chartData.push(((Storage.get("forecast")[i].temp.max + Storage.get("forecast")[i].temp.min) / 2).toFixed())
    }

    return chartData;
  },

  reload() {
    myChart.data.labels.pop();
    myChart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
      console.log('Updating Chart Data...');
    });
    myChart.destroy();
  },

  addNewChart() {
    if (myChart) {
      addChart.reload();
      console.log('Updating Chart...');
    }

    var ctx = document.getElementById('myChart').getContext('2d');
    const date = addChart.getChartDate();

    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: date,
        datasets: [{
          label: 'Temperature',
          data: addChart.getChartData(),
          fill: true,
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, .2)',
          tension: 0.5,
          borderWidth: 3,
        }]
      },
      options: {
        legend: {
          labels: {
            fontColor: '#ffffff',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
          },
          yAxes: [{
            ticks: {
              fontColor: '#ffffff'
            },

            grid: {
              display: false,
            }
          }],

          xAxes: [{
            grid: {
              display: false,
            },
            ticks: {
              fontColor: '#ffffff'
            }
          }]
        },

        maintainAspectRatio: false,
      }
    });
  }
}


addChart.addNewChart();
