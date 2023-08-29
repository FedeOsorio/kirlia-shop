const express = require("express");
const mongoose = require("mongoose");
const Card = require("./models/card");
const path = require("path");
const cors = require("cors"); // Importa el middleware cors
// SDK de Mercado Pago
const mercadopago = require("mercadopago");
const cookieParser = require("cookie-parser");
const nodemailer = require("./sendEmail");
const { log } = require("console");
// Agrega credenciales
mercadopago.configure({
  access_token:
    "TEST-3427444104965446-082221-ee76fb9458a7641c47c675adfaa9f416-188757462",
});
const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors(), express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Configurar opciones de las cookies
app.use((req, res, next) => {
  res.cookie("cookieName", "cookieValue", {
    sameSite: "none", // Establece SameSite=None
    secure: true, // Asegura que las cookies solo se envíen sobre HTTPS
  });
  next();
});

// Conexión a la base de datos
mongoose.connect("mongodb://127.0.0.1:27017/Kirlia", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, "http://localhost:4200/success")));

// Configuración para redirigir todas las rutas a la página principal (Angular)
app.get("/", (req, res) => {
  res.redirect("http://localhost:4200");
});

// Definir rutas CRUD
// TODAS LAS CARTAS
app.get("/cards", async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//FIND BY ID
app.get("/cards/:_id", async (req, res) => {
  try {
    const cardId = req.params._id;

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving card details" });
  }
});

app.put("/cards/:_id", async (req, res) => {
  try {
    const cardId = req.params._id;
    console.log(`Updating stock for card with _id: ${cardId}`);
    const updatedCard = req.body;
    console.log("esto es UpdateCard:", updatedCard);
    const test = await Card.findOneAndUpdate({ _id: cardId }, updatedCard, {
      returnDocument: "after",
    });
    console.log(test);
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Error updating stock" });
  }
});

//MERCADOPAGO
app.post("/create_preference", (req, res) => {
  let items = [];
  const order = req.body.order;
  const shippingCost = req.body.shippingCost;

  for (const product of order) {
    items.push({
      title: product.name,
      unit_price: Number(product.price),
      quantity: Number(product.quantity),
    });
  }

  let preference = {
    items: items,
    shipments: {
      cost: shippingCost,
    },
    back_urls: {
      success: "http://localhost:4200/success",
      failure: "http://localhost:4200/failure",
      pending: "",
    },
    auto_return: "approved",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.json({
        id: response.body.id,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/feedback", function (req, res) {
  res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id,
  });
});

app.post("/send_email", (req, res) => {
  const emailContent = req.body.emailContent;
  const userEmail = req.body.destinataryEmail;
  const adminMail = 'fedee.osorio@gmail.com'
  console.log('Enviando correo al destinatario...');
  // Llama a la función de envío de correo electrónico usando el contenido HTML
  nodemailer.sendEmail(emailContent, userEmail);
  
  console.log('Enviando correo al admin...');
  // Llama a la función de envío de correo electrónico usando el contenido HTML
  nodemailer.sendEmail(emailContent, adminMail);


  res.send("Correo enviado correctamente");
});

app.listen(PORT, () => {
  console.log(`Servidor Express en puerto ${PORT}`);
});
