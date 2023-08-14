import { Canvas } from "canvas";
import {
  ActionRowBuilder,
  ActionRowData,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
} from "discord.js";
import fs = require("node:fs");
import path = require("node:path");
import Session from "../models/Session";
import sessionController from "./sessionController";

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

async function createMessage(interaction: any, session: Session): Promise<any> {
  // const linkButton = new ButtonBuilder()
  // .setCustomId("link")
  // .setLabel("Link")
  // .setStyle(ButtonStyle.Primary);

  const stopButton = new ButtonBuilder()
    .setCustomId("stop")
    .setLabel("Stop Session")
    .setStyle(ButtonStyle.Danger);

  const row: ActionRowBuilder = new ActionRowBuilder().addComponents(
    stopButton
  );

  const response = await interaction.reply({
    content: `Id: ${session.id}`,
    components: [row],
  });

  const message = await interaction.fetchReply();
  if (!(message instanceof Message)) {
    console.error("Invalid message provided." + message);
  } else {
    session.setMessage(message);
  }

  return response;
}

function updateMessageCanvas(message: Message, canvas: Canvas) {
  const buffer = canvas.toBuffer("image/png");
  if (!(message instanceof Message)) {
    console.error("Invalid message provided." + message);
    return;
  }
  message?.edit({ files: [{ attachment: buffer }] });
}

function updateMessageComponents(
  message: Message,
  components: ActionRowBuilder<ButtonBuilder> | ActionRowData<ButtonBuilder>
) {
  message?.edit({ components: [components] });
}

function stopMessage(message: Message | undefined) {
  message?.edit({ content: "Stopped", components: [] });
}

function deleteMessage(message: Message | undefined) {
  message?.delete();
  message?.channel.send("Deleted");
}

export default {
  handleDiscordConnection,
  updateMessageCanvas,
  updateMessageComponents,
  createMessage,
  stopMessage,
  deleteMessage,
};
