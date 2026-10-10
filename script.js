"use strict";

const apiKey = '2a10caecee262df0bde4d177c2925f77';

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

$(".header button#options").onclick = showOptions;

let lang = "es",
units = "metric",
coordsOfCity = new Map ();

function clickInContainerOptions ({target}) {
  let [endpoint,value] = target.id.split("-"),{coords,city} = target.dataset;
  
  if (endpoint === "units") units = value
  else if (endpoint === "lang") lang = value;
  else if (coords) {
    let [lat,lon] = coords.split(":"),
    [name,state] = city.split(":");
    
    coordsOfCity.set("latitude",lat);
    coordsOfCity.set("longitude",lon);
    
    setNameCitySelected(name,state);
    
    getWeatherOfMyPositionPlace();
  }
  else if (target.id === "close-options-container") $(".container-options").remove();
  
  if (endpoint === "units" || endpoint === "lang") {
    const $FILLCIRCLEBEFORESELECTED = target.parentElement.querySelector(".option .circle .fill.scale-1");
    
    $FILLCIRCLEBEFORESELECTED?.classList.remove("scale-1");
    $FILLCIRCLEBEFORESELECTED?.parentElement.classList.remove("color-select-option");
    
    const $CIRCLEOPTION = target.querySelector(".circle");
    
    $CIRCLEOPTION.classList.add(".color-select-option");
    
    //FILL CIRCLE
    $CIRCLEOPTION.firstElementChild.classList.add("scale-1");
    
    getWeatherOfMyPositionPlace();
  }
}

function showOptions () {
  const HTMLCONTAINERWITHOPTIONS = `
    <div class="container-options">
      <div class="container-option container-search">
        <input type="text" id="input-name-city" placeholder="Search City">
        <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="container-similar-cities">
        </div>
      </div>
      <div class="container-option">
        <p class="name-option" id="units">Unidades de temperatura</p>
        <div class="options-for-select">
          <div class="option" id="units-metric">
            <div class="circle">
              <span class="fill"></span>
            </div>
            <p class="text">Celsius</p>
          </div>
          <div class="option" id="units-imperial">
            <div class="circle">
              <span class="fill"></span>
            </div>
            <p class="text">Farenheint</p>
          </div>
        </div>
      </div>
      <div class="container-option">
        <p class="name-option" id="lang">Idiomas</p>
        <div class="options-for-select">
          <div class="option" id="lang-es">
            <div class="circle">
              <span class="fill"></span>
            </div>
            <p class="text">Spanish</p>
          </div>
          <div class="option" id="lang-en">
            <div class="circle">
              <span class="fill"></span>
            </div>
            <p class="text">English</p>
          </div>
        </div>
      </div>
      <button id="close-options-container">Cerrar</button>
    </div>
  `
  
  $(".header").insertAdjacentHTML("beforeend",HTMLCONTAINERWITHOPTIONS);
  
  changeLenguageOfOptions();
  
  const $CIRCLEOPTIONUNIT = $(`.container-options .container-option .option#units-${units}`).querySelector(".circle"),
  $CIRCLEOPTIONLANG = $(`.container-options .container-option .option#lang-${lang}`).querySelector(".circle");
  
  $CIRCLEOPTIONUNIT.classList.add("color-select-option");
  $CIRCLEOPTIONLANG.classList.add("color-select-option");
  
  $CIRCLEOPTIONUNIT.querySelector(".fill").classList.add("scale-1");
  $CIRCLEOPTIONLANG.querySelector(".fill").classList.add("scale-1");
  
  const $CONTAINEROPTIONS = $(".container-options");
  
  $CONTAINEROPTIONS.onclick = clickInContainerOptions;
  
  const $INPUTFORNAMECITY = $(".container-options #input-name-city");
  
  $INPUTFORNAMECITY.oninput = writingInSearchCityInput;
}

function writingInSearchCityInput ({target}) {
  let valueInput = target.value;
  
  const $CONTAINERSIMILARCITYS = $(".container-similar-cities");
  
  if (valueInput.trim() === "") {
    $CONTAINERSIMILARCITYS.style.setProperty("visibility","hidden"); 
    return;
  }
  
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${valueInput}&limit=5&appid=${apiKey}&lang=${lang}`).then(res=>res.json()).then(res=>{
    let htmlOfAllCitys = ``;
    
    res.forEach(({state,name,lat,lon})=>{
      htmlOfAllCitys += `<p data-coords="${lat}:${lon}" data-city="${name}:${state}">${name}`;
      
      if (state) htmlOfAllCitys += `,${state}</p>\n`;
      else htmlOfAllCitys += `</p>\n`;
    })
    
    if (res.length > 0) $CONTAINERSIMILARCITYS.style.setProperty("visibility","visible");
    else $CONTAINERSIMILARCITYS.style.setProperty("visibility","hidden");
    
    $CONTAINERSIMILARCITYS.innerHTML = htmlOfAllCitys;
    
    }).catch(err=>console.log(err))
}

function getWeatherOfMyPositionPlace (setNameCity) {
  let options = {
    enableHightAccuracy:false,
    timeout:5000,
    maximumage:60000
  };
  
  const getAllInformationOfWeather = (latitude,longitude) => {
    getClimateCurrentOfPlace(latitude,longitude,setNameCity);
    getClimateOfnextTimes(latitude,longitude);
    getQualityAir(latitude,longitude);
    changeLenguagePage();
  }
  
  if (coordsOfCity.has("latitude")) {
    getAllInformationOfWeather(coordsOfCity.get("latitude"),coordsOfCity.get("longitude"))
    return;
  }
  
  navigator.geolocation.getCurrentPosition(position=>{
    let {latitude,longitude} = position.coords;
    console.log(latitude,longitude)
    getAllInformationOfWeather(latitude,longitude)
    
    coordsOfCity.set("latitude",latitude);
    coordsOfCity.set("longitude",longitude);
  },err=>{
    console.log(err)
  },options)
}

getWeatherOfMyPositionPlace(setNameCitySelected);

function changeLenguageOfOptions () {
  let textForLanguageApply = {
    "units":{"es":"Unidades de temperatura","en":"Temperature units"},
    "lang":{"es":"Idiomas","en":"Languages"}
  }
  
  $$(".container-options .container-option .name-option").forEach($P=>{
    $P.innerText = textForLanguageApply[$P.id][lang];
  })
  
  if ($(".container-options")) {
    const textForApplyButtonClose = {
      "es":"Cerrar",
      "en":"Close"
    },textForApplyInputSearchCity = {
      "es":"Buscar Ciudad",
      "en":"Search City"
    }
    
    $(".container-options #close-options-container").innerText = textForApplyButtonClose[lang];
    
    $(".container-options .container-search input").setAttribute("placeholder",textForApplyInputSearchCity[lang])
  }
}

function changeLenguagePage () {
  const $TEXTCLIMATE = $(".header #climate-text"),
  $TEXTTOPOFTIMENOW = $(".container-main-climate-current .container-top .text-now-climate"),
  $TEXTNOWINCONTAINERHOURSANDDEGREES = $(".container-main-climate-current .container-center #container-climate-now .time")
  
  let [textForClimate,textForNow] = lang === "es" ? ["Clima","Ahora"] : ["Weather","Now"];
  
  $TEXTCLIMATE.innerText = textForClimate;
  
  $TEXTTOPOFTIMENOW.innerText = textForNow;
  
  $TEXTNOWINCONTAINERHOURSANDDEGREES.innerText = textForNow;
  
  let TEXTFOROTHERVALUESCLIMATEINLENGUAGE = {
    "container-air":{"es":"Viento","en":"Wind"},
    "container-humidity":{"es":"Humedad","en":"Humidity"},
    "container-quality-air":{"es":"Calidad de el aire","en":"Air quality"},
    "container-rain":{"es":"Lluvia","en":"Rain"}
  }
  
  $$(".container-others-data-of-climate-now > div").forEach($CONTAINER=>{
    const $PFORNAMEPROPERTY = $CONTAINER.querySelector("p.text-property"),
    idContainer = $CONTAINER.id;
    
    $PFORNAMEPROPERTY.innerText = TEXTFOROTHERVALUESCLIMATEINLENGUAGE[idContainer][lang];
  })
  
  changeLenguageOfOptions()
}

function setQualityAirOfNow ({list}) {
  let indexQuality = list[0].main.aqi;
  
  let qualityAirAsText = {
    1:{"es":"Bien","en":"Good","color":"#00f100"},
    2:{"es":"Justo","en":"Fair","color":"#f1f100"},
    3:{"es":"Moderado","en":"Mild","color":"#f1ae00"},
    4:{"es":"Pobre","en":"Poor","color":"#f16500"},
    5:{"es":"Muy Pobre","en":"Very Poor","color":"#f10000"}
  }
  
  const $TEXTQUALITYAIR = $(".container-others-data-of-climate-now #container-quality-air > div span.quality-text"),
  $ICONCOLORQUALITY = $(".container-others-data-of-climate-now #container-quality-air > div span.circle");
  
  let propsOfIndexQuality = qualityAirAsText[indexQuality];
  
  $TEXTQUALITYAIR.innerText = propsOfIndexQuality[lang];
  
  $ICONCOLORQUALITY.style.setProperty("background-color",propsOfIndexQuality["color"]);
  
  $ICONCOLORQUALITY.previousElementSibling.innerText = "•";
}

function getQualityAir (lat,lon) {
  fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(res=>res.json()).then(res=>setQualityAirOfNow(res)).catch(err=>console.log(err))
}

function setInformationOfClimateForNextHoursAndDays ({list}) {
  const getHtmlOfContainer = (degree,time,srcIcon) => `<div class="container-degree-and-icon-next">
      <p class="degree-text">${degree}°</p>
      <div class="container-icon-and-hour">
        <img src="${srcIcon}" alt="climate-icon">
        <p class="time">${time}</p>
      </div>
    </div>`;
    
  const getHtmlOfContainerForNextDay = (dayName,urlIcon,maxDegree,minDegree) => `<div class="next-day-container">
    <p class="day-name">${dayName}</p>
    <img src="${urlIcon}" alt="climate-icon">
    <p class="degree-text">${maxDegree}°/${minDegree}°</p>
  </div>`;
  
  const $CONTAINERDAYSCLIMATE = $(".container-inf-main .container-icon-and-degree-next-days");
  
  let degreesClimateMaxAndMinOfDaysNext = new Map ();
  
  const $CONTAINERFORNEXTTIMES = $(".container-main-climate-current .container-center");
  
  $CONTAINERFORNEXTTIMES.querySelectorAll(".container-degree-and-icon-next").forEach($CONTAINER=>{
    if ($CONTAINER.id !== "container-climate-now") $CONTAINER.remove();
  })
  
  for (let values of list) {
    let {main,weather} = values,
    {icon} = weather[0];
    
    let timeOfClimate = new Date (values["dt_txt"]);
    
    let key = values["dt_txt"].split(" ")[0];
    
    let {maxDegree,minDegree,iconOfMaxDegree,dtTxtForApply} = degreesClimateMaxAndMinOfDaysNext.get(key) ?? {};
    
    let temp = Math.floor(main.temp);
    
    let newValues = {maxDegree,minDegree,iconOfMaxDegree,dtTxtForApply};
    
    if (temp > maxDegree || maxDegree === undefined) {
      newValues.maxDegree = temp;
      newValues.iconOfMaxDegree = icon;
      newValues.dtTxtForApply = values["dt_txt"];
    }
    
    if (temp < minDegree || minDegree === undefined) newValues.minDegree = temp;
    
    degreesClimateMaxAndMinOfDaysNext.set(key,newValues);
    
    $CONTAINERFORNEXTTIMES.insertAdjacentHTML("beforeend",getHtmlOfContainer(temp,`${String(timeOfClimate.getHours()).padStart(2,"0")}:${String(timeOfClimate.getMinutes()).padStart(2,"0")}`,`https://openweathermap.org/img/wn/${icon}@4x.png`));
  }
  
  let valuesOfLenguages = {
    "en":"US",
    "es":"ES"
  }
  
  $CONTAINERDAYSCLIMATE.querySelectorAll(".next-day-container").forEach($C=>{$C.remove()})
  
  degreesClimateMaxAndMinOfDaysNext.entries().forEach(([_,values])=>{
    const {maxDegree,minDegree,iconOfMaxDegree,dtTxtForApply} = values;
    
    let dayName = new Date (dtTxtForApply);
    
    $CONTAINERDAYSCLIMATE.insertAdjacentHTML("beforeend",getHtmlOfContainerForNextDay(dayName.toLocaleDateString(`${lang}-${valuesOfLenguages[lang]}`,{weekday:"short"}),`https://openweathermap.org/img/wn/${iconOfMaxDegree}@4x.png`,maxDegree,minDegree));
  })
}

function setInformationOfClimateNow ({weather,main,wind,rain}) {
  const $TEXTDEGREENOW = $(".container-inf-main .container-icon-and-degree p"),
  $IMGICONCLIMATENOW = $(".container-inf-main .container-icon-and-degree #icon-climate-now"),
  $TEXTDESCRIPTIONCLIMATE = $(".container-inf-main .container-text-status-cloud-and-feeling .description-climate"),
  $TEXTFEELINGCLIMATE =  $(".container-inf-main .container-text-status-cloud-and-feeling .thermal-sensation"),
  $TIMETEXTOFCLIMATENOW = $(".container-main-climate-current .container-center #container-climate-now"),
  $FORWINDVALUE = $(".container-others-data-of-climate-now #container-air span"),
  $FORHUMIDITYVALUE = $(".container-others-data-of-climate-now #container-humidity span"),
  $FORRAINVALUE = $(".container-others-data-of-climate-now #container-rain span");
  
  let {icon,description} = weather[0],
  {temp} = main;
  
  let tempCurrent = `${Math.floor(temp)}°`;
  
  $TEXTDEGREENOW.innerText = tempCurrent;
  
  $TEXTDESCRIPTIONCLIMATE.innerText = description;
  
  let textSensationInLenguage = lang === "es" ? "Sensación Termica de" : "Thermal Sensation"
  
  $TEXTFEELINGCLIMATE.innerText = textSensationInLenguage + ` ${Math.floor(main["feels_like"])}°`;
  
  let srcIconOfClimateNow = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  
  $IMGICONCLIMATENOW.src = srcIconOfClimateNow
  
  $TIMETEXTOFCLIMATENOW.querySelector("img").src = srcIconOfClimateNow;
  $TIMETEXTOFCLIMATENOW.querySelector(".degree-text").innerText = tempCurrent;
  
  let numToMultiply = units === "metric" ? 3.6 : 1.60934;
  
  const $CONTAINERRAININF = $(".container-others-data-of-climate-now #container-rain");
  
  if (rain) {
    $CONTAINERRAININF.querySelector("span").innerText = `•  ${rain["1h"]} mm/h`;
    $CONTAINERRAININF.style.setProperty("display","flex");
  }
  else $CONTAINERRAININF.style.setProperty("display","none");
  
  $FORWINDVALUE.innerText = `•  ${Math.round(wind.speed * numToMultiply)} km/h`;
  $FORHUMIDITYVALUE.innerText = `•  ${main.humidity} %`;
  
  $(".container-name-location .circle").style.setProperty("visibility","visible");
}

function setNameCitySelected (name,state) {
  let textToShow = name;
  
  if (state !== "undefined") textToShow += `,${state}`;
  
  $(".container-name-location .text-name-location").innerText = textToShow;
}

function getClimateCurrentOfPlace (latitude,longitude,setNameCity = ()=>{}) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}&lang=${lang}`).then(res=>res.json()).then(res=>{
    setInformationOfClimateNow(res);
    setNameCity(res.name,res.sys.country);
  }).catch(err=>console.log(err))
}

function getClimateOfnextTimes (latitude,longitude) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}&lang=${lang}`).then(res=>res.json()).then(res=>{
    setInformationOfClimateForNextHoursAndDays(res);
  }).catch(err=>console.log(err,"en la lista de pronosticos"))
}
