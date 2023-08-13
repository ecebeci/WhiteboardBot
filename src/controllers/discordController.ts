import { Canvas } from "canvas";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
} from "discord.js";
import fs = require("node:fs");
import path = require("node:path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

function handleDiscordConnection(token: string) {
  const commandsPath = path.join(__dirname, "../discord/commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
  client.once(Events.ClientReady, () => {
    console.log("Discord Bot Ready!");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });

  client.login(token);
}

function updateMessageCanvas(message: Message | undefined, canvas: Canvas) {
  const buffer = canvas.toBuffer("image/png");
  message?.edit({ files: [{ attachment: buffer }] });
}

function stopMessage(message: Message | undefined) {
  message?.edit({ content: "Stopped", components: [] });
}

export default {
  handleDiscordConnection,
  updateMessageCanvas,
  stopMessage,
};
