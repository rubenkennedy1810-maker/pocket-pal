import { useLocalStorage } from './useLocalStorage';
import { Account, Transaction, Loan, Budget, Reminder } from '@/types/finance';

const defaultAccounts: Account[] = [
  { id: '1', name: 'Bank Account', type: 'bank', balance: 0 },
  { id: '2', name: 'FamPay', type: 'fampay', balance: 0, parentId: '1' }
];

export function useFinanceData() {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('finance-accounts', defaultAccounts);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance-transactions', []);
  const [loans, setLoans] = useLocalStorage<Loan[]>('finance-loans', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finance-budgets', []);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('finance-reminders', []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === transaction.accountId) {
        const change = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        return { ...acc, balance: acc.balance + change };
      }
      return acc;
    }));
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      setAccounts(prev => prev.map(acc => {
        if (acc.id === transaction.accountId) {
          const change = transaction.type === 'income' ? -transaction.amount : transaction.amount;
          return { ...acc, balance: acc.balance + change };
        }
        return acc;
      }));
    }
  };

  const addLoan = (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { ...loan, id: crypto.randomUUID() };
    setLoans(prev => [newLoan, ...prev]);
  };

  const toggleLoanSettled = (id: string) => {
    setLoans(prev => prev.map(loan => 
      loan.id === id ? { ...loan, isSettled: !loan.isSettled } : loan
    ));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };

  const setBudget = (month: string, limit: number) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.month === month);
      if (existing) {
        return prev.map(b => b.month === month ? { ...b, limit } : b);
      }
      return [...prev, { id: crypto.randomUUID(), month, limit, alertShown: false }];
    });
  };

  const markBudgetAlertShown = (month: string) => {
    setBudgets(prev => prev.map(b => 
      b.month === month ? { ...b, alertShown: true } : b
    ));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = { ...reminder, id: crypto.randomUUID() };
    setReminders(prev => [newReminder, ...prev]);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminderActive = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, balance: newBalance } : acc
    ));
  };

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCurrentBudget = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return budgets.find(b => b.month === currentMonth);
  };

  const getDailySpending = (date: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.date === date)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return {
    accounts,
    transactions,
    loans,
    budgets,
    reminders,
    addTransaction,
    deleteTransaction,
    addLoan,
    toggleLoanSettled,
    deleteLoan,
    setBudget,
    markBudgetAlertShown,
    addReminder,
    deleteReminder,
    toggleReminderActive,
    updateAccountBalance,
    getCurrentMonthExpenses,
    getCurrentBudget,
    getDailySpending
  };
}
