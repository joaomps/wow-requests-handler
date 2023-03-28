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
  const commands = await prisma.runcommands.findMany({
    orderBy: { id: "desc" },
  });
  if (commands) {
    return res.json(commands[0]);
  }

  return res.json({})
});

// add a command
// create or update account with last seen timestamp
app.post("/commands/", async (req, res) => {
  const commandstring = req.body.command;
  if (commandstring) {
    const command = await prisma.runcommands.create({
      data: {
        command: commandstring
      },
    })
    return res.json(command);
  }
  return res.json({})
});

// delete commands
app.delete("/commands/:id", async (req, res) => {
  const id = req.params.id;
  await prisma.runcommands.delete({
    where: { id },
  });
  return res.send({ status: "ok" });
})

// get available accounts to retrieve path to run
app.get('/available-accounts', async (req, res) => {
  try {
    const availableAccounts = await prisma.availableaccount.findMany({
      where: {
        NOT: {
          accountname: {
            in: await prisma.account.findMany({
              select: {
                account: true
              }
            })
              .then(rows => rows.map(row => row.account))
          }
        }
      }
    });
    res.json(availableAccounts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// get jobs
app.get('/getjobs', async (req, res) => {
  try {
    const jobs = await prisma.startjob.findFirst();
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// create jobs
app.post('/createjob', async (req, res) => {
  try {
    const { accounttorun, pathtorun, devicename } = req.body.job;
    const newJob = await prisma.startjob.create({
      data: {
        accounttorun: accounttorun,
        pathtorun: pathtorun,
        devicename: devicename
      }
    });
    res.json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.delete('/deletejob/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await prisma.startjob.delete({
      where: {
        id: Number(id)
      }
    });
    res.json(deletedJob);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
