import pandas as pd
import matplotlib.pyplot as plt

file1 = 'tracker_gimbal_log_ok.csv'
df1 = pd.read_csv(file1)
df1 = df1[df1['battery_volt'].notna()]
df1['time'] = pd.to_datetime(df1['ts'], unit='s')
df1 = df1.sort_values('time')

file2 = 'tracker_gimbal_log.csv'
df2 = pd.read_csv(file2)
df2 = df2[df2['battery_volt'].notna()]
df2['time'] = pd.to_datetime(df2['ts'], unit='s')
df2 = df2.sort_values('time')


end_run1 = df1['time'].iloc[-1]
start_run2 = df2['time'].iloc[0]
delta = end_run1 - start_run2

df2['time'] = df2['time'] + delta

df_all = pd.concat([df1, df2], ignore_index=True)
df_all = df_all.sort_values('time')

plt.figure(figsize=(10, 5))
plt.plot(df_all['time'], df_all['battery_volt'], marker='o', markersize=2, linestyle='-')
plt.xlabel('Time')
plt.ylabel('Battery Voltage (V)')
plt.title('Battery Voltage vs Time (Concatenated Runs)')
plt.gcf().autofmt_xdate()
plt.tight_layout()
plt.savefig("batplot.png")
plt.show()
