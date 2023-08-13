import * as express from "express";
import * as expressWs from "express-ws";
import * as dotenv from "dotenv";
import sessionRoutes, { mountRouter } from "./routes/sessionRoutes";
import discordController from "./controllers/discordController";

const app = express();
expressWs(app);

mountRouter();
app.use("/", sessionRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

discordController.handleDiscordConnection(
  dotenv.config().parsed?.DISCORD_TOKEN || "NO TOKEN FOUND"
);
