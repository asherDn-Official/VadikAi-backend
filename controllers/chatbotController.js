// controllers/chatbotController.js
const OpenAI = require('openai');
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Campaign = require("../models/Campaign");

const openai = new OpenAI(process.env.OPENAI_API_KEY);

exports.chatWithAI = async (req, res) => {
  
  try {
    const { message, context } = req.body;
    
    // Step 1: Analyze the query to determine what data we need
    const dataRequirements = await analyzeQuery(message);
    
    // Step 2: Fetch relevant data from database
    const dbData = await fetchRelevantData(dataRequirements);
    
    // Step 3: Generate a personalized response
    const response = await generateResponse(message, dbData);
    
    res.json({ response });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function analyzeQuery(query) {
  // Use OpenAI to determine what data we need from the database
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: `Analyze this retailer query and return JSON specifying what data to fetch:
      Possible data needs: 
      - customer_birthdays_today: boolean
      - customer_interests: boolean
      - product_availability: boolean
      - customer_purchase_history: boolean
      - campaign_details: boolean
      - customer_demographics: boolean
      Query: "${query}"`
    }]
  });
  
  return JSON.parse(response.choices[0].message.content);
}

async function fetchRelevantData(requirements) {
  const data = {};
  
  if (requirements.customer_birthdays_today) {
    const today = new Date();
    const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;
    
    data.birthdayCustomers = await Customer.aggregate([
      {
        $project: {
          name: 1,
          dateOfBirth: 1,
          interests: 1,
          favouriteProducts: 1,
          monthDay: {
            $concat: [
              { $toString: { $month: "$dateOfBirth" } },
              "-",
              { $toString: { $dayOfMonth: "$dateOfBirth" } }
            ]
          }
        }
      },
      { $match: { monthDay: todayMonthDay } }
    ]);
  }
  
  if (requirements.product_availability) {
    data.products = await Product.find({ status: 'In Stock' });
  }
  
  // Add similar fetches for other requirements
  
  return data;
}

async function generateResponse(query, dbData) {
  const prompt = `You are a retail assistant AI helping a store manager. 
  Use this database information to answer the query:
  
  Database Context:
  ${JSON.stringify(dbData, null, 2)}
  
  Query: "${query}"
  
  Provide a detailed, helpful response with specific recommendations when appropriate.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
}

