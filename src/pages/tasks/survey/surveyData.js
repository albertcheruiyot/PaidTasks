// This file contains survey data stored locally to minimize Firebase costs
// Only completed survey IDs are stored in Firestore

const surveyData = [
    {
      id: "survey-001",
      title: "Safaricom Customer Experience",
      company: "Safaricom",
      companyLogo: "https://pbs.twimg.com/profile_images/1320977118969368577/afmPtoso_400x400.jpg",
      reward: 200,
      duration: "5 minutes",
      category: "Telecommunications",
      description: "Help Safaricom improve their M-PESA mobile money service by sharing your experience with transactions, customer support, and app usability.",
      difficulty: "easy",
      expiresAt: "2025-07-15",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How often do you use M-PESA services?",
          options: [
            "Multiple times daily",
            "Once a day",
            "A few times a week",
            "Weekly",
            "Monthly",
            "Rarely/Never"
          ],
          required: true
        },
        {
          id: "q2",
          type: "rating",
          text: "How would you rate the speed of M-PESA transactions?",
          scale: 5,
          labels: ["Very Slow", "Slow", "Average", "Fast", "Very Fast"],
          required: true
        },
        {
          id: "q3",
          type: "multiple-choice",
          text: "Which M-PESA service do you use most frequently?",
          options: [
            "Send Money",
            "Pay Bill",
            "Buy Goods and Services",
            "Withdraw Cash",
            "M-PESA Global",
            "Loans and Savings"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How satisfied are you with Safaricom's customer support?",
          scale: 5,
          labels: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true
        },
        {
          id: "q5",
          type: "open-ended",
          text: "What improvements would you suggest for the M-PESA app?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-002",
      title: "Kenya Airways Travel Experience",
      company: "Kenya Airways",
      companyLogo: "https://i.pinimg.com/736x/72/31/8a/72318ae6de8f72b5ba5935fd36bfe0e2.jpg",
      reward: 350,
      duration: "8 minutes",
      category: "Travel & Hospitality",
      description: "Share your feedback about Kenya Airways services, in-flight experience, and booking process to help improve the national carrier's service quality.",
      difficulty: "medium",
      expiresAt: "2025-08-10",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How often do you fly with Kenya Airways?",
          options: [
            "Weekly",
            "Monthly",
            "Quarterly",
            "Yearly",
            "Rarely",
            "This was my first time"
          ],
          required: true
        },
        {
          id: "q2",
          type: "rating",
          text: "How would you rate the check-in process?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q3",
          type: "multiple-choice",
          text: "What class do you typically travel in?",
          options: [
            "Economy",
            "Premium Economy",
            "Business",
            "First Class"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How would you rate the in-flight meals?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-select",
          text: "Which of the following services did you use during your flight? (Select all that apply)",
          options: [
            "In-flight entertainment",
            "Wi-Fi service",
            "Duty-free shopping",
            "Special meal request",
            "Flight attendant assistance",
            "None of the above"
          ],
          required: true
        },
        {
          id: "q6",
          type: "open-ended",
          text: "What could Kenya Airways do to improve your travel experience?",
          placeholder: "Your feedback here...",
          required: false
        }
      ]
    },
    {
      id: "survey-003",
      title: "Equity Bank Digital Banking Survey",
      company: "Equity Bank",
      companyLogo: "https://cdn.iconscout.com/icon/free/png-256/free-equity-bank-icon-download-in-svg-png-gif-file-formats--money-finance-banking-brand-logo-major-brands-logos-pack-icons-8715821.png",
      reward: 250,
      duration: "6 minutes",
      category: "Banking & Finance",
      description: "Help Equity Bank enhance their digital banking experience by sharing your feedback on their mobile app, online banking, and financial services.",
      difficulty: "easy",
      expiresAt: "2025-07-30",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How often do you use Equity Bank's mobile banking app?",
          options: [
            "Daily",
            "Several times a week",
            "Weekly",
            "Monthly",
            "Rarely",
            "Never"
          ],
          required: true
        },
        {
          id: "q2",
          type: "rating",
          text: "How would you rate the ease of use of the Equity mobile app?",
          scale: 5,
          labels: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"],
          required: true
        },
        {
          id: "q3",
          type: "multiple-select",
          text: "Which features do you use most often? (Select all that apply)",
          options: [
            "Account balance inquiry",
            "Fund transfers",
            "Bill payments",
            "Loan applications",
            "Account statements",
            "Investment services"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How secure do you feel when using Equity's digital banking services?",
          scale: 5,
          labels: ["Not Secure", "Somewhat Insecure", "Neutral", "Secure", "Very Secure"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-choice",
          text: "Have you ever encountered issues while using the mobile app?",
          options: [
            "Yes, frequently",
            "Yes, occasionally",
            "Yes, but rarely",
            "No, never"
          ],
          required: true
        },
        {
          id: "q6",
          type: "open-ended",
          text: "What additional features would you like to see in the Equity Bank mobile app?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-004",
      title: "Naivas Supermarket Shopping Experience",
      company: "Naivas Supermarket",
      companyLogo: "https://trendtype.com/wp-content/uploads/2023/07/naivas-logo-1024x1024.png",
      reward: 150,
      duration: "4 minutes",
      category: "Retail",
      description: "Share your shopping experience at Naivas Supermarket to help them improve their product selection, customer service, and overall satisfaction.",
      difficulty: "easy",
      expiresAt: "2025-08-25",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How often do you shop at Naivas Supermarket?",
          options: [
            "Multiple times a week",
            "Once a week",
            "Once every two weeks",
            "Monthly",
            "Occasionally",
            "Rarely"
          ],
          required: true
        },
        {
          id: "q2",
          type: "rating",
          text: "How would you rate the product variety at Naivas?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q3",
          type: "multiple-select",
          text: "Which departments do you typically shop from? (Select all that apply)",
          options: [
            "Fresh produce",
            "Meat and seafood",
            "Bakery",
            "Dairy",
            "Household items",
            "Electronics",
            "Clothing"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How would you rate the cleanliness of Naivas stores?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-choice",
          text: "Do you use the Naivas loyalty card?",
          options: [
            "Yes, every time I shop",
            "Yes, but only sometimes",
            "I have one but rarely use it",
            "No, I don't have one"
          ],
          required: true
        },
        {
          id: "q6",
          type: "open-ended",
          text: "What could Naivas do to improve your shopping experience?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-005",
      title: "KPLC Electricity Service Feedback",
      company: "Kenya Power & Lighting Company",
      companyLogo: "https://images.africanfinancials.com/ke-kplc-logo-min.png",
      reward: 300,
      duration: "7 minutes",
      category: "Utilities",
      description: "Help KPLC improve their electricity services, billing system, and customer support by sharing your experiences and suggestions.",
      difficulty: "medium",
      expiresAt: "2025-09-10",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How do you typically pay your electricity bill?",
          options: [
            "M-PESA",
            "Bank transfer",
            "Direct debit",
            "KPLC office",
            "Retail outlets",
            "Other"
          ],
          required: true
        },
        {
          id: "q2",
          type: "rating",
          text: "How satisfied are you with the reliability of your electricity supply?",
          scale: 5,
          labels: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true
        },
        {
          id: "q3",
          type: "multiple-choice",
          text: "How often do you experience power outages?",
          options: [
            "Daily",
            "Several times a week",
            "Weekly",
            "Monthly",
            "Rarely",
            "Never"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How would you rate KPLC's response time to power outages?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-select",
          text: "Which of the following KPLC services have you used? (Select all that apply)",
          options: [
            "New connection application",
            "Bill querying",
            "Reporting power outage",
            "Token purchase",
            "Meter reading",
            "Technical support"
          ],
          required: true
        },
        {
          id: "q6",
          type: "rating",
          text: "How easy is it to understand your electricity bill?",
          scale: 5,
          labels: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"],
          required: true
        },
        {
          id: "q7",
          type: "open-ended",
          text: "What suggestions do you have for improving KPLC's services?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-006",
      title: "Jumia Online Shopping Experience",
      company: "Jumia",
      companyLogo: "https://images.seeklogo.com/logo-png/55/1/jumia-group-africa-logo-png_seeklogo-556405.png",
      reward: 250,
      duration: "6 minutes",
      category: "E-commerce",
      description: "Share your online shopping experience with Jumia to help improve their platform, delivery services, and customer satisfaction.",
      difficulty: "easy",
      expiresAt: "2025-08-05",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How often do you shop on Jumia?",
          options: [
            "Weekly",
            "Monthly",
            "Quarterly",
            "Yearly",
            "Only during sales events",
            "Rarely"
          ],
          required: true
        },
        {
          id: "q2",
          type: "rating",
          text: "How would you rate the ease of finding products on Jumia?",
          scale: 5,
          labels: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"],
          required: true
        },
        {
          id: "q3",
          type: "multiple-select",
          text: "What categories do you shop most often? (Select all that apply)",
          options: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Beauty & Health",
            "Groceries",
            "Sports & Fitness",
            "Toys & Baby products"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How satisfied are you with Jumia's delivery time?",
          scale: 5,
          labels: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-choice",
          text: "How do you usually pay for your Jumia orders?",
          options: [
            "JumiaPay",
            "Credit/Debit Card",
            "M-PESA",
            "Cash on Delivery",
            "Bank Transfer",
            "Other"
          ],
          required: true
        },
        {
          id: "q6",
          type: "rating",
          text: "How would you rate the accuracy of product descriptions on Jumia?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q7",
          type: "open-ended",
          text: "What improvements would you suggest for the Jumia shopping experience?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-007",
      title: "Tusker Beer Consumer Preferences",
      company: "Kenya Breweries Limited",
      companyLogo: "https://upload.wikimedia.org/wikipedia/en/c/c0/Tusker_lager_logo.png",
      reward: 400,
      duration: "10 minutes",
      category: "Food & Beverage",
      description: "Help Kenya Breweries understand consumer preferences for Tusker Beer products, branding, and marketing campaigns.",
      difficulty: "medium",
      expiresAt: "2025-09-20",
      questions: [
        {
          id: "q1",
          type: "yes-no",
          text: "Are you 21 years or older?",
          required: true
        },
        {
          id: "q2",
          type: "multiple-choice",
          text: "How often do you consume Tusker Beer products?",
          options: [
            "Daily",
            "Several times a week",
            "Weekly",
            "Monthly",
            "Occasionally",
            "Never"
          ],
          required: true
        },
        {
          id: "q3",
          type: "multiple-select",
          text: "Which Tusker variants have you tried? (Select all that apply)",
          options: [
            "Tusker Lager",
            "Tusker Malt",
            "Tusker Lite",
            "Tusker Cider",
            "Tusker Premium Ale",
            "None of these"
          ],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How would you rate the taste of your favorite Tusker variant?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-choice",
          text: "Where do you typically purchase Tusker products?",
          options: [
            "Supermarkets",
            "Bars/Restaurants",
            "Local shops",
            "Wholesale clubs",
            "Online retailers",
            "Other"
          ],
          required: true
        },
        {
          id: "q6",
          type: "rating",
          text: "How important is the Tusker brand's Kenyan heritage to you?",
          scale: 5,
          labels: ["Not Important", "Slightly Important", "Moderately Important", "Important", "Very Important"],
          required: true
        },
        {
          id: "q7",
          type: "multiple-select",
          text: "Which of these occasions do you associate with Tusker? (Select all that apply)",
          options: [
            "Watching sports",
            "Social gatherings",
            "After work relaxation",
            "Weekend celebrations",
            "Special occasions",
            "Meals at home",
            "Other"
          ],
          required: true
        },
        {
          id: "q8",
          type: "open-ended",
          text: "What new Tusker product would you like to see introduced?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-008",
      title: "KCB Banking Services Feedback",
      company: "Kenya Commercial Bank",
      companyLogo: "https://images.seeklogo.com/logo-png/39/2/kcb-group-plc-logo-png_seeklogo-392008.png",
      reward: 300,
      duration: "7 minutes",
      category: "Banking & Finance",
      description: "Share your feedback on KCB's banking services, digital platforms, and customer support to help them enhance their service delivery.",
      difficulty: "medium",
      expiresAt: "2025-07-25",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "How long have you been a KCB customer?",
          options: [
            "Less than a year",
            "1-3 years",
            "4-6 years",
            "7-10 years",
            "More than 10 years"
          ],
          required: true
        },
        {
          id: "q2",
          type: "multiple-select",
          text: "Which KCB services do you currently use? (Select all that apply)",
          options: [
            "Savings account",
            "Current account",
            "KCB mobile banking",
            "Credit card",
            "Loan services",
            "Foreign exchange",
            "Investment services"
          ],
          required: true
        },
        {
          id: "q3",
          type: "rating",
          text: "How would you rate the customer service at KCB branches?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How user-friendly is the KCB mobile banking app?",
          scale: 5,
          labels: ["Not User-Friendly", "Somewhat Unfriendly", "Neutral", "User-Friendly", "Very User-Friendly"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-choice",
          text: "How often do you visit a KCB branch?",
          options: [
            "Weekly",
            "Monthly",
            "Quarterly",
            "Yearly",
            "Rarely",
            "Never (I use digital banking only)"
          ],
          required: true
        },
        {
          id: "q6",
          type: "rating",
          text: "How satisfied are you with KCB's loan application process?",
          scale: 5,
          labels: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true
        },
        {
          id: "q7",
          type: "open-ended",
          text: "What improvements would you suggest for KCB's banking services?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-009",
      title: "Uber/Bolt Ride-Hailing Experience",
      company: "Ride-Hailing Services",
      companyLogo: "https://logodownload.org/wp-content/uploads/2015/05/uber-logo-5-1.png",
      reward: 200,
      duration: "5 minutes",
      category: "Transportation",
      description: "Share your experiences with ride-hailing services in Kenya to help improve driver quality, app functionality, and overall customer satisfaction.",
      difficulty: "easy",
      expiresAt: "2025-08-15",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "Which ride-hailing services do you use most frequently?",
          options: [
            "Uber",
            "Bolt (Taxify)",
            "Little",
            "inDriver",
            "Other",
            "I don't use ride-hailing services"
          ],
          required: true
        },
        {
          id: "q2",
          type: "multiple-choice",
          text: "How often do you use ride-hailing services?",
          options: [
            "Daily",
            "Several times a week",
            "Weekly",
            "Monthly",
            "Only occasionally"
          ],
          required: true
        },
        {
          id: "q3",
          type: "rating",
          text: "How would you rate the availability of drivers in your area?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q4",
          type: "rating",
          text: "How satisfied are you with the ride costs?",
          scale: 5,
          labels: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true
        },
        {
          id: "q5",
          type: "multiple-select",
          text: "What factors are most important to you when choosing a ride-hailing service? (Select all that apply)",
          options: [
            "Price",
            "Waiting time",
            "Driver rating",
            "Car quality",
            "App user experience",
            "Safety features",
            "Customer support"
          ],
          required: true
        },
        {
          id: "q6",
          type: "rating",
          text: "How safe do you feel when using ride-hailing services?",
          scale: 5,
          labels: ["Very Unsafe", "Unsafe", "Neutral", "Safe", "Very Safe"],
          required: true
        },
        {
          id: "q7",
          type: "open-ended",
          text: "What improvements would you suggest for ride-hailing services in Kenya?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    },
    {
      id: "survey-010",
      title: "DSTV/Showmax Streaming Experience",
      company: "MultiChoice Kenya",
      companyLogo: "https://dstvinstaller247.co.za/images/gallery-img3.jpg",
      reward: 350,
      duration: "8 minutes",
      category: "Entertainment",
      description: "Help improve DSTV and Showmax content selection, streaming quality, and service offerings by sharing your entertainment preferences and experiences.",
      difficulty: "medium",
      expiresAt: "2025-09-15",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          text: "Which services do you currently subscribe to?",
          options: [
            "DSTV only",
            "Showmax only",
            "Both DSTV and Showmax",
            "Neither"
          ],
          required: true
        },
        {
          id: "q2",
          type: "multiple-choice",
          text: "If you have DSTV, which package are you subscribed to?",
          options: [
            "Premium",
            "Compact Plus",
            "Compact",
            "Family",
            "Access",
            "I don't have DSTV"
          ],
          required: true
        },
        {
          id: "q3",
          type: "rating",
          text: "How satisfied are you with the content selection?",
          scale: 5,
          labels: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true
        },
        {
          id: "q4",
          type: "multiple-select",
          text: "What type of content do you watch most? (Select all that apply)",
          options: [
            "Movies",
            "TV series",
            "Sports",
            "News",
            "Documentaries",
            "Reality shows",
            "Children's programming",
            "Music"
          ],
          required: true
        },
        {
          id: "q5",
          type: "rating",
          text: "How would you rate the streaming quality?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q6",
          type: "multiple-choice",
          text: "How do you typically access DSTV/Showmax content?",
          options: [
            "DSTV decoder",
            "Smartphone app",
            "Tablet app",
            "Smart TV app",
            "Web browser",
            "Multiple devices"
          ],
          required: true
        },
        {
          id: "q7",
          type: "rating",
          text: "How do you rate the value for money of your subscription?",
          scale: 5,
          labels: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
          required: true
        },
        {
          id: "q8",
          type: "open-ended",
          text: "What content or features would you like to see added to the service?",
          placeholder: "Your suggestions here...",
          required: false
        }
      ]
    }
  ];
  
  export default surveyData;