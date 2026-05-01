import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: "Tech", value: 40 },
  { name: "Art", value: 25 },
  { name: "Music", value: 20 },
  { name: "Other", value: 15 }
];

const COLORS = ['#a855f7', '#3b82f6', '#06b6d4', '#4b5563'];

export default function CategoryChart() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
      <h3 className="text-lg font-semibold text-white mb-6">Campaign Categories</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#fff', fontWeight: 500 }}
              formatter={(value) => [`${value}%`, 'Share']}
              cursor={false}
            />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
