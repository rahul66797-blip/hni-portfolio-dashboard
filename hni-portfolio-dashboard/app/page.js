import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const COLORS = { GREEN: "#00B050", YELLOW: "#FFC000", RED: "#C00000" };

export default function Dashboard() {
  const [assets, setAssets] = useState([
    { type: "Apartment", name: "Kalyani Nagar Flat", invested: 75000000, current: 105000000, loan: 42000000, income: 336000, emi: 420000, expense: 48000 },
  ]);

  const addRow = () => {
    setAssets([...assets, { type: "Apartment", name: "", invested: 0, current: 0, loan: 0, income: 0, emi: 0, expense: 0 }]);
  };

  const compute = (a) => {
    const net = a.current - a.loan;
    const ret = a.invested === 0 ? 0 : ((a.current - a.invested) / a.invested) * 100;
    const cash = a.income - a.emi - a.expense;

    let status = "YELLOW";
    const leverage = a.loan / (a.current || 1);

    if (net > 0 && ret >= 12 && cash >= 0 && leverage < 0.5) status = "GREEN";
    else if (ret < 6 || cash < 0 || leverage >= 0.8) status = "RED";

    return { ...a, net, ret: ret.toFixed(1), cash, status };
  };

  const enriched = assets.map(compute);

  const totals = enriched.reduce(
    (acc, a) => {
      acc.invested += a.invested;
      acc.current += a.current;
      acc.loan += a.loan;
      acc.cash += a.cash;
      acc.net += a.net;
      return acc;
    },
    { invested: 0, current: 0, loan: 0, cash: 0, net: 0 }
  );

  const riskData = ["GREEN", "YELLOW", "RED"].map((k) => ({ name: k, value: enriched.filter(a => a.status === k).length }));

  const allocation = Object.values(enriched.reduce((acc,a)=>{acc[a.type]=(acc[a.type]||0)+a.net;return acc;},{})).map((v,i)=>({name:Object.keys(enriched.reduce((acc,a)=>{acc[a.type]=(acc[a.type]||0)+1;return acc;},{}))[i],value:v}));

  return (
    <div className="p-6 grid grid-cols-12 gap-6 bg-gray-50 min-h-screen">
      <div className="col-span-8 space-y-4">
        <motion.h1 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="text-3xl font-bold">HNI Portfolio Dashboard</motion.h1>

        <Card>
          <CardContent className="p-4 space-y-3">
            {assets.map((a,i)=>(
              <div key={i} className="grid grid-cols-7 gap-2">
                <Select defaultValue={a.type}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["Apartment","Land","Mutual Fund","Shares","Gold","Silver","Hand Loan"].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Asset Name" />
                <Input placeholder="Invested ₹" type="number" />
                <Input placeholder="Current ₹" type="number" />
                <Input placeholder="Loan ₹" type="number" />
                <Input placeholder="Income ₹" type="number" />
                <Input placeholder="EMI/Expense ₹" type="number" />
              </div>
            ))}
            <Button onClick={addRow} className="mt-2">Add Asset</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <table className="w-full text-sm">
              <thead className="font-semibold">
                <tr><td>Name</td><td>Net ₹</td><td>Return %</td><td>Cash ₹</td><td>Status</td></tr>
              </thead>
              <tbody>
                {enriched.map((a,i)=>(
                  <tr key={i} className="border-t">
                    <td>{a.name}</td>
                    <td>{a.net.toLocaleString()}</td>
                    <td>{a.ret}%</td>
                    <td>{a.cash.toLocaleString()}</td>
                    <td style={{color:COLORS[a.status]}} className="font-bold">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-4 space-y-6">
        <Card><CardContent className="p-4 space-y-1">
          <div>Total Invested ₹ {totals.invested.toLocaleString()}</div>
          <div>Total Value ₹ {totals.current.toLocaleString()}</div>
          <div>Loans ₹ {totals.loan.toLocaleString()}</div>
          <div>Net Worth ₹ {totals.net.toLocaleString()}</div>
          <div className="font-bold">Net Cash ₹ {totals.cash.toLocaleString()}</div>
        </CardContent></Card>

        <Card><CardContent className="p-4 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name">
                {riskData.map((e,i)=>(<Cell key={i} fill={COLORS[e.name]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardContent className="p-4 h-64">
          <ResponsiveContainer>
            <BarChart data={allocation}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value">
                {allocation.map((e,i)=>(<Cell key={i} fill="#8884d8"/>))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    </div>
  );
}
