import React, { useEffect, useState } from "react";
import accessIcon from "../assets/location.png";
import wind from "../assets/wind.png";
import humidity from "../assets/humidity.png";
import cloud from "../assets/cloud.png";
import searchIcon from "../assets/search.png";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const Home = () => {
  const SERVER = "https://weather-backend-6evk.onrender.com";
  const [isLoading, setIsLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [cord, setCord] = useState(false);
  const [currentTab, setCurrentTab] = useState("yourWeather");
  const [city, setCity] = useState("");
  const [data, setData] = useState({});

  useEffect(() => {
    if (currentTab === "searchWeather") return;
    getfromSessionStorage();
  }, [currentTab]);

  const getfromSessionStorage = () => {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
      setCord(false);
      setShowData(false);
      setIsLoading(false);
    } else {
      setCord(true);
      setIsLoading(true);
      const coordinates = JSON.parse(localCoordinates);
      fetchUserWeatherInfo(coordinates);
      setShowData(true);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  };

  const showPosition = (position) => {
    const userCoordinates = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
  };

  const fetchUserWeatherInfo = async (coordinates) => {
    setIsLoading(true);
    const { lat, lon } = coordinates;
    const response = await fetch(`${SERVER}/api/v1/weather/getWeather`, {
      method: "POST",
      body: JSON.stringify({
        lat,
        lon,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    setData(res.resData);
    setCord(true);
    setShowData(true);
    setIsLoading(false);
  };

  const searchCity = async (city) => {
    setIsLoading(true);
    const response = await fetch(`${SERVER}/api/v1/weather/searchWeather`, {
      method: "POST",
      body: JSON.stringify({
        city,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    if (res.success === false) {
      toast.error(res.message);
      setShowData(false);
      setIsLoading(false);
      return;
    }
    setShowData(true);
    setData(res.resData);
    setIsLoading(false);
  };

  return (
    <div className="text-white flex w-[100vw] h-[100vh] flex-col items-center overflow-hidden bg-gradient-to-r from-blue-900 to-blue-500">
      {/* Heading */}
      <h1 className=" text-[25px] text-center pt-[20px]">
        WEATHER APPLICATION
      </h1>
      {/* Tab Container */}
      <div className="flex w-[90%] max-w-[550px] mx-auto mt-[3.5rem] justify-between">
        <p
          className={`cursor-pointer text-[1.05rem] px-3 py-2 ${
            currentTab === "yourWeather" &&
            "bg-gray-600 bg-opacity-50 rounded-md"
          }`}
          onClick={() => {
            setCurrentTab("yourWeather");
          }}
        >
          Your Weather
        </p>
        <p
          className={`cursor-pointer text-[1.05rem] px-3 py-2 ${
            currentTab === "searchWeather" &&
            "bg-gray-600 bg-opacity-50 rounded-md"
          }`}
          onClick={() => {
            setCurrentTab("searchWeather");
            setShowData(false);
          }}
        >
          Search Weather
        </p>
      </div>
      {/* Main Container */}
      <div className="m-[1rem] w-[100%]">
        {/* Grant Access Container or Search Form Container */}
        {currentTab === "yourWeather" ? (
          <>
            {!cord && !isLoading && (
              <div className="flex flex-col items-center">
                <img
                  className="mb-[2rem]"
                  src={accessIcon}
                  width="80"
                  height="80"
                  loading="lazy"
                />
                <p className="text-[1.75rem] font-semibold">
                  Grant Location Access
                </p>
                <p className="mb-[1.75rem] mt-[0.75rem] font-medium text-[0.95rem]">
                  Allow Access to get weather Information
                </p>
                <button
                  className="text-[0.95rem] rounded-md cursor-pointer px-[30px] py-[10px] mb-[10px] bg-blue-800"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    getLocation();
                    setIsLoading(false);
                  }}
                >
                  Grant Access
                </button>
              </div>
            )}
          </>
        ) : (
          <form className="text-black w-[90%] max-w-[550px] mx-auto justify-center flex items-center gap-x-[10px] mb-[2rem]">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search for City..."
              className=" w-11/12 h-[40px] px-[20px] bg-opacity-50 bg-blue-gray-300 rounded-md outline-none"
            />
            <button
              className="w-[40px] h-[40px] flex items-center justify-center rounded-full mb-[1px]"
              onClick={(e) => {
                e.preventDefault();
                searchCity(city);
                setCity("");
              }}
            >
              <img src={searchIcon} height={20} width={20} loading="lazy" />
            </button>
          </form>
        )}

        {/* Weather Information Display */}
        {isLoading ? (
          <div className="flex mt-20 w-[100%] h-[100%] items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            {showData && (
              <div className="flex flex-col items-center">
                {/* City Name and Flag */}
                <div className="flex items-center gap-x-2 mb-[1rem]">
                  <p className="text-[2rem]">{data.name}</p>
                  <img
                    className="w-[25px] h-[25px] pt-2 object-contain"
                    src={`https://flagcdn.com/144x108/${data.flag}.png`}
                  />
                </div>

                {/* Weather Description, Icon and Temperature */}
                <p className="text-[1.5rem] font-extralight uppercase">
                  {data.desc}
                </p>
                <img
                  className="w-[90px] h-[90px]"
                  src={`http://openweathermap.org/img/w/${data.weatherIcon}.png`}
                />
                <p className="text-[1.5rem] font-extralight">{`${data.temp} °C`}</p>

                {/* Parameters */}
                <div className="w-[90%] flex justify-center items-center mt-[1rem] gap-x-[10px] gap-y-[20px]">
                  {/* Card 1 */}
                  <div className="w-[30%] max-w-[200px] rounded-md p-[1rem] flex flex-col gap-y-[5px] items-center">
                    <img className="w-[50px] h-[50px]" src={wind} />
                    <p className="text-[1.15rem] font-semibold">WINDSPEED</p>
                    <p className="text-[1rem] font-extralight">{`${data.wind} m/s`}</p>
                  </div>

                  {/* Card 2 */}
                  <div class="w-[30%] max-w-[200px] rounded-md p-[1rem] flex flex-col gap-y-[5px] items-center">
                    <img className="w-[50px] h-[50px]" src={humidity} />
                    <p className="text-[1.15rem] font-semibold">HUMIDITY</p>
                    <p className="text-[1rem] font-extralight">
                      {`${data.humidity}%`}
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div class="w-[30%] max-w-[200px] rounded-md p-[1rem] flex flex-col gap-y-[5px] items-center">
                    <img className="w-[50px] h-[50px]" src={cloud} />
                    <p className="text-[1.15rem] font-semibold">CLOUDS</p>
                    <p className="text-[1rem] font-extralight">
                      {`${data.clouds}%`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
