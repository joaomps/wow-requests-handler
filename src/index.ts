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
    orderBy: { lastSeen: "desc" },
  });

  res.json(accounts);
});

// get specific account
app.get("/accounts/:account", async (req, res) => {
  const account = req.params.account;
  const accountFound = await prisma.account.findUnique({
    where: { account },
  });

  return res.json(accountFound);
});

// create or update account
app.post("/accounts/", async (req, res) => {
  const account = req.body.account;
  if (account) {
    const upsertUser = await prisma.account.upsert({
      where: {
        account: account,
      },
      update: {},
      create: {
        account: account,
        lastSeen: new Date(),
      },
    })
    return res.json(upsertUser);
  }
  return res.json({})
});



app.post("/todos", async (req, res) => {
  const todo = await prisma.todo.create({
    data: {
      completed: false,
      createdAt: new Date(),
      text: req.body.text ?? "Empty todo",
    },
  });

  return res.json(todo);
});

app.put("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const todo = await prisma.todo.update({
    where: { id },
    data: req.body,
  });

  return res.json(todo);
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
