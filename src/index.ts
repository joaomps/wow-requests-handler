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

app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  await prisma.todo.delete({
    where: { id },
  });

  return res.send({ status: "ok" });
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
