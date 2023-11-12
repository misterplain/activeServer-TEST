const Data = require("../models/dataModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { nodeMailerConfirmationEmail } = require("../../utils/nodeMailer");
const dotenv = require("dotenv");

const errorMessage = "Error";

const getJoke = async () => {
  const options = {
    method: "GET",
    url: "https://dad-jokes.p.rapidapi.com/random/joke",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "dad-jokes.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      const joke = {
        setup: response.data.body[0].setup,
        punchline: response.data.body[0].punchline,
      };
      return joke;
    } else {
      return errorMessage;
    }
  } catch (error) {
    console.log(error.message);
    return errorMessage;
  }
};

const getHoroscope = async (signHS) => {
  const options = {
    method: "GET",
    url: `https://ohmanda.com/api/horoscope/${signHS}/`,
  };
  try {
    let response = await axios.request(options);
    if (response.data.horoscope) {
      return response.data.horoscope;
    } else {
      return errorMessage;
    }
  } catch (error) {
    console.log(error.message);
    return errorMessage;
  }
};

//third api call - moonphase
const getMoonPhase = async () => {
  const options = {
    method: "GET",
    url: "https://moon-phase.p.rapidapi.com/basic",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "moon-phase.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      const moonphaseData = {
        mainText: response.data.phase_name,
        fullMoon: response.data.days_until_next_full_moon,
      };
      return moonphaseData;
    } else {
      return errorMessage;
    }
  } catch (error) {
    console.log({
      message: "catch block moon phase",
      response: error,
    });
    return errorMessage;
  }
};

//fourt api call - weather
const getForecast = async () => {
  const options = {
    method: "GET",
    url: "https://forecast9.p.rapidapi.com/rapidapi/forecast/Barcelona/summary/",
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "forecast9.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      console.log("success");
      const items = response.data.forecast.items;
      const extractedData = items.slice(0, 10).map((item) => ({
        date: item.date,
        min: item.temperature.min,
        max: item.temperature.max,
      }));

      return extractedData;
    } else {
      return errorMessage;
    }
  } catch (error) {
    console.log(error.message);
    return errorMessage;
  }
};

const getNews = async () => {
  const options = {
    method: "GET",
    url: "https://cnbc.p.rapidapi.com/news/v2/list-trending",
    params: {
      tag: "Articles",
      count: "5",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "cnbc.p.rapidapi.com",
    },
  };

  try {
    let response = await axios.request(options);
    if (response.status >= 200 && response.status < 300) {
      console.log("success");
      const items = response.data.data.mostPopularEntries.assets;
      console.log(response.data);
      const extractedData = items.slice(0, 5).map((item) => ({
        title: item.shorterHeadline,
        url: item.url,
        description: item.description,
        body: item.description,
        snippet: item.description,
        image: item.promoImage.url,
      }));

      return extractedData;
    } else {
      console.log("success");
      return errorMessage;
    }
  } catch (error) {
    console.log(error.message);
    return errorMessage;
  }
};

const fetchData = asyncHandler(async (req, res) => {
  try {
    let time = new Date();
    let fetchedDataObject = {};
    fetchedDataObject.date = time;
    fetchedDataObject.horoscope = {};
    const horoscopeData = {};

    console.log("request start time" + time);

    const [joke, moonPhase, forecast, news] = await Promise.all([
      getJoke(),
      getMoonPhase(),
      getForecast(),
      getNews(),
    ]).catch((error) => {
      console.error("Error fetching data:", error);
    });

    if (!joke || !forecast || !news) {
      console.log("Error fetching data joke or moonphase or forecast or news");
      return;
    }

    fetchedDataObject.joke = joke;

    fetchedDataObject.moonPhase = moonPhase;

    fetchedDataObject.forecast = forecast;

    fetchedDataObject.news = news;

    const horoscopeSigns = [
      "aquarius",
      "pisces",
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
    ];
    const results = await Promise.all(
      horoscopeSigns.map(async (sign) => await getHoroscope(sign))
    ).catch((error) => {
      console.error("Error fetching horoscopes:", error);
      return errorMessage;
    });

    if (!results || results.length !== horoscopeSigns.length) {
      console.log("Error fetching horoscopes");
      return;
    }

    results.forEach((result, index) => {
      horoscopeData[horoscopeSigns[index]] = result;
    });
    fetchedDataObject.horoscope = horoscopeData;

    saveDataToDB(fetchedDataObject);
    console.log("request end time" + new Date());
    res.status(200).json({ message: "Data fetched and saved successfully" });
  } catch (error) {
    console.error("Error in fetchData:", error);
    return errorMessage;
  }
});

const saveDataToDB = async (objectToSave) => {
  let time = new Date();

  let dataToSave = {
    date: time,
  };

  if (objectToSave.horoscope) {
    dataToSave.horoscope = objectToSave.horoscope;
  }
  if (objectToSave.joke) {
    dataToSave.joke = objectToSave.joke;
  }
  if (objectToSave.moonPhase) {
    dataToSave.moonPhase = objectToSave.moonPhase;
  }
  if (objectToSave.forecast) {
    dataToSave.forecast = objectToSave.forecast;
  }
  if (Array.isArray(objectToSave.news)) {
    dataToSave.news = objectToSave.news;
  } else {
    console.error("Invalid news data format");
  }

  const newData = new Data(dataToSave);

  try {
    await newData.save();
    console.log("saved to db:" + newData);
    nodeMailerConfirmationEmail("HPNotePad", newData);
    return { success: true, message: "Data saved to DB" };
  } catch (error) {
    console.error("Error in saveDataToDB:", error.message);
    return { success: false, message: "Error saving data to DB" };
  }
};

const getDataByDate = asyncHandler(async (req, res) => {
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  try {
    const dateToFind = req.params.date;
    const startOfDay = new Date(dateToFind);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    let data = await Data.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).exec();

    console.log(data)

    

    if (data.length===0 && dateToFind === formatDate(new Date())) {
      console.log("No data found for today's date");

      const fetchDataResponse = await fetchData();

      if (fetchDataResponse.success) {
        data = await Data.find({
          date: { $gte: startOfDay, $lte: endOfDay },
        }).exec();

        console.log("Data fetched successfully for today");
      } else {
        console.log("Failed to fetch data for today");
        return res.status(500).json({ message: "Failed to fetch data for today" });
      }
    } else if (data.length===0 && dateToFind !== formatDate(new Date())) {
      console.log("No data found for this date (not today)");
      return res.status(404).json({ message: "Data not found for this date" });
    }

    if (data && data.length > 0) {
      return res.json(data);
    } else {
      console.log("No data found for this date");
      return res.json({ message: "No data found for this date" });
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// const getDataByDate = asyncHandler(async (req, res) => {
//   function formatDate(date) {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   }

//   try {
//     const dateToFind = req.params.date;
//     const startOfDay = new Date(dateToFind);
//     const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

//     const data = await Data.find({
//       date: { $gte: startOfDay, $lte: endOfDay },
//     }).exec();

//     if (!data && dateToFind === formatDate(new Date())) {
//       console.log("No data found for today's date");

//       // Trigger a call to fetch data and wait for the response
//       const fetchDataResponse = await fetchData();

//       if (fetchDataResponse.success) {
//         // Fetch data again after successfully fetching
//         const data = await Data.find({
//           date: { $gte: startOfDay, $lte: endOfDay },
//         }).exec();

//         console.log("Data fetched successfully for today");
//         res.json(data);
//       } else {
//         console.log("Failed to fetch data for today");
//         res.status(500).json({ message: "Failed to fetch data for today" });
//       }
//     } else if (!data && dateToFind !== formatDate(new Date())) {
//       console.log("No data found for this date (not today)");
//       res.status(404).json({ message: "Data not found for this date" });
//     } else {
//       console.log("Server error");
//       res.status(500).json({ message: "Internal server error" });
//     }

//     if (data && data.length > 0) {
//       res.json(data);
//     } else {
//       console.log("No data found for this date");
//       res.json({ message: "No data found for this date" });
//     }
//   } catch (error) {
//     console.error("An error occurred:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// const getDataByDate = asyncHandler(async (req, res) => {
//   function formatDate(date) {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   }

//   try {
//     const dateToFind = req.params.date;
//     const startOfDay = new Date(dateToFind);
//     const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

//     const data = await Data.find({
//       date: { $gte: startOfDay, $lte: endOfDay },
//     }).exec();

//     //if no data exists and dateToFind is todays date formatted.. trigger a call to fetch data nd wait for the response and then set data to that variable
//     if (!data && dateToFind === formatDate(new Date())) {
//       console.log("no data for this date");
//       const fetchDataResponse = await fetchData();
//       if (fetchDataResponse.success) {
//         const data = await Data.find({
//           date: { $gte: startOfDay, $lte: endOfDay },
//         }).exec();
//         console.log(
//           "data didn't exist for today, fetched successfully for today"
//         );
//         res.json(data);
//       } else {
//         console.log("data didn't exist for today, fetch failed ");
//         res.status(500).end();
//       }
//     } else if (!data && dateToFind !== formatDate(new Date())) {
//       console.log("no data for this date (not todays date");
//       res.status(500).end();
//     } else {
//       res.status(500).end();
//     }

//     if (data && data.length > 0) {
//       res.json(data);
//     } else {
//       console.log("no data for this date");
//       res.json({ message: "No data for this date" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).end();
//   }
// });

//function to delete all data from before february 12th, 2023
const deleteAllData = asyncHandler(async (req, res) => {
  console.log("deleteAllData");

  const dateToFind = "2023-02-12";
  const startOfDay = new Date(dateToFind);
  console.log(startOfDay);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

  try {
    const data = await Data.deleteMany({
      date: { $lte: endOfDay },
    });
    res.json(data);
    console.log("data deleted");
  } catch (error) {
    console.log(error.message);

    res.status(500).end();
  }
});

module.exports = { fetchData, getDataByDate, deleteAllData };

// const Data = require("../models/dataModel");
// const asyncHandler = require("express-async-handler");
// const axios = require("axios");
// const { nodeMailerConfirmationEmail } = require("../../utils/nodeMailer");

// const errorMessage = "Error";

// const getJoke = async () => {
//   const options = {
//     method: "GET",
//     url: "https://dad-jokes.p.rapidapi.com/random/joke",
//     headers: {
//       "X-RapidAPI-Key": "0824a2c382mshb6a7ecac1677e76p11250cjsndc3ea1d6ec95",
//       "X-RapidAPI-Host": "dad-jokes.p.rapidapi.com",
//     },
//   };

//   try {
//     let response = await axios.request(options).timeout(2000);
//     if (response.status >= 200 && response.status < 300) {
//       const joke = {
//         setup: response.data.body[0].setup,
//         punchline: response.data.body[0].punchline,
//       };
//       return joke;
//     } else {
//       return errorMessage;
//     }
//   } catch (error) {
//     console.log(error.message);
//     return { error: error.message }
//   }
// };

// const getHoroscope = async (signHS) => {
//   const options = {
//     method: "GET",
//     url: `https://ohmanda.com/api/horoscope/${signHS}/`,
//   };
//   try {
//     let response = await axios.request(options).timeout(2000);
//     if (response.data.horoscope) {
//       return response.data.horoscope;
//     } else {
//       return errorMessage;
//     }
//   } catch (error) {
//     console.log(error.message);
//     return { error: error.message }
//   }
// };

// //third api call - moonphase
// const getMoonPhase = async () => {
//   const options = {
//     method: "GET",
//     url: "https://moon-phase.p.rapidapi.com/basic",
//     headers: {
//       "X-RapidAPI-Key": "0824a2c382mshb6a7ecac1677e76p11250cjsndc3ea1d6ec95",
//       "X-RapidAPI-Host": "moon-phase.p.rapidapi.com",
//     },
//   };

//   try {
//     let response = await axios.request(options).timeout(2000);
//     if (response.status >= 200 && response.status < 300) {
//       const moonphaseData = {
//         mainText: response.data.phase_name,
//         fullMoon: response.data.days_until_next_full_moon,
//       };
//       return moonphaseData;
//     } else {
//       return errorMessage;
//     }
//   } catch (error) {
//     console.log({
//       message: "catch block moon phase",
//       response: error,
//     });
//     return { error: error.message }
//   }
// };

// //fourt api call - weather
// const getForecast = async () => {
//   const options = {
//     method: "GET",
//     url: "https://forecast9.p.rapidapi.com/rapidapi/forecast/Barcelona/summary/",
//     headers: {
//       "X-RapidAPI-Key": "0824a2c382mshb6a7ecac1677e76p11250cjsndc3ea1d6ec95",
//       "X-RapidAPI-Host": "forecast9.p.rapidapi.com",
//     },
//   };

//   try {
//     let response = await axios.request(options).timeout(2000);
//     if (response.status >= 200 && response.status < 300) {
//       console.log("success");
//       const items = response.data.forecast.items;
//       const extractedData = items.slice(0, 10).map((item) => ({
//         date: item.date,
//         min: item.temperature.min,
//         max: item.temperature.max,
//       }));

//       return extractedData;
//     } else {
//       return errorMessage;
//     }
//   } catch (error) {
//     console.log(error.message);
//     return { error: error.message }
//   }
// };

// const getNews = async () => {
//   const options = {
//     method: "GET",
//     url: "https://cnbc.p.rapidapi.com/news/v2/list-trending",
//     params: {
//       tag: "Articles",
//       count: "5",
//     },
//     headers: {
//       "X-RapidAPI-Key": "0824a2c382mshb6a7ecac1677e76p11250cjsndc3ea1d6ec95",
//       "X-RapidAPI-Host": "cnbc.p.rapidapi.com",
//     },
//   };

//   try {
//     let response = await axios.request(options).timeout(2000);
//     if (response.status >= 200 && response.status < 300) {
//       console.log("success");
//       const items = response.data.data.mostPopularEntries.assets;
//       console.log(response.data);
//       const extractedData = items.slice(0, 5).map((item) => ({
//         title: item.shorterHeadline,
//         url: item.url,
//         description: item.description,
//         body: item.description,
//         snippet: item.description,
//         image: item.promoImage.url,
//       }));

//       return extractedData;
//     } else {
//       console.log("success");
//       return errorMessage;
//     }
//   } catch (error) {
//     console.log(error.message);
//     return { error: error.message }
//   }
// };

// const fetchData = asyncHandler(async (req, res) => {
//   try {
//     let time = new Date();
//     let fetchedDataObject = {};
//     fetchedDataObject.date = time;
//     fetchedDataObject.horoscope = {};
//     const horoscopeData = {};

//     const [joke, moonPhase, forecast, news] = await Promise.all([
//       getJoke(),
//       getMoonPhase(),
//       getForecast(),
//       getNews(),
//     ]).catch((error) => {
//       console.error("Error fetching data:", error);
//     });

//     if (!joke || !forecast || !news) {
//       console.log("Error fetching data joke or moonphase or forecast or news");
//       return;
//     }

//     fetchedDataObject.joke = joke;

//     fetchedDataObject.moonPhase = moonPhase;

//     fetchedDataObject.forecast = forecast;

//     fetchedDataObject.news = news;

//     const horoscopeSigns = [
//       "aquarius",
//       "pisces",
//       "aries",
//       "taurus",
//       "gemini",
//       "cancer",
//       "leo",
//       "virgo",
//       "libra",
//       "scorpio",
//       "sagittarius",
//       "capricorn",
//     ];
//     const results = await Promise.all(
//       horoscopeSigns.map(async (sign) => await getHoroscope(sign))
//     ).catch((error) => {
//       console.error("Error fetching horoscopes:", error);
//       return errorMessage;
//     });

//     if (!results || results.length !== horoscopeSigns.length) {
//       console.log("Error fetching horoscopes");
//       return;
//     }

//     results.forEach((result, index) => {
//       horoscopeData[horoscopeSigns[index]] = result;
//     });
//     fetchedDataObject.horoscope = horoscopeData;

//     saveDataToDB(fetchedDataObject);
//   } catch (error) {
//     console.error("Error in fetchData:", error);
//     return { error: error.message }
//   }
// });

// const saveDataToDB = async (objectToSave) => {
//   let time = new Date();
//   console.log(objectToSave, "objectToSave from within saveDataToDB");

//   let dataToSave = {
//     date: time,
//   };

//   if (objectToSave.horoscope) {
//     dataToSave.horoscope = objectToSave.horoscope;
//   }
//   if (objectToSave.joke) {
//     dataToSave.joke = objectToSave.joke;
//   }
//   if (objectToSave.moonPhase) {
//     dataToSave.moonPhase = objectToSave.moonPhase;
//   }
//   if (objectToSave.forecast) {
//     dataToSave.forecast = objectToSave.forecast;
//   }
//   if (Array.isArray(objectToSave.news)) {
//     dataToSave.news = objectToSave.news;
//   } else {
//     console.error("Invalid news data format");
//   }

//   const newData = new Data(dataToSave);

//   try {
//     await newData.save();
//     console.log("saved to db");
//     nodeMailerConfirmationEmail("HPNotePad", newData);
//     return { success: true, message: "Data saved to DB" };
//   } catch (error) {
//     console.error("Error in saveDataToDB:", error.message);
//     return { success: false, message: "Error saving data to DB" };
//   }
// };

// const getDataByDate = asyncHandler(async (req, res) => {
//   try {
//     const dateToFind = req.params.date;
//     const startOfDay = new Date(dateToFind);
//     const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

//     const data = await Data.find({
//       date: { $gte: startOfDay, $lte: endOfDay },
//     }).exec();
//     if (data && data.length > 0) {
//       res.json(data);
//     } else {
//       console.log("no data for this date");
//       res.json({ message: "No data for this date" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).end();
//   }
// });

// //function to delete all data from before february 12th, 2023
// const deleteAllData = asyncHandler(async (req, res) => {
//   console.log("deleteAllData");

//   const dateToFind = "2023-08-12";
//   const startOfDay = new Date(dateToFind);
//   console.log(startOfDay);
//   const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

//   try {
//     const data = await Data.deleteMany({
//       date: { $lte: endOfDay },
//     });
//     res.json(data);
//     console.log("data deleted");
//   } catch (error) {
//     console.log(error.message);

//     res.status(500).end();
//   }
// });

// module.exports = { fetchData, getDataByDate, deleteAllData };
