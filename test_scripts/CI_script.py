import pandas as pd
import numpy as np
from scipy.stats import norm

# 1. Load the CSV, skipping the first 3 metadata rows
df = pd.read_csv('HRD_spike(1000).csv', skiprows=3)

# 2. Keep only rows where '_value' parses as a number
df = df[pd.to_numeric(df['_value'], errors='coerce').notnull()]

# 3. Extract the '_value' column and convert ms → seconds
values_ms = df['_value'].astype(float).iloc[:]
values = values_ms / 1000.0  # now in seconds

# 4. Compute sample statistics
n       = len(values)
mean    = values.mean()
std     = values.std(ddof=1)    # sample standard deviation
dfree   = n - 1                  # degrees of freedom

# 5. Confidence‑interval parameters
alpha   = 0.05                   # for 95% CI
z_score = norm.ppf(1 - alpha/2)  # two‑tailed critical z (~1.96)

# 6. Margin of error and confidence interval
margin   = z_score * (std / np.sqrt(n))
ci_lower = mean - margin
ci_upper = mean + margin

# 7. Print all results (in seconds)
print(f"Sample size (n):               {n}")
print(f"Mean (s):                      {mean:.6f}")
print(f"Sample Std. Dev. (ddof=1, s):  {std:.6f}")
print(f"Degrees of freedom:            {dfree}")
print(f"Alpha:                         {alpha}")
print(f"Critical z-score (two-tailed): {z_score:.4f}")
print(f"95% CI (s):                    [{ci_lower:.6f}, {ci_upper:.6f}]")
