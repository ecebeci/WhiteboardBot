import * as express from "express";
import * as path from "path";
import { handleWebSocketConnection } from "../controllers/websocketController";
import * as Handlebars from "handlebars";
import * as fs from "fs/promises";

let template: Handlebars.TemplateDelegate<any>;
(async () => {
  try {
    const templateSource = await fs.readFile(
      path.join(__dirname, "..", "..", "src", "views", "index.hbs"),
      "utf-8"
    );
    template = Handlebars.compile(templateSource);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

const router = express.Router();

export const mountRouter = () => {
  router.get("/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;

      if (!template) {
        return res.status(500).send("Template not ready");
      }

      const renderedTemplate = template({ sessionId });
      res.send(renderedTemplate);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.ws("/:sessionId", (ws, req) => {
    const sessionId = req.params.sessionId;
    handleWebSocketConnection(ws, sessionId);
  });
};

export default router;
