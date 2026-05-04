-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id"            TEXT NOT NULL,
    "currency"      TEXT NOT NULL,
    "buyRate"       DOUBLE PRECISION NOT NULL,
    "middleRate"    DOUBLE PRECISION NOT NULL,
    "sellRate"      DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "source"        TEXT NOT NULL DEFAULT 'RBM',
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    "updatedById"   TEXT,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_currency_key" ON "ExchangeRate"("currency");

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_updatedById_fkey"
    FOREIGN KEY ("updatedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
