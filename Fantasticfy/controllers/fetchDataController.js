const asyncHandler = require("express-async-handler");
const axios = require("axios");

const fetchData = asyncHandler(async (req, res) => {
  const options = {
    method: "GET",
    url: "https://test-fullstack.myshopify.com/admin/api/2023-04/products.json",
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  };
  const { data } = await axios.request(options);


  res.json(data);
});

module.exports = { fetchData };
