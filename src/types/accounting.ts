// Enterprise-grade accounting domain types (initial scaffold)

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  id: string;
  code: string; // e.g. 1000, 2000 etc
  name: string;
  type: AccountType;
  parentId?: string | null;
  archived?: boolean;
  isContra?: boolean; // marks contra accounts (e.g. accumulated depreciation)
}

export interface JournalLine {
  id: string;
  accountId: string;
  description?: string;
  debit: number; // >=0
  credit: number; // >=0
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date
  memo?: string;
  reference?: string; // external ref / document no.
  lines: JournalLine[]; // must balance
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  accountId: string; // linked asset account
  depreciationExpenseAccountId: string; // expense account
  accumulatedDepAccountId: string; // contra-asset
  acquisitionDate: string; // ISO date
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: 'straight-line';
  disposed?: boolean;
  disposalDate?: string;
}

export interface LedgerPosting {
  entryId: string;
  lineId: string;
  date: string;
  accountId: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
}

export interface BalanceSheetSection {
  label: string;
  accounts: { code: string; name: string; amount: number; }[];
  total: number;
}

export interface BalanceSheetData {
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
}

export interface IncomeStatementSection {
  label: string;
  accounts: { code: string; name: string; amount: number; }[];
  total: number;
}

export interface IncomeStatementData {
  income: IncomeStatementSection;
  expenses: IncomeStatementSection;
  netIncome: number;
}
