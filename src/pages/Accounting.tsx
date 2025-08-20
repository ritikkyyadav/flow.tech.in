import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calculator, Building2, FileText, Layers, BarChart3, RefreshCcw, Archive, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { addAsset, addJournalEntry, buildBalanceSheet, buildIncomeStatement, buildTrialBalance, generateDepreciationEntries, listAccounts, listAssets, listJournalEntries } from '@/services/accountingService';
import { Account, JournalEntry as EntryType } from '@/types/accounting';

// Utility format
const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface NewLineState { accountId: string; description: string; debit: string; credit: string; }

const Accounting = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState<NewLineState[]>([{ accountId: '', description: '', debit: '', credit: '' }]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journal, setJournal] = useState<EntryType[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [balanceSheetDate, setBalanceSheetDate] = useState(date);
  const [plStart, setPlStart] = useState(date.slice(0,7)+'-01');
  const [plEnd, setPlEnd] = useState(date);
  const [assets, setAssets] = useState(listAssets());
  const [assetForm, setAssetForm] = useState({ name:'', cost:'', salvage:'0', life:'5' });
  const [offsetAccountId, setOffsetAccountId] = useState('1000');

  const refresh = () => {
    setAccounts(listAccounts());
    setJournal(listJournalEntries());
    setAssets(listAssets());
  };
  useEffect(refresh, []);

  const totals = useMemo(()=>{
    let debit=0, credit=0; 
    lines.forEach(l=>{ debit += parseFloat(l.debit)||0; credit += parseFloat(l.credit)||0; });
    const nonEmptyLines = lines.filter(l => (parseFloat(l.debit)||0) > 0 || (parseFloat(l.credit)||0) > 0);
    const singleSided = nonEmptyLines.length === 1 && ((debit>0 && credit===0) || (credit>0 && debit===0));
    return {debit, credit, balanced: Math.abs(debit-credit) < 0.001 && debit>0, singleSided};
  },[lines]);

  const submitEntry = () => {
    try {
      let prepared = lines.filter(l=> (parseFloat(l.debit)||0) >0 || (parseFloat(l.credit)||0)>0).map(l=> ({
        id: crypto.randomUUID(),
        accountId: l.accountId,
        description: l.description,
        debit: parseFloat(l.debit)||0,
        credit: parseFloat(l.credit)||0,
      }));

      // Auto-balance if single-sided
      if (!totals.balanced && totals.singleSided && prepared.length === 1) {
        const line = prepared[0];
        const acc = accounts.find(a=>a.id===line.accountId);
        if (!acc) throw new Error('Select an account');
        if (line.debit === 0 && line.credit === 0) throw new Error('Enter an amount');
        // If user entered credit on an expense/asset, flip to debit (likely mistake)
        if (line.credit>0 && (acc.type==='expense' || acc.type==='asset')) {
          line.debit = line.credit; line.credit = 0;
        }
        const amount = line.debit>0 ? line.debit : line.credit;
        const isDebitFirst = line.debit>0;
        if (isDebitFirst) {
          // Add credit balancing line
            prepared.push({ id: crypto.randomUUID(), accountId: offsetAccountId, description: 'Auto balance', debit: 0, credit: amount });
        } else {
          // Add debit balancing line
            prepared.push({ id: crypto.randomUUID(), accountId: offsetAccountId, description: 'Auto balance', debit: amount, credit: 0 });
        }
      }

      const totalDebit = prepared.reduce((s,l)=>s+l.debit,0);
      const totalCredit = prepared.reduce((s,l)=>s+l.credit,0);
      if (Math.abs(totalDebit-totalCredit) > 0.001) throw new Error('Entry not balanced. Add balancing line.');

      addJournalEntry({ date, memo, lines: prepared });
      setLines([{ accountId:'', description:'', debit:'', credit:'' }]);
      setMemo('');
      setShowNewEntry(false);
      refresh();
    } catch(e:any) {
      alert(e.message);
    }
  };

  const tb = useMemo(()=>buildTrialBalance(balanceSheetDate),[journal,balanceSheetDate]);
  const bs = useMemo(()=>buildBalanceSheet(balanceSheetDate),[tb,balanceSheetDate]);
  const pl = useMemo(()=>buildIncomeStatement(plStart, plEnd),[journal,plStart,plEnd]);

  const autoDep = () => {
    const entries = generateDepreciationEntries(balanceSheetDate);
    entries.forEach(e=> addJournalEntry({ date: e.date, memo: e.memo, lines: e.lines }));
    refresh();
  };

  const addAssetRow = () => {
    if(!assetForm.name || !assetForm.cost) return;
    addAsset({
      name: assetForm.name,
      accountId: '1500',
      accumulatedDepAccountId: '1600',
      depreciationExpenseAccountId: '5100',
      acquisitionDate: date,
      cost: parseFloat(assetForm.cost),
      salvageValue: parseFloat(assetForm.salvage)||0,
      usefulLifeYears: parseInt(assetForm.life)||5,
      depreciationMethod: 'straight-line'
    });
    setAssetForm({ name:'', cost:'', salvage:'0', life:'5' });
    // Delay refresh slightly to ensure journal entry persisted
    setTimeout(refresh, 10);
  };

  return (
    <DashboardLayout activeTab="accounting">
      <div className="p-4 lg:p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Layers className="w-5 h-5 text-blue-600"/> Enterprise Accounting</h1>
            <p className="text-gray-600 text-sm">Journal • Chart of Accounts • Assets • Balance Sheet • P&L • Trial Balance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={()=>setShowNewEntry(s=>!s)}><Plus className="w-4 h-4 mr-2"/>Journal Entry</Button>
            <Button size="sm" variant="outline" onClick={autoDep}><RefreshCcw className="w-4 h-4 mr-2"/>Run Depreciation</Button>
          </div>
        </div>

        {showNewEntry && (
          <Card className="border-blue-200">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4"/> New Journal Entry</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Date</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
                </div>
                <div className="flex-1 min-w-[240px] space-y-1">
                  <label className="text-xs font-medium">Memo</label>
                  <input value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Description" className="border rounded px-2 py-1 text-sm w-full"/>
                </div>
                <div className="self-end text-xs text-gray-600">Total: {fmt(totals.debit)} / {fmt(totals.credit)} {(totals.balanced || totals.singleSided) ? <span className="text-emerald-600 font-semibold ml-2">{totals.balanced? 'Balanced':'Will Auto-Balance'}</span> : <span className="text-orange-500 ml-2">Not Balanced</span>}</div>
              </div>
              {totals.singleSided && (
                <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1">
                  <span className="font-medium text-blue-700">Offset Account</span>
                  <select value={offsetAccountId} onChange={e=>setOffsetAccountId(e.target.value)} className="border rounded px-1 py-0.5 text-xs bg-white">
                    {accounts.map(a=> <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                  </select>
                  <span className="text-blue-600">System will add balancing line automatically.</span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                      <th className="py-2 px-2 text-left">Account</th>
                      <th className="py-2 px-2 text-left">Description</th>
                      <th className="py-2 px-2 text-right">Debit</th>
                      <th className="py-2 px-2 text-right">Credit</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l,i)=>(
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-1">
                          <select value={l.accountId} onChange={e=>setLines(ls=>ls.map((x,idx)=> idx===i? {...x, accountId:e.target.value}:x))} className="w-full border rounded px-1 py-1">
                            <option value="">Select</option>
                            {accounts.map(a=> <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                          </select>
                        </td>
                        <td className="p-1">
                          <input value={l.description} onChange={e=>setLines(ls=>ls.map((x,idx)=> idx===i? {...x, description:e.target.value}:x))} className="w-full border rounded px-1 py-1"/>
                        </td>
                        <td className="p-1">
                          <input type="number" value={l.debit} onChange={e=>setLines(ls=>ls.map((x,idx)=> idx===i? {...x, debit:e.target.value, credit:''}:x))} className="w-full border rounded px-1 py-1 text-right"/>
                        </td>
                        <td className="p-1">
                          <input type="number" value={l.credit} onChange={e=>setLines(ls=>ls.map((x,idx)=> idx===i? {...x, credit:e.target.value, debit:''}:x))} className="w-full border rounded px-1 py-1 text-right"/>
                        </td>
                        <td className="p-1 text-center">
                          <Button variant="ghost" size="icon" onClick={()=>setLines(ls=>ls.filter((_,idx)=>idx!==i))} className="h-6 w-6">×</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={()=>setLines(ls=>[...ls,{ accountId:'', description:'', debit:'', credit:'' }])}>Add Line</Button>
                <Button size="sm" disabled={!(totals.balanced || totals.singleSided)} onClick={submitEntry} className="bg-blue-600 text-white hover:bg-blue-700">Post Entry</Button>
                <Button size="sm" variant="ghost" onClick={()=>setShowNewEntry(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid xl:grid-cols-3 gap-6">
          {/* Journal */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4"/>Journal ({journal.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto">
              {journal.map(e=> (
                <div key={e.id} className="border rounded-md p-2 bg-white">
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{e.date}</span><span>{e.memo}</span></div>
                  <table className="w-full text-xs">
                    <tbody>
                      {e.lines.map(l=> {
                        const acc = accounts.find(a=>a.id===l.accountId); return (
                        <tr key={l.id}>
                          <td className="py-0.5 pr-2 w-48">{acc?.code} {acc?.name}</td>
                          <td className="py-0.5 pr-2 flex-1">{l.description}</td>
                          <td className="py-0.5 pr-2 text-right text-emerald-600">{l.debit?fmt(l.debit):''}</td>
                          <td className="py-0.5 pr-2 text-right text-red-600">{l.credit?fmt(l.credit):''}</td>
                        </tr> );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
              {journal.length===0 && <div className="text-sm text-gray-500">No entries yet.</div>}
            </CardContent>
          </Card>

          {/* Assets */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4"/> Assets ({assets.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {assets.map(a=> (
                  <div key={a.id} className="text-xs flex justify-between border-b last:border-0 pb-1"><span className="font-medium truncate" title={a.name}>{a.name}</span><span>{fmt(a.cost)}</span></div>
                ))}
                {assets.length>0 && <div className="flex justify-between text-[10px] uppercase font-semibold pt-1"><span>Total Cost</span><span>{fmt(assets.reduce((s,a)=>s+a.cost,0))}</span></div>}
                {assets.length===0 && <div className="text-xs text-gray-500">No assets</div>}
              </div>
              <div className="space-y-1 text-xs">
                <input placeholder="Name" value={assetForm.name} onChange={e=>setAssetForm(f=>({...f,name:e.target.value}))} className="border rounded w-full px-1 py-1"/>
                <div className="grid grid-cols-3 gap-1">
                  <input placeholder="Cost" value={assetForm.cost} onChange={e=>setAssetForm(f=>({...f,cost:e.target.value}))} className="border rounded px-1 py-1"/>
                  <input placeholder="Salvage" value={assetForm.salvage} onChange={e=>setAssetForm(f=>({...f,salvage:e.target.value}))} className="border rounded px-1 py-1"/>
                  <input placeholder="Life (yrs)" value={assetForm.life} onChange={e=>setAssetForm(f=>({...f,life:e.target.value}))} className="border rounded px-1 py-1"/>
                </div>
                <Button size="xs" className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={addAssetRow}>Add Asset</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Statements */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4"/> Balance Sheet</CardTitle>
              <input type="date" value={balanceSheetDate} onChange={e=>setBalanceSheetDate(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
            </CardHeader>
            <CardContent className="text-xs space-y-3 max-h-[340px] overflow-y-auto">
              {(['assets','liabilities','equity'] as const).map(section=> (
                <div key={section}>
                  <div className="font-semibold uppercase tracking-wide text-gray-600 mb-1 text-[10px]">{bs[section].label}</div>
                  <div className="space-y-0.5">
                    {bs[section].accounts.map(a=> <div key={a.code} className="flex justify-between"><span>{a.code} {a.name}</span><span>{fmt(a.amount)}</span></div>)}
                  </div>
                  <div className="flex justify-between font-medium border-t pt-0.5 mt-0.5"><span>Total {bs[section].label}</span><span>{fmt(bs[section].total)}</span></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Income Statement</CardTitle>
              <div className="flex gap-1">
                <input type="date" value={plStart} onChange={e=>setPlStart(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                <input type="date" value={plEnd} onChange={e=>setPlEnd(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-3 max-h-[340px] overflow-y-auto">
              <div>
                <div className="font-semibold text-gray-600 text-[10px] uppercase">Income</div>
                {pl.income.accounts.map(a=> <div key={a.code} className="flex justify-between"><span>{a.code} {a.name}</span><span>{fmt(a.amount)}</span></div>)}
                <div className="flex justify-between font-medium border-t mt-0.5 pt-0.5"><span>Total Income</span><span>{fmt(pl.income.total)}</span></div>
              </div>
              <div>
                <div className="font-semibold text-gray-600 text-[10px] uppercase">Expenses</div>
                {pl.expenses.accounts.map(a=> <div key={a.code} className="flex justify-between"><span>{a.code} {a.name}</span><span>{fmt(a.amount)}</span></div>)}
                <div className="flex justify-between font-medium border-t mt-0.5 pt-0.5"><span>Total Expenses</span><span>{fmt(pl.expenses.total)}</span></div>
              </div>
              <div className="flex justify-between font-semibold text-sm border-t pt-1">
                <span>Net Income</span>
                <span className={pl.netIncome>=0? 'text-emerald-600':'text-red-600'}>{fmt(pl.netIncome)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2"><Archive className="w-4 h-4"/> Trial Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-xs max-h-[340px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-[10px] uppercase text-gray-600">
                    <th className="py-1 text-left">Acct</th>
                    <th className="py-1 text-right">Debit</th>
                    <th className="py-1 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {tb.map(r=> {
                    const debit = r.debit; const credit = r.credit; if (Math.abs(debit)+Math.abs(credit) < 0.001) return null; return (
                      <tr key={r.accountId} className="border-b last:border-0">
                        <td className="py-0.5 pr-2">{r.code} {r.name}</td>
                        <td className="py-0.5 pr-2 text-right text-emerald-600">{debit?fmt(debit):''}</td>
                        <td className="py-0.5 pr-2 text-right text-red-600">{credit?fmt(credit):''}</td>
                      </tr>
                    ); })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Accounting;
