import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import { MsgManager } from "./managers/msgManager.js";

const msgManager = new MsgManager();

let messages = [];

const initializeMessages = async () => {
  messages = await msgManager.getMsgs();
};

await initializeMessages();


const app = express();
// Para que nuestro servidor express pueda interpretar en forma automática mensajes de tipo JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = 8080;
// Configuración de handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", "./src/views");
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  res.render("index");
});

const httpServer = app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});

// Configuración de socket

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`Nuevo cliente conectado con el id ${socket.id}`);

  socket.emit("messageLogs", messages);

  socket.on("newUser", (data) => {
    socket.broadcast.emit("newUser", data);
  });

  socket.on("message", async (data) => {
    try {
      // Añadir el mensaje al archivo y a la lista en memoria
      const newMessage = await msgManager.addMsg(data);
      messages.push(newMessage);

      // Emitir los mensajes actualizados a todos los clientes
      io.emit("messageLogs", messages);
    } catch (error) {
      console.error("Error al registrar el mensaje:", error.message);
      socket.emit("error", { error: error.message });
    }
  });
});