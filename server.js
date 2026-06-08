
// server.js

import express from "express";

import cors from "cors";

import dotenv from "dotenv";

import quizRoutes
from "./routes/quizroutes.js";

import aiTutorRoutes
from "./routes/aitutorroutes.js";

import paymentRoutes
from "./routes/paymentroutes.js";

import imageAiRoutes
from "./routes/imageairoutes.js";

import imageChatRoutes
from "./routes/imagechatroutes.js";
// ================= LOAD ENV =================

dotenv.config();

// ================= APP =================

const app = express();

// ================= PORT =================

const PORT =
  process.env.PORT || 5000;

// ================= CORS =================

app.use(

  cors({

    origin: "*",

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],

    credentials: true,
  })
);

// ================= BODY LIMIT =================

app.use(

  express.json({

    limit: "100mb",
  })
);

app.use(

  express.urlencoded({

    limit: "100mb",

    extended: true,
  })
);

// ================= REQUEST LOGGER =================

app.use(

  (req, res, next) => {

    console.log(

      `${req.method} ${req.url}`
    );

    next();
  }
);

// ================= MAIN ROUTE =================

app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "AI Learning Backend Running 🚀",
  });
});

// ================= API ROUTES =================

app.use(
  "/api",
  quizRoutes
);

app.use(
  "/api",
  aiTutorRoutes
);

app.use(
  "/api",
  imageAiRoutes
);


app.use(
  "/api",
  imageChatRoutes
);


app.use(
  "/api",
  paymentRoutes
);
// ================= 404 =================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    error:
      "Route not found",
  });
});

// ================= GLOBAL ERROR HANDLER =================

app.use(

  (
    error,
    req,
    res,
    next
  ) => {

    console.log(
      "GLOBAL ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      error:
        "Internal server error",

      details:
        error.message,
    });
  }
);

// ================= SERVER =================

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    `http://localhost:${PORT}`
  );
});

