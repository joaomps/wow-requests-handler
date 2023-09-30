-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account" TEXT NOT NULL,
    "lastseen" TEXT NOT NULL,
    "lastscreenshot" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availableaccount" (
    "id" SERIAL NOT NULL,
    "accountname" TEXT NOT NULL,
    "pathtorun" TEXT NOT NULL,
    "devicename" TEXT NOT NULL,

    CONSTRAINT "availableaccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startjob" (
    "id" SERIAL NOT NULL,
    "accounttorun" TEXT NOT NULL,
    "pathtorun" TEXT NOT NULL,
    "devicename" TEXT NOT NULL,

    CONSTRAINT "startjob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runcommands" (
    "id" TEXT NOT NULL,
    "command" TEXT NOT NULL,

    CONSTRAINT "runcommands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_account_key" ON "account"("account");

-- CreateIndex
CREATE UNIQUE INDEX "availableaccount_accountname_key" ON "availableaccount"("accountname");
