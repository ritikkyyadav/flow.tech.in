import { Account, AccountType, AssetRecord, BalanceSheetData, BalanceSheetSection, IncomeStatementData, JournalEntry, LedgerPosting, TrialBalanceRow } from '@/types/accounting';

// In-memory (will persist to localStorage) - simple initial store
interface AccountingStore {
  accounts: Account[];
  journal: JournalEntry[];
  assets: AssetRecord[];
}

const STORAGE_KEY = 'withu_accounting_v1';

const defaultChart: Account[] = [
  { id: '1000', code: '1000', name: 'Cash', type: 'asset' },
  { id: '1100', code: '1100', name: 'Accounts Receivable', type: 'asset' },
  { id: '1500', code: '1500', name: 'Equipment', type: 'asset' },
  { id: '1600', code: '1600', name: 'Accumulated Depreciation - Equipment', type: 'asset', isContra: true },
  { id: '2000', code: '2000', name: 'Accounts Payable', type: 'liability' },
  { id: '3000', code: '3000', name: 'Owner Equity', type: 'equity' },
  { id: '3100', code: '3100', name: 'Retained Earnings', type: 'equity' },
  { id: '4000', code: '4000', name: 'Sales / Revenue', type: 'income' },
  { id: '5000', code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
  { id: '5100', code: '5100', name: 'Depreciation Expense', type: 'expense' },
  { id: '5200', code: '5200', name: 'General Expenses', type: 'expense' },
];

function loadStore(): AccountingStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accounts: defaultChart, journal: [], assets: [] };
    return { accounts: defaultChart, ...JSON.parse(raw) };
  } catch {
    return { accounts: defaultChart, journal: [], assets: [] };
  }
}

function saveStore(store: AccountingStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ journal: store.journal, assets: store.assets }));
}

let store: AccountingStore = loadStore();

export function listAccounts() { return store.accounts.filter(a => !a.archived); }
export function addAccount(account: Omit<Account,'id'> & { id?: string }) {
  const id = account.id || crypto.randomUUID();
  const newAcc: Account = { ...account, id };
  store.accounts.push(newAcc);
  saveStore(store);
  return newAcc;
}

export function addJournalEntry(entry: Omit<JournalEntry,'id'|'createdAt'>) {
  const totalDebit = entry.lines.reduce((s,l)=>s+l.debit,0);
  const totalCredit = entry.lines.reduce((s,l)=>s+l.credit,0);
  if (Math.abs(totalDebit-totalCredit) > 0.0001) throw new Error('Entry not balanced');
  const newEntry: JournalEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  store.journal.push(newEntry);
  saveStore(store);
  return newEntry;
}

export function listJournalEntries() { return [...store.journal].sort((a,b)=>a.date.localeCompare(b.date)); }

export function postToLedger(): LedgerPosting[] {
  const postings: LedgerPosting[] = [];
  for (const entry of store.journal) {
    for (const line of entry.lines) {
      postings.push({ entryId: entry.id, lineId: line.id, date: entry.date, accountId: line.accountId, debit: line.debit, credit: line.credit });
    }
  }
  return postings.sort((a,b)=>a.date.localeCompare(b.date));
}

export function buildTrialBalance(asOf?: string): TrialBalanceRow[] {
  const postings = postToLedger();
  const dateLimit = asOf ? new Date(asOf) : null;
  const map: Record<string, TrialBalanceRow> = {};
  for (const acc of listAccounts()) {
    map[acc.id] = { accountId: acc.id, code: acc.code, name: acc.name, type: acc.type, debit: 0, credit: 0 };
  }
  for (const p of postings) {
    if (dateLimit && new Date(p.date) > dateLimit) continue;
    const row = map[p.accountId];
    if (!row) continue;
    row.debit += p.debit;
    row.credit += p.credit;
  }
  return Object.values(map);
}

export function buildBalanceSheet(asOf: string): BalanceSheetData {
  const tb = buildTrialBalance(asOf);
  const section = (type: AccountType, label: string): BalanceSheetSection => {
    const accounts = tb.filter(r=>r.type===type).map(r=>({ code: r.code, name: r.name, amount: balanceFor(r) }))
      .filter(a=>Math.abs(a.amount) > 0.0001);
    const total = accounts.reduce((s,a)=>s+a.amount,0);
    return { label, accounts, total };
  };
  return {
    assets: section('asset','Assets'),
    liabilities: section('liability','Liabilities'),
    equity: section('equity','Equity')
  };
}

export function buildIncomeStatement(start: string, end: string): IncomeStatementData {
  const postings = postToLedger().filter(p => new Date(p.date) >= new Date(start) && new Date(p.date) <= new Date(end));
  const map: Record<string,{ debit:number; credit:number; acc: Account }> = {};
  for (const acc of listAccounts()) map[acc.id] = { debit:0, credit:0, acc };
  postings.forEach(p=> { const row = map[p.accountId]; if(!row) return; row.debit += p.debit; row.credit += p.credit; });
  const incomeAccounts = Object.values(map).filter(r=>r.acc.type==='income' && (r.debit||r.credit)).map(r=> ({ code: r.acc.code, name: r.acc.name, amount: r.credit - r.debit }));
  const expenseAccounts = Object.values(map).filter(r=>r.acc.type==='expense' && (r.debit||r.credit)).map(r=> ({ code: r.acc.code, name: r.acc.name, amount: r.debit - r.credit }));
  const incomeTotal = incomeAccounts.reduce((s,a)=>s+a.amount,0);
  const expenseTotal = expenseAccounts.reduce((s,a)=>s+a.amount,0);
  return {
    income: { label: 'Income', accounts: incomeAccounts, total: incomeTotal },
    expenses: { label: 'Expenses', accounts: expenseAccounts, total: expenseTotal },
    netIncome: incomeTotal - expenseTotal
  };
}

function balanceFor(row: TrialBalanceRow) {
  const account = listAccounts().find(a=>a.id===row.accountId);
  const net = row.debit - row.credit; // debit normal positive
  if (account?.isContra) return -net; // invert contra
  switch(row.type) {
    case 'asset':
    case 'expense':
      return net;
    default:
      return -net;
  }
}

// Asset Management (straight-line depreciation)
export function addAsset(rec: Omit<AssetRecord,'id'>) {
  const asset: AssetRecord = { ...rec, id: crypto.randomUUID() };
  store.assets.push(asset);
  // Post acquisition journal (Debit Asset, Credit Cash) if not already present by reference
  try {
    addJournalEntry({
      date: rec.acquisitionDate,
      memo: `Asset acquisition - ${asset.name}`,
      lines: [
        { id: crypto.randomUUID(), accountId: rec.accountId, description: 'Asset Cost', debit: rec.cost, credit: 0 },
        { id: crypto.randomUUID(), accountId: '1000', description: 'Cash', debit: 0, credit: rec.cost }
      ]
    });
  } catch { /* ignore if fails */ }
  saveStore(store);
  return asset;
}

export function listAssets() { return [...store.assets]; }

export function generateDepreciationEntries(asOf: string) {
  const entries: JournalEntry[] = [];
  for (const asset of store.assets) {
    if (new Date(asset.acquisitionDate) > new Date(asOf)) continue;
    const months = monthsBetween(asset.acquisitionDate, asOf);
    const totalDepreciable = asset.cost - asset.salvageValue;
    const monthly = totalDepreciable / (asset.usefulLifeYears * 12);
    const accumulated = Math.min(months * monthly, totalDepreciable);
    // existing accumulated posted
  const posted = postedForAsset(asset.accumulatedDepAccountId);
    const toPost = accumulated - posted;
    if (toPost > 0.01) {
      const lineId1 = crypto.randomUUID();
      const lineId2 = crypto.randomUUID();
      entries.push({
        id: crypto.randomUUID(),
        date: asOf,
        memo: `Auto depreciation - ${asset.name}`,
        reference: asset.id,
        createdAt: new Date().toISOString(),
        lines: [
          { id: lineId1, accountId: asset.depreciationExpenseAccountId, description: 'Depreciation Expense', debit: toPost, credit: 0 },
          { id: lineId2, accountId: asset.accumulatedDepAccountId, description: 'Accumulated Depreciation', debit: 0, credit: toPost }
        ]
      });
    }
  }
  return entries;
}

function postedForAsset(accumDepAccountId: string) {
  return postToLedger().filter(p=>p.accountId===accumDepAccountId).reduce((s,p)=>s+p.credit-p.debit,0);
}

function monthsBetween(start: string, end: string) {
  const s = new Date(start); const e = new Date(end);
  return (e.getFullYear()-s.getFullYear())*12 + (e.getMonth()-s.getMonth()) + 1;
}
