import { FinanceState, Payment } from "./types";
export const money=(n:number)=>new Intl.NumberFormat("th-TH",{style:"currency",currency:"THB",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
export const monthKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
export const monthRange=(m:string)=>{const [y,mo]=m.split("-").map(Number);const last=new Date(y,mo,0).getDate();return [`${m}-01`,`${m}-${String(last).padStart(2,"0")}`] as const};
export const daysInMonth=(m:string)=>{const [y,mo]=m.split("-").map(Number);return new Date(y,mo,0).getDate()};
export const clampDay=(d:number,m:string)=>Math.min(Math.max(1,d||1),daysInMonth(m));
export const dateFor=(m:string,day:number)=>`${m}-${String(clampDay(day,m)).padStart(2,"0")}`;
export const progress=(start:number,current:number)=>start<=0?0:Math.max(0,Math.min(100,(start-current)/start*100));
export const goalProgress=(current:number,target:number)=>target<=0?0:Math.max(0,Math.min(100,current/target*100));
export const monthlyDebtPayment=(balance:number,rate:number)=>{if(balance<=0)return 0;const r=Math.max(0,rate)/100/12;return r===0?balance:Math.max(balance*r, balance*0.01);};
export function payoffMonths(balance:number,rate:number,payment:number){if(balance<=0)return 0;const r=Math.max(0,rate)/100/12;if(payment<=0)return Infinity;if(r>0&&payment<=balance*r)return Infinity;if(r===0)return Math.ceil(balance/payment);return Math.ceil(-Math.log(1-(balance*r/payment))/Math.log(1+r));}
export function payoffDate(month:string,balance:number,rate:number,payment:number){const n=payoffMonths(balance,rate,payment);if(!Number.isFinite(n))return null;const [y,m]=month.split("-").map(Number);const d=new Date(y,m-1+n,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;}
export function ensureMonthlyPayments(state:FinanceState,month:string):FinanceState{
 const next={...state,payments:[...state.payments]}; const add=(p:Payment)=>{if(!next.payments.some(x=>x.id===p.id))next.payments.push(p)};
 next.debts.forEach(d=>{if(d.status!=="paid"){const id=`debt-${d.id}-${month}`;add({id,sourceId:d.id,title:d.name,category:"debt",dueDate:dateFor(month,d.paymentDay),plannedAmount:d.monthlyPayment>0?d.monthlyPayment:monthlyDebtPayment(d.currentBalance,d.annualInterestRate),status:"pending",recurring:true})}});
 next.assets.filter(a=>a.financed&&a.status!=="paid").forEach(a=>{const id=`asset-${a.id}-${month}`;add({id,sourceId:a.id,title:`ผ่อน${a.name}`,category:"asset_debt",dueDate:dateFor(month,a.paymentDay),plannedAmount:a.monthlyPayment>0?a.monthlyPayment:monthlyDebtPayment(a.remainingDebt,a.annualInterestRate),status:"pending",recurring:true})});
 next.expenses.forEach(e=>{const id=`expense-${e.id}-${month}`;add({id,sourceId:e.id,title:e.name,category:"expense",dueDate:dateFor(month,e.paymentDay),plannedAmount:e.plannedAmount,status:"pending",recurring:true})});
 next.investments.forEach(i=>{const id=`investment-${i.id}-${month}`;add({id,sourceId:i.id,title:`ลงทุน ${i.name}`,category:"investment",dueDate:dateFor(month,i.investmentDay),plannedAmount:i.monthlyTarget,status:"pending",recurring:true})});
 next.savings.forEach(s=>{if(s.status!=="completed"){const id=`saving-${s.id}-${month}`;add({id,sourceId:s.id,title:`เก็บเงิน ${s.name}`,category:"saving",dueDate:dateFor(month,s.paymentDay),plannedAmount:s.monthlyAmount>0?s.monthlyAmount:Math.max(0,s.targetAmount-s.currentAmount),status:"pending",recurring:true})}});
 next.insurance.forEach(i=>{if(i.premiumAmount>0){const id=`insurance-${i.id}-${month}`;add({id,sourceId:i.id,title:`เบี้ยประกัน ${i.company}`,category:"expense",dueDate:dateFor(month,i.premiumDay),plannedAmount:i.premiumAmount,status:"pending",recurring:true})}});
 return next;
}
export function incomeForMonth(state:FinanceState,month:string){
 const actual=state.incomes.filter(x=>(x.month||x.date?.slice(0,7))===month);
 const actualTotal=actual.reduce((s,x)=>s+x.amount,0);
 const forecast=state.incomeRules.filter(r=>r.active&&r.startMonth<=month).reduce((s,r)=>s+r.amount,0);
 return {actual,actualTotal,forecastTotal:forecast,hasActual:actual.length>0};
}
export function totals(state:FinanceState,month:string){const [start,end]=monthRange(month);const p=state.payments.filter(x=>x.dueDate>=start&&x.dueDate<=end);const incomeData=incomeForMonth(state,month);const income=incomeData.actualTotal;const sum=(cat:string,actual=false)=>p.filter(x=>x.category===cat&&(!actual||x.status==="paid")).reduce((s,x)=>s+(actual?(x.actualAmount??x.plannedAmount):x.plannedAmount),0);const assets=state.assets.reduce((s,x)=>s+x.value,0)+state.investments.reduce((s,x)=>s+x.totalInvested,0);const liabilities=state.debts.reduce((s,x)=>s+x.currentBalance,0)+state.assets.reduce((s,x)=>s+(x.financed?x.remainingDebt:0),0);const planned=sum("expense")+sum("debt")+sum("asset_debt")+sum("investment")+sum("saving");const actual=sum("expense",true)+sum("debt",true)+sum("asset_debt",true)+sum("investment",true)+sum("saving",true);return {income,assets,liabilities,netWorth:assets-liabilities,planned,actual,cashFlow:income-actual,plannedCashFlow:income-planned,expense:sum("expense",true),debt:sum("debt",true)+sum("asset_debt",true),investment:sum("investment",true),saving:sum("saving",true),pending:p.filter(x=>x.status!=="paid"),payments:p};}
