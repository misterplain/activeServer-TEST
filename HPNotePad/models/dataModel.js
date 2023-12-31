const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    joke: {
      data: {
        setup: String,
        punchline: String,
      },
      response: {
        success: Boolean,
        errorMessage: String,
      },
    },
    horoscope: {
      data: {
        aries: {
          type: String,
          // required: true,
        },
        taurus: {
          type: String,
          // required: true,
        },
        gemini: {
          type: String,
          // required: true,
        },
        cancer: {
          type: String,
          // required: true,
        },
        leo: {
          type: String,
          // required: true,
        },
        virgo: {
          type: String,
          // required: true,
        },
        libra: {
          type: String,
          // required: true,
        },
        scorpio: {
          type: String,
          // required: true,
        },
        sagittarius: {
          type: String,
          // required: true,
        },
        capricorn: {
          type: String,
          // required: true,
        },
        aquarius: {
          type: String,
          // required: true,
        },
        pisces: {
          type: String,
          // required: true,
        },
      },
      response: {
        success: Boolean,
        errorMessage: String,
      },
    },
    moonPhase: {
      data: {
        mainText: String,
        fullMoon: Number,
      },
      response: {
        success: Boolean,
        errorMessage: String,
      },
    },
    forecast: {
      data: [
        {
          date: String,
          min: Number,
          max: Number,
        },
      ],
      response: {
        success: Boolean,
        errorMessage: String,
      },
    },
    news: {
      data: [
        {
          title: String,
          description: String,
          url: String,
          body: String,
          snippet: String,
          image: String,
        },
      ],
      response: {
        success: Boolean,
        errorMessage: String,
      },
    },
  },
  {
    collection: "notepadData", // specify custom collection name
  }
);

module.exports = mongoose.model("Data", dataSchema);

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const dataSchema = new Schema({
//   date: {
//     type: Date,
//     required: true,
//   },
//   joke: {
//     setup: {
//       type: String,
//       // required: true,
//     },
//     punchline: {
//       type: String,
//       // required: true,
//     },
//   },
// horoscope: {
//   aries: {
//     type: String,
//     // required: true,
//   },
//   taurus: {
//     type: String,
//     // required: true,
//   },
//   gemini: {
//     type: String,
//     // required: true,
//   },
//   cancer: {
//     type: String,
//     // required: true,
//   },
//   leo: {
//     type: String,
//     // required: true,
//   },
//   virgo: {
//     type: String,
//     // required: true,
//   },
//   libra: {
//     type: String,
//     // required: true,
//   },
//   scorpio: {
//     type: String,
//     // required: true,
//   },
//   sagittarius: {
//     type: String,
//     // required: true,
//   },
//   capricorn: {
//     type: String,
//     // required: true,
//   },
//   aquarius: {
//     type: String,
//     // required: true,
//   },
//   pisces: {
//     type: String,
//     // required: true,
//   },
// },
//   moonPhase: {
//     mainText: {
//       type: String,
//       // required: true,
//     },
//     emoji: {
//       type: String,
//       // required: true,
//     },
//     fullMoon: {
//       type: Number
//     }
//   },
//   forecast: [
//     {
//       date: {
//         type: String,
//         // required: true,
//       },
//       min: {
//         type: Number,
//         // required: true,
//       },
//       max: {
//         type: Number,
//         // required: true,
//       },
//     },
//   ],
//   news: [
//     {
//       title: {
//         type: String,
//         // required: true,
//       },
//       description: {
//         type: String,
//         // required: true,
//       },
//       url: {
//         type: String,
//         // required: true,
//       },
//       body: {
//         type: String,
//         // required: true,
//       },
//       snippet: {
//         type: String,
//         // required: true,
//       },
//       image: {
//         type: String,
//         // required: true,
//       },
//       errorMessage: { type: String },
//     },
//   ],
// },{
//   collection: 'notepadData', // specify custom collection name
// });

// module.exports = mongoose.model("Data", dataSchema);
