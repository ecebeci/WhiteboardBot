import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import { createSession } from "../../controllers/sessionController";
import discordController from "../../controllers/discordController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start drawing"),
  async execute(interaction: any) {
    const session = createSession();

    const confirm = new ButtonBuilder()
      .setCustomId("stop")
      .setLabel("Stop Session")
      .setStyle(ButtonStyle.Danger);

    const row: ActionRowBuilder = new ActionRowBuilder().addComponents(confirm);

    const response = await interaction.reply({
      content: `Id: ${session.id}?`,
      components: [row],
    });

    const message = await interaction.fetchReply();
    session.message = message;
    console.log(session.id);

    const confirmation = await response.awaitMessageComponent();
    if (confirmation.customId === "stop") {
      discordController.stopMessage(session.message);
      session.stopPeriodicUpdate();
    }
  },
};
