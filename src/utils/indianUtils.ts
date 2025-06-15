
// Indian market-specific utilities
export const formatIndianCurrency = (amount: number): string => {
  // Format in Indian numbering system (1,23,456)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const formatIndianNumber = (number: number): string => {
  return new Intl.NumberFormat('en-IN').format(number);
};

// GST calculation utilities
export const calculateGST = (amount: number, gstRate: number = 18) => {
  const gstAmount = (amount * gstRate) / 100;
  const totalWithGST = amount + gstAmount;
  return {
    baseAmount: amount,
    gstRate,
    gstAmount,
    totalWithGST
  };
};

export const extractGSTFromTotal = (totalAmount: number, gstRate: number = 18) => {
  const baseAmount = (totalAmount * 100) / (100 + gstRate);
  const gstAmount = totalAmount - baseAmount;
  return {
    baseAmount,
    gstRate,
    gstAmount,
    totalAmount
  };
};

// Indian financial year utilities
export const getIndianFinancialYear = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based
  
  if (month >= 3) { // April onwards
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else { // Jan-March
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};

export const getFinancialYearRange = (fyString?: string) => {
  const currentFY = fyString || getIndianFinancialYear();
  const [startYear] = currentFY.split('-');
  const start = new Date(parseInt(startYear), 3, 1); // April 1st
  const end = new Date(parseInt(startYear) + 1, 2, 31); // March 31st
  
  return { start, end, fyString: currentFY };
};

// Common Indian expense categories
export const INDIAN_EXPENSE_CATEGORIES = [
  'Auto Rickshaw',
  'Tiffin/Lunch',
  'Mobile Recharge',
  'DTH/Cable',
  'Electricity Bill',
  'Gas Cylinder',
  'Domestic Help',
  'Milk/Dairy',
  'Vegetables',
  'Fruits',
  'Tea/Chai',
  'Street Food',
  'Parlour/Salon',
  'Tuition Fees',
  'Meditation/Yoga',
  'Festival Expenses',
  'Puja Items',
  'Gifts & Donations',
  'Train/Bus Fare',
  'Petrol/Diesel',
  'Medicines',
  'Doctor Consultation'
];

export const INDIAN_INCOME_CATEGORIES = [
  'Salary',
  'Diwali Bonus',
  'Festival Bonus',
  'Freelance',
  'Business Income',
  'Rental Income',
  'Fixed Deposit Interest',
  'Dividend',
  'Cash Gifts',
  'Refunds',
  'Side Business'
];

// Indian payment methods
export const INDIAN_PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'NEFT',
  'RTGS',
  'IMPS',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cheque',
  'Demand Draft',
  'Paytm',
  'PhonePe',
  'Google Pay',
  'Amazon Pay',
  'Wallet'
];

// Hindi translations for key labels
export const HINDI_LABELS = {
  'income': 'आय',
  'expense': 'खर्च',
  'balance': 'बैलेंस',
  'total': 'कुल',
  'date': 'तारीख़',
  'amount': 'राशि',
  'category': 'श्रेणी',
  'description': 'विवरण',
  'save': 'सेव करें',
  'cancel': 'रद्द करें',
  'edit': 'संपादित करें',
  'delete': 'हटाएं',
  'add': 'जोड़ें',
  'dashboard': 'डैशबोर्ड',
  'transactions': 'लेन-देन',
  'reports': 'रिपोर्ट्स',
  'budget': 'बजट',
  'monthly': 'मासिक',
  'yearly': 'वार्षिक'
};

// Festival and seasonal categories
export const FESTIVAL_CATEGORIES = [
  'Diwali Expenses',
  'Holi Expenses',
  'Eid Expenses',
  'Christmas Expenses',
  'Dussehra Expenses',
  'Karva Chauth',
  'Raksha Bandhan',
  'Janmashtami',
  'Ganesh Chaturthi',
  'Durga Puja',
  'Wedding Season',
  'Summer Vacation',
  'Monsoon Expenses'
];
