# 2017 TAX RETURN - GROUND TRUTH VALUES
# Source: TaxDashboard.jsx INITIAL_DATA + Tax Documents

## SUMMARY
- **Tax Year**: 2017
- **Amount Due**: $49,394
- **Tax Preparer**: David Rumsey CPA
- **Filed**: September 15, 2021 (late filing)

## INCOME

### W2 Wages
- **W2 Wages**: $63,132.46
- **Taxes Withheld**: $7,909.36

### Business Income (Schedule C)
1. **CloudBaud LLC** (Software Consulting - 541510)
   - Gross Income: $335,686
   - Net Profit: $334,565.42
   
2. **Comfort Foods (dba Robertos Pizza)** (7712)
   - Net Loss: -$44,581.92

### Rental Income (Schedule E)
1. **Olympic Court**: (Data TBD)
2. **Cherry Crest**: (Data TBD)
3. **Woodridge**: (Data TBD)

## RETIREMENT CONTRIBUTIONS

### IRA Contributions
- **Jishnu Roth IRA**: $5,500.00
- **Deepika ROTH IRA**: $5,500.00
- **SEP IRA**: $5,244.90
- **Child Education Fund**: $4,000.00

### 1099-R Distributions
- **Amount**: (Data from 2018: $4,862.99)

## DEDUCTIONS

### Itemized Deductions

#### Real Estate Interest (Form 1098)
- **Woodridge**: $17,619.67
- **Lake Hills**: (Data TBD)
- **Olympic Court**: (Data TBD)

#### Real Estate Taxes
- **Woodridge**: $5,009.22
- **Cherry Crest**: (Data TBD - started in 2018)
- **Lake Hills**: (Data TBD)
- **Olympic Court**: (Data TBD)
- **Rudins Lounge**: (Data TBD)

## TEST SCENARIOS FOR LLAMA 3.1 vs 3.2

### Scenario 1: W2 Extraction
**Expected Output:**
- W2 Wages: $63,132.46
- Taxes Withheld: $7,909.36

### Scenario 2: Business Income (Schedule C)
**Expected Output:**
- CloudBaud LLC Net Profit: $334,565.42
- Comfort Foods Net Loss: -$44,581.92

### Scenario 3: IRA Contributions
**Expected Output:**
- Jishnu Roth IRA: $5,500.00
- Deepika Roth IRA: $5,500.00
- SEP IRA: $5,244.90

### Scenario 4: Deductions
**Expected Output:**
- Real Estate Interest (Woodridge): $17,619.67
- Real Estate Taxes (Woodridge): $5,009.22

## NOTES
- CloudBaud LLC shows strong profitability in 2017 ($334K)
- Comfort Foods had significant loss (-$44K)
- Total tax due was $49,394 (substantial - likely due to CloudBaud income + late filing penalties)
