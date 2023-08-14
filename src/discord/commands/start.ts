import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import sessionController from "../../controllers/sessionController";
import discordController from "../../controllers/discordController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start drawing"),
  async execute(interaction: any) {
    const session = sessionController.createSession();
    const response = await discordController.createMessage(
      interaction,
      session
    );
    const confirmation = await response.awaitMessageComponent();

    if (confirmation.customId === "stop") {
      sessionController.stopSession(session);

      const deleteButton = new ButtonBuilder()
        .setCustomId("delete")
        .setLabel("Delete drawing")
        .setStyle(ButtonStyle.Danger);

      discordController.updateMessageComponents(
        session.message,
        new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton)
      );
    } else if (confirmation.customId === "delete") {
      discordController.deleteMessage(session.message);
      sessionController.deleteSession(session.id);
    }
  },
};
