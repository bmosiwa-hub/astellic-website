-- Add salaryExchangeRate to Employee
-- Stores the MWK middle rate used when the employee's gross salary was entered.
-- NULL when currency is MWK (no conversion needed).
ALTER TABLE "Employee" ADD COLUMN "salaryExchangeRate" DOUBLE PRECISION;
