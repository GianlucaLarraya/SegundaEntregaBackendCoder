import fs from "fs";
import { v4 as uuid } from "uuid";

export class MsgManager {
  constructor() {
    this.messages = [];
    this.path = "./src/managers/data/messages.json";
  }

  async getMsgs() {
    if (!fs.existsSync(this.path)) {
      await fs.promises.writeFile(this.path, JSON.stringify([])); // Crear el archivo si no existe
    }
  
    const file = await fs.promises.readFile(this.path, "utf-8");
    this.messages = JSON.parse(file) || [];
    return this.messages;
  }

  async addMsg(message) {
    await this.getMsgs();

    const { user, text } = message;

    const newMessage = {
      id: uuid(),
      user,
      text,
    };

    // Validar que todos los campos sean obligatorios
    const validateProperties = Object.values(newMessage);
    if (validateProperties.includes(undefined)) throw new Error("Todos los campos son obligatorios");

    this.messages.push(newMessage);

    await fs.promises.writeFile(this.path, JSON.stringify(this.messages));

    return newMessage;
  }

}