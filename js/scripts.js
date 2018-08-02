(function() {
    var weatherApp;
    var weatherHeader;
    var today = [];
    var tomorrow = [];
    var weatherDescription;
    var cityCoordinates;
    var cells;

    // Hittar rätt index i en array.
    function findIndex(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }

    // Konverterar dagens datum till SMHI:s format.
    function convertTime() {
        var date = new Date();
        return date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    }

    // Konverterar morgondagens datum till SMHI:s format.
    function nextDay() {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        return date.getFullYear() + "-" + ("0" + (date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    }

    // Konverterar intetsägande gradtal till väderstreck.
    function direction(deg) {
        if((deg >= 0 && deg < 22.5) || deg > 337.5) {
            return "(N)";
        }
        else if(deg > 22.5 && deg <= 67.5) {
            return "(NE)";
        }
        else if(deg > 67.5 && deg <= 112.5) {
            return "(E)";
        }
        else if(deg > 112.5 && deg <= 157.5) {
            return "(SE)";
        }
        else if(deg > 157.5 && deg <= 202.5) {
            return "(S)";
        }
        else if(deg > 202.5 && deg <= 247.5) {
            return "(SW)";
        }
        else if(deg > 247.5 && deg <= 292.5) {
            return "(W)";
        }
        else if(deg > 292.5 && deg <= 337.5) {
            return "(NW)";
        }
    }

    // Hämtar initial data och ritar upp tabellstrukturen och initialiserar variabler.
    function init() {
        weatherApp = document.getElementById("weather-app");

        // Initial datahämtning med default-parametrar från index.html.
        fetch('http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/' +
            weatherApp.getAttribute("lon") + '/lat/' + weatherApp.getAttribute("lat") + '/data.json')
            .then(function (res) {
                return res.json();
            })
            .then(updateData);

        // Tabellstrukturen ritas upp.
        weatherApp.innerHTML = "<h1 id='weather-header'>Weather Forecast</h1>\n" +
            "    <h2>Today</h2>\n" +
            "    <table id=\"today-table\">\n" +
            "        <tr>\n" +
            "            <th>Time</th>\n" +
            "            <th>Temperature</th>\n" +
            "            <th>Air Pressure</th>\n" +
            "            <th>Wind</th>\n" +
            "            <th>Description</th>\n" +
            "        </tr>\n" +
            "        <tr>\n" +
            "            <td>06:00</td>\n" +
            "            <td id=\"temp-today-6\">-</td>\n" +
            "            <td id=\"air-today-6\">-</td>\n" +
            "            <td id=\"wind-today-6\">-</td>\n" +
            "            <td id=\"desc-today-6\">-</td>\n" +
            "        </tr>\n" +
            "        <tr>\n" +
            "            <td>12:00</td>\n" +
            "            <td id=\"temp-today-12\">-</td>\n" +
            "            <td id=\"air-today-12\">-</td>\n" +
            "            <td id=\"wind-today-12\">-</td>\n" +
            "            <td id=\"desc-today-12\">-</td>\n" +
            "        </tr>\n" +
            "        <tr>\n" +
            "            <td>18:00</td>\n" +
            "            <td id=\"temp-today-18\">-</td>\n" +
            "            <td id=\"air-today-18\">-</td>\n" +
            "            <td id=\"wind-today-18\">-</td>\n" +
            "            <td id=\"desc-today-18\">-</td>\n" +
            "        </tr>\n" +
            "    </table>\n" +
            "\n" +
            "    <h2>Tomorrow</h2>\n" +
            "    <table id=\"tomorrow-table\">\n" +
            "        <tr>\n" +
            "            <th>Time</th>\n" +
            "            <th>Temperature</th>\n" +
            "            <th>Air Pressure</th>\n" +
            "            <th>Wind</th>\n" +
            "            <th>Description</th>\n" +
            "        </tr>\n" +
            "        <tr>\n" +
            "            <td>06:00</td>\n" +
            "            <td id=\"temp-tomorrow-6\">-</td>\n" +
            "            <td id=\"air-tomorrow-6\">-</td>\n" +
            "            <td id=\"wind-tomorrow-6\">-</td>\n" +
            "            <td id=\"desc-tomorrow-6\">-</td>\n" +
            "        </tr>\n" +
            "        <tr>\n" +
            "            <td>12:00</td>\n" +
            "            <td id=\"temp-tomorrow-12\">-</td>\n" +
            "            <td id=\"air-tomorrow-12\">-</td>\n" +
            "            <td id=\"wind-tomorrow-12\">-</td>\n" +
            "            <td id=\"desc-tomorrow-12\">-</td>\n" +
            "        </tr>\n" +
            "        <tr>\n" +
            "            <td>18:00</td>\n" +
            "            <td id=\"temp-tomorrow-18\">-</td>\n" +
            "            <td id=\"air-tomorrow-18\">-</td>\n" +
            "            <td id=\"wind-tomorrow-18\">-</td>\n" +
            "            <td id=\"desc-tomorrow-18\">-</td>\n" +
            "        </tr>\n" +
            "    </table>\n" +
            "<div>" +
            "    <button class='city-button' id='stockholm'>Stockholm</button>\n" +
            "    <button class='city-button' id='gothenburg'>Göteborg</button>\n" +
            "    <button class='city-button' id='malmo'>Malmö</button>\n" +
            "    <button class='city-button' id='uppsala'>Uppsala</button>\n" +
            "    <button class='city-button' id='linkoping'>Linköping</button>\n" +
            "</div>" +
            "\n" +
            "<input id='latitude' type='number' step='0.0001' placeholder='Latitude' aria-label='Latitude'>\n" +
            "<input id='longitude' type='number' step='0.0001' placeholder='Longitude' aria-label='Longitude'>\n" +
            "<button id='update'>Update Forecast</button>";

        weatherHeader = document.getElementById("weather-header");

        // Elementen sparas i minnet för prestandaökning vid upprepade sökningar.
        cells = {
            "temp-today-6": document.getElementById("temp-today-6"),
            "temp-today-12": document.getElementById("temp-today-12"),
            "temp-today-18": document.getElementById("temp-today-18"),
            "air-today-6": document.getElementById("air-today-6"),
            "air-today-12": document.getElementById("air-today-12"),
            "air-today-18": document.getElementById("air-today-18"),
            "wind-today-6": document.getElementById("wind-today-6"),
            "wind-today-12": document.getElementById("wind-today-12"),
            "wind-today-18": document.getElementById("wind-today-18"),
            "desc-today-6": document.getElementById("desc-today-6"),
            "desc-today-12": document.getElementById("desc-today-12"),
            "desc-today-18": document.getElementById("desc-today-18"),

            "temp-tomorrow-6": document.getElementById("temp-tomorrow-6"),
            "temp-tomorrow-12": document.getElementById("temp-tomorrow-12"),
            "temp-tomorrow-18": document.getElementById("temp-tomorrow-18"),
            "air-tomorrow-6": document.getElementById("air-tomorrow-6"),
            "air-tomorrow-12": document.getElementById("air-tomorrow-12"),
            "air-tomorrow-18": document.getElementById("air-tomorrow-18"),
            "wind-tomorrow-6": document.getElementById("wind-tomorrow-6"),
            "wind-tomorrow-12": document.getElementById("wind-tomorrow-12"),
            "wind-tomorrow-18": document.getElementById("wind-tomorrow-18"),
            "desc-tomorrow-6": document.getElementById("desc-tomorrow-6"),
            "desc-tomorrow-12": document.getElementById("desc-tomorrow-12"),
            "desc-tomorrow-18": document.getElementById("desc-tomorrow-18")
        };

        // Koordinater för olika städer.
        cityCoordinates = {
            "Stockholm":    [59.3294, 18.0686],
            "Gothenburg":   [57.6717, 11.9808],
            "Malmo":        [55.5931, 13.0214],
            "Uppsala":      [59.8497, 17.6389],
            "Linkoping":    [58.4094, 15.6256]
        };

        // Översättning av väderintegers till beskrivande text.
        weatherDescription = {
            1:  "Clear sky",
            2:  "Nearly clear sky",
            3:  "Variable cloudiness",
            4:  "Halfclear sky",
            5:  "Cloudy sky",
            6:  "Overcast",
            7:  "Fog",
            8:  "Light rain showers",
            9:  "Moderate rain showers",
            10: "Heavy rain showers",
            11: "Thunderstorm",
            12: "Light sleet showers",
            13: "Moderate sleet showers",
            14: "Heavy sleet showers",
            15: "Light snow showers",
            16: "Moderate snow showers",
            17: "Heavy snow showers",
            18: "Light rain",
            19: "Moderate rain",
            20: "Heavy rain",
            21: "Thunder",
            22: "Light sleet",
            23: "Moderate sleet",
            24: "Heavy sleet",
            25: "Light snowfall",
            26: "Moderate snowfall",
            27: "Heavy snowfall"
        };
    }

    // Uppdaterar data för idag och imorgon och lägger in det i tabellen.
    function updateData(res) {
        var date = convertTime();
        var nextDate = nextDay();

        var today6Index = findIndex(res.timeSeries, "validTime", date + "T06:00:00Z");
        var today12Index = findIndex(res.timeSeries, "validTime", date + "T12:00:00Z");
        var today18Index = findIndex(res.timeSeries, "validTime", date + "T18:00:00Z");

        var tomorrow6Index = findIndex(res.timeSeries, "validTime", nextDate + "T06:00:00Z");
        var tomorrow12Index = findIndex(res.timeSeries, "validTime", nextDate + "T12:00:00Z");
        var tomorrow18Index = findIndex(res.timeSeries, "validTime", nextDate + "T18:00:00Z");

        // Om det inte finns någon data visar vi "-".
        if(today6Index === -1) {
            today.airP6 = today.temp6 = today.windD6 = today.desc6 = "-";
            today.windS6 = "";

        }
        else {
            today.airP6 = res.timeSeries[today6Index].parameters[0].values[0].toFixed(1) + " hPa";
            today.temp6 = res.timeSeries[today6Index].parameters[1].values[0].toFixed(1) + " &deg;C";
            today.windD6 = direction(res.timeSeries[today6Index].parameters[3].values[0]);
            today.windS6 = res.timeSeries[today6Index].parameters[4].values[0].toFixed(1) + " m/s";
            today.desc6 = weatherDescription[res.timeSeries[today6Index].parameters[18].values[0]];
        }

        if(today12Index === -1) {
            today.airP12 = today.temp12 = today.windD12 = today.desc12 = "-";
            today.windS12 = "";
        }
        else {
            today.airP12 = res.timeSeries[today12Index].parameters[0].values[0].toFixed(1) + " hPa";
            today.temp12 = res.timeSeries[today12Index].parameters[1].values[0].toFixed(1) + " &deg;C";
            today.windD12 = direction(res.timeSeries[today12Index].parameters[3].values[0]);
            today.windS12 = res.timeSeries[today12Index].parameters[4].values[0].toFixed(1) + " m/s";
            today.desc12 = weatherDescription[res.timeSeries[today12Index].parameters[18].values[0]];
        }

        if(today18Index === -1) {
            today.airP18 = today.temp18 = today.windD18 = today.desc18 = "-";
            today.windS18 = "";
        }
        else {
            today.airP18 = res.timeSeries[today18Index].parameters[0].values[0].toFixed(1) + " hPa";
            today.temp18 = res.timeSeries[today18Index].parameters[1].values[0].toFixed(1) + " &deg;C";
            today.windD18 = direction(res.timeSeries[today18Index].parameters[3].values[0]);
            today.windS18 = res.timeSeries[today18Index].parameters[4].values[0].toFixed(1) + " m/s";
            today.desc18 = weatherDescription[res.timeSeries[today18Index].parameters[18].values[0]];
        }

        if(tomorrow6Index === -1) {
            tomorrow.airP6 = tomorrow.temp6 = tomorrow.windD6 = tomorrow.desc6 = "-";
            tomorrow.winds6 = "";
        }
        else {
            tomorrow.airP6 = res.timeSeries[tomorrow6Index].parameters[0].values[0].toFixed(1) + " hPa";
            tomorrow.temp6 = res.timeSeries[tomorrow6Index].parameters[1].values[0].toFixed(1) + " &deg;C";
            tomorrow.windD6 = direction(res.timeSeries[tomorrow6Index].parameters[3].values[0]);
            tomorrow.windS6 = res.timeSeries[tomorrow6Index].parameters[4].values[0].toFixed(1) + " m/s";
            tomorrow.desc6 = weatherDescription[res.timeSeries[tomorrow6Index].parameters[18].values[0]];
        }

        if(tomorrow12Index === -1) {
            tomorrow.airP12 = tomorrow.temp12 = tomorrow.windD12 = tomorrow.desc12 = "-";
            tomorrow.winds12 = "";
        }
        else {
            tomorrow.airP12 = res.timeSeries[tomorrow12Index].parameters[0].values[0].toFixed(1) + " hPa";
            tomorrow.temp12 = res.timeSeries[tomorrow12Index].parameters[1].values[0].toFixed(1) + " &deg;C";
            tomorrow.windD12 = direction(res.timeSeries[tomorrow12Index].parameters[3].values[0]);
            tomorrow.windS12 = res.timeSeries[tomorrow12Index].parameters[4].values[0].toFixed(1) + " m/s";
            tomorrow.desc12 = weatherDescription[res.timeSeries[tomorrow12Index].parameters[18].values[0]];
        }

        if(tomorrow18Index === -1) {
            tomorrow.airP18 = tomorrow.temp18 = tomorrow.windD18 = tomorrow.desc18 = "-";
            tomorrow.winds18 = "";
        }
        else {
            tomorrow.airP18 = res.timeSeries[tomorrow18Index].parameters[0].values[0].toFixed(1) + " hPa";
            tomorrow.temp18 = res.timeSeries[tomorrow18Index].parameters[1].values[0].toFixed(1) + " &deg;C";
            tomorrow.windD18 = direction(res.timeSeries[tomorrow18Index].parameters[3].values[0]);
            tomorrow.windS18 = res.timeSeries[tomorrow18Index].parameters[4].values[0].toFixed(1) + " m/s";
            tomorrow.desc18 = weatherDescription[res.timeSeries[tomorrow18Index].parameters[18].values[0]];
        }

        cells["air-today-6"].innerHTML = today.airP6;
        cells["air-today-12"].innerHTML = today.airP12;
        cells["air-today-18"].innerHTML = today.airP18;

        cells["air-tomorrow-6"].innerHTML = tomorrow.airP6;
        cells["air-tomorrow-12"].innerHTML = tomorrow.airP12;
        cells["air-tomorrow-18"].innerHTML = tomorrow.airP18;

        cells["temp-today-6"].innerHTML = today.temp6;
        cells["temp-today-12"].innerHTML = today.temp12;
        cells["temp-today-18"].innerHTML = today.temp18;

        cells["temp-tomorrow-6"].innerHTML = tomorrow.temp6;
        cells["temp-tomorrow-12"].innerHTML = tomorrow.temp12;
        cells["temp-tomorrow-18"].innerHTML = tomorrow.temp18;

        cells["wind-today-6"].innerHTML = today.windS6 + " " + today.windD6;
        cells["wind-today-12"].innerHTML = today.windS12 + " " + today.windD12;
        cells["wind-today-18"].innerHTML = today.windS18 + " " + today.windD18;

        cells["wind-tomorrow-6"].innerHTML = tomorrow.windS6 + " " + tomorrow.windD6;
        cells["wind-tomorrow-12"].innerHTML = tomorrow.windS12 + " " + tomorrow.windD12;
        cells["wind-tomorrow-18"].innerHTML = tomorrow.windS18 + " " + tomorrow.windD18;

        cells["desc-today-6"].innerHTML = today.desc6;
        cells["desc-today-12"].innerHTML = today.desc12;
        cells["desc-today-18"].innerHTML = today.desc18;

        cells["desc-tomorrow-6"].innerHTML = tomorrow.desc6;
        cells["desc-tomorrow-12"].innerHTML = tomorrow.desc12;
        cells["desc-tomorrow-18"].innerHTML = tomorrow.desc18;

        // Uppdaterar header för att visa vilken prognos sökningen gäller
        document.getElementById("weather-header").innerHTML = "Weather Forecast " + res.geometry.coordinates[0][1] +
            ", " + res.geometry.coordinates[0][0];
    }

    // Fetchar rätt data beroende på latitud och longitud.
    function fetchURL(lat, lon, city) {
        fetch('http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/' +
            lon + '/lat/' + lat + '/data.json')
            .then(function (res) {
                return res.json();
            })
            .then(updateData)
            .then(function() {
                // Skickar vi inte med något stadsnamn defaultar den till koordinaterna från updateData.
                if(city !== undefined) {
                    weatherHeader.innerHTML = "Weather Forecast " + city;
                }
            });
    }

    init();

    // Event listeners
    document.getElementById("stockholm").addEventListener('click', function() {
        fetchURL(cityCoordinates.Stockholm[0], cityCoordinates.Stockholm[1], "Stockholm");
    });

    document.getElementById("gothenburg").addEventListener('click', function() {
        fetchURL(cityCoordinates.Gothenburg[0], cityCoordinates.Gothenburg[1], "Göteborg");
    });

    document.getElementById("malmo").addEventListener('click', function() {
        fetchURL(cityCoordinates.Malmo[0], cityCoordinates.Malmo[1], "Malmö");
    });

    document.getElementById("uppsala").addEventListener('click', function() {
        fetchURL(cityCoordinates.Uppsala[0], cityCoordinates.Uppsala[1], "Uppsala");
    });

    document.getElementById("linkoping").addEventListener('click', function() {
        fetchURL(cityCoordinates.Linkoping[0], cityCoordinates.Linkoping[1], "Linköping");
    });

    document.getElementById('update').addEventListener('click', function () {
        var lat = document.getElementById("latitude").value;
        var lon = document.getElementById("longitude").value;
        // För att undvika felmeddelanden från API låter vi användaren bara skicka in rimliga koordinater.
        if(isNaN(lat) || isNaN(lon) || lat > 70 || lat < 54 || lon > 22 || lon < 10) {
            alert("Please enter coordinates within Sweden.");
        }
        else {
            fetchURL(lat, lon);
        }
    });
}());