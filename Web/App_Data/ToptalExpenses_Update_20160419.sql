ALTER TABLE [dbo].[ExpenseModels]
    ADD [Comment] NVARCHAR (MAX) NULL;


GO

ALTER TABLE [dbo].[ExpenseModels] ALTER COLUMN [Date] DATETIMEOFFSET (7) NOT NULL;


GO