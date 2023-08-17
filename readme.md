# Discord Simple Whiteboard Bot

### A bot that allows you to draw on a live canvas with other users.

![Screenshot](https://i.imgur.com/Rr43olE.png)

## Installation

1. Clone the repository
2. Install dependencies with `yarn install`
3. Create a `.env` file in the root directory and add the .env.example contents to it. Fill in the values.
4. Run the bot with `yarn start`

## Using the bot

/start - Starts a new whiteboard session
When a session is started, the bot will send you a link id to the whiteboard. You can share this id link with other users to allow them to draw on the same canvas.

## Used technologies

- Discord.js
- WebSocket
- Express.js
- Node canvas
- Handlebars

## Current missing features

- Eraser :)
- Drawing shapes
- Various UX improvements
- Clustering and scaling
