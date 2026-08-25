export type Status = "active" | "paid" | "completed";
export type PaymentCategory = "expense" | "debt" | "asset_debt" | "investment" | "saving";
export type AssetType = "land" | "house" | "car";

export type Income = { id:string; name:string; amount:number; date:string; month?:string; recurringId?:string; actual?:boolean };
export type IncomeRule = { id:string; name:string; amount:number; paymentDay:number; startMonth:string; active:boolean };
export type Debt = {
  id:string; name:string; originalPrincipal:number; currentBalance:number; annualInterestRate:number;
  monthlyPayment:number; paymentDay:number; dueDate?:string; status:Status;
};
export type Asset = {
  id:string; name:string; type:AssetType; value:number; financed:boolean; remainingDebt:number;
  annualInterestRate:number; monthlyPayment:number; paymentDay:number; dueDate?:string; status:Status;
};
export type Investment = { id:string; name:string; investmentDay:number; monthlyTarget:number; totalInvested:number };
export type InvestmentEntry = { id:string; investmentId:string; month:string; amount:number };
export type Expense = { id:string; name:string; plannedAmount:number; paymentDay:number; status:Status };
export type SavingGoal = { id:string; name:string; targetAmount:number; currentAmount:number; monthlyAmount:number; targetDate?:string; paymentDay:number; status:Status };
export type Insurance = { id:string; company:string; insuredName:string; beneficiary:string; lifeCoverage:number; accidentCoverage:number; criticalIllnessCoverage:number; hospitalDailyCoverage:number; medicalCoverage:number; premiumAmount:number; premiumDay:number; other:{name:string;amount:number}[] };
export type Payment = { id:string; sourceId?:string; title:string; category:PaymentCategory; dueDate:string; plannedAmount:number; actualAmount?:number; status:"pending"|"paid"|"overdue"; recurring?:boolean };
export type FinanceState = { incomes:Income[]; incomeRules:IncomeRule[]; closedMonths:string[]; debts:Debt[]; assets:Asset[]; investments:Investment[]; investmentEntries:InvestmentEntry[]; expenses:Expense[]; savings:SavingGoal[]; insurance:Insurance[]; payments:Payment[] };
export const emptyState:FinanceState={incomes:[],incomeRules:[],closedMonths:[],debts:[],assets:[],investments:[],investmentEntries:[],expenses:[],savings:[],insurance:[],payments:[]};
