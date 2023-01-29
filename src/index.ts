import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));


// own methods
// get all accounts
app.get("/accounts", async (req, res) => {
  const accounts = await prisma.account.findMany({
    orderBy: { lastseen: "desc" },
  });
  if (accounts) {
    return res.json(accounts);
  }

  return res.json({})
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
  if (account) {
    const timestamp = new Date().toISOString();
    const upsertUser = await prisma.account.upsert({
      where: {
        account: account,
      },
      update: { lastseen: timestamp },
      create: {
        createdat: new Date(),
        account: account,
        lastseen: timestamp,
      },
    })
    return res.json(upsertUser);
  }
  return res.json({})
});

// delete account
app.delete("/accounts/", async (req, res) => {
  const account = req.body.account;
  await prisma.account.delete({
    where: { account },
  });
  return res.send({ status: "ok" });
})

// get all commands
app.get("/commands", async (req, res) => {
  const commands = await prisma.commands.findMany({
    orderBy: { createdat: "desc" },
  });
  if (commands) {
    return res.json(commands);
  }

  return res.json({})
});

// add a command
// create or update account with last seen timestamp
// app.post("/commands/", async (req, res) => {
//   console.log(req.body)
//   const commandstring = req.body.command;
//   console.log(commandstring)
//   if (commandstring) {
//     const command = await prisma.commands.create({
//       data: {
//         createdat: new Date(),
//         command: commandstring
//       },
//     })
//     return res.json(command);
//   }
//   return res.json({})
// });

// // delete commands
// app.delete("/commands/", async (req, res) => {
//   const commandstring = req.body.command;
//   await prisma.commands.delete({
//     where: { command: commandstring },
//   });
//   return res.send({ status: "ok" });
// })


app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
