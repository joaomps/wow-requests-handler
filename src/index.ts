import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import sharp from "sharp";
require("express-async-errors");

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(cors());
// app.use(express.raw({ type: "application/vnd.custom-type" }));
// app.use(express.text({ type: "text/html" })); removed for now

// get all accounts
app.get("/accounts", async (req, res) => {
  const accounts = await prisma.account.findMany({
    orderBy: { lastseen: "desc" },
  });
  if (accounts) {
    return res.json(accounts);
  }

  return res.json({});
});

// get specific account
app.get("/accounts/:account", async (req, res) => {
  const account = req.params.account;
  const accountFound = await prisma.account.findUnique({
    where: { account },
  });

  return res.json(accountFound);
});

// create or update account with last seen timestamp
app.post("/accounts/", async (req, res) => {
  const account = req.body.account;
  const image = req.body.image;

  if (account && image) {
    const imageAsBuffer = Buffer.from(image, "base64");

    const resizedBuffer = await sharp(imageAsBuffer)
      .resize(1440, 900, { fit: "inside" })
      .toBuffer();

    const resizedImageBase64 = resizedBuffer.toString("base64");

    const upsertUser = await prisma.account.upsert({
      where: {
        account: account,
      },
      update: {
        lastseen: new Date().toISOString(),
        lastscreenshot: resizedImageBase64,
        lastscreenshottakenat: new Date().toUTCString(),
        status: req.body.status ? req.body.status : "Online",
      },
      create: {
        account: account,
        lastseen: new Date().toISOString(),
        lastscreenshot: resizedImageBase64,
        lastscreenshottakenat: new Date().toUTCString(),
        status: req.body.status ? req.body.status : "Online",
      },
    });
    return res.json(upsertUser);
  } else {
    const upsertUser = await prisma.account.upsert({
      where: {
        account: account,
      },
      update: {
        lastseen: new Date().toISOString(),
        status: req.body.status ? req.body.status : "Online",
        current_gold: req.body.current_gold ? req.body.current_gold : "0",
        break_time: req.body.break_time,
      },
      create: {
        account: account,
        lastseen: new Date().toISOString(),
        status: req.body.status ? req.body.status : "Online",
        current_gold: req.body.current_gold ? req.body.current_gold : "0",
        break_time: req.body.break_time,
      },
    });
    return res.json(upsertUser);
  }
});

// delete account
app.delete("/accounts/", async (req, res) => {
  const account = req.body.account;
  await prisma.account.delete({
    where: { account },
  });
  return res.send({ status: "ok" });
});

// get all commands
app.get("/commands", async (req, res) => {
  const commands = await prisma.runcommands.findMany({
    orderBy: { id: "desc" },
  });
  if (commands) {
    return res.json(commands[0]);
  }

  return res.json({});
});

// add a command
// create or update account with last seen timestamp
app.post("/commands/", async (req, res) => {
  const commandstring = req.body.command;
  if (commandstring) {
    const command = await prisma.runcommands.create({
      data: {
        command: commandstring,
      },
    });
    return res.json(command);
  }
  return res.json({});
});

// delete commands
app.delete("/commands/:id", async (req, res) => {
  const id = req.params.id;
  await prisma.runcommands.delete({
    where: { id },
  });
  return res.send({ status: "ok" });
});

// get all available accounts
app.get("/all-accounts", async (req, res) => {
  const accounts = await prisma.availableaccount.findMany({});
  if (accounts) {
    return res.json(accounts);
  }

  return res.json({});
});

// get available accounts to retrieve path to run
app.get("/available-accounts", async (req, res) => {
  const availableAccounts = await prisma.availableaccount.findMany({
    where: {
      NOT: {
        accountname: {
          in: await prisma.account
            .findMany({
              select: {
                account: true,
              },
            })
            .then((rows) => rows.map((row) => row.account)),
        },
      },
    },
  });
  res.json(availableAccounts);
});

// get jobs
app.get("/getjobs", async (req, res) => {
  const jobs = await prisma.startjob.findFirst({
    orderBy: {
      id: "asc",
    },
  });
  res.json(jobs);
});

// create jobs
app.post("/createjob", async (req, res) => {
  const { accounttorun, pathtorun, devicename } = req.body.job;
  const newJob = await prisma.startjob.create({
    data: {
      accounttorun: accounttorun,
      pathtorun: pathtorun,
      devicename: devicename,
    },
  });
  res.json(newJob);
});

app.delete("/deletejob/:id", async (req, res) => {
  const { id } = req.params;
  const deletedJob = await prisma.startjob.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(deletedJob);
});

app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (err.type === "request.aborted") {
    res.status(400).send("Request aborted by the client");
  } else {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Started server on http://localhost:${port}`);
});
