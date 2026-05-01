import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: "Jan", value: 12000 },
  { month: "Feb", value: 18000 },
  { month: "Mar", value: 25000 },
  { month: "Apr", value: 32000 },
  { month: "May", value: 42000 }
];

export default function RevenueChart() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
      <h3 className="text-lg font-semibold text-white mb-6">Total Raised Over Time</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#ffffff50" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#ffffff50" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value/1000}k`} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#a855f7', fontWeight: 500 }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Raised']}
              cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#a855f7" 
              strokeWidth={3}
              dot={{ fill: '#0b0f19', stroke: '#a855f7', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
