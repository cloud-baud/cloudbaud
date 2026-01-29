
"""
PYTHON FOR ENGINEERS - INTERVIEW PREP KIT
Target Audience: Engineers & Statisticians
Focus: Efficiency, Data Structures, and "Pythonic" tricks.
"""

import time

def separator(title):
    print(f"\n{'='*20}\n {title} \n{'='*20}")

# ==========================================
# 1. LISTS vs SETS (The "Lookup" Trap)
# ==========================================
# Engineer Note: 
# - Lists are dynamic arrays. Searching is O(n).
# - Sets are Hash Tables. Searching is O(1).
separator("1. SPEED TEST: List vs Set")

# Create a big dataset
big_data = list(range(1_000_000))
target = 999_999

# Test List functions
start = time.time()
exists = target in big_data
print(f"List Search Time: {time.time() - start:.6f} seconds")

# Test Set functions
big_set = set(big_data)
start = time.time()
exists = target in big_set
print(f"Set Search Time:  {time.time() - start:.6f} seconds (The 'Hash Map' magic)")


# ==========================================
# 2. DICTIONARIES (The Hash Map)
# ==========================================
# Interview Classic: "Count frequency of characters/words"
separator("2. FREQUENCY COUNTING (Dicts)")

text = "statisticians love statistics and static statistics"
print(f"Input: '{text}'")

# The "Old School" C++ Way
counts = {}
for word in text.split():
    if word in counts:
        counts[word] += 1
    else:
        counts[word] = 1
print(f"Manual Count: {counts}")

# The "Pythonic" Way (Interviewers love this)
from collections import Counter
counts_pro = Counter(text.split())
print(f"Pro Count:    {dict(counts_pro)}")


# ==========================================
# 3. LIST COMPREHENSIONS (Vector Thinking)
# ==========================================
# Engineer Note: As a stats person, you think in vectors: y = x^2 for all x.
# Python List Comprehensions are exactly that.
separator("3. VECTOR LOOPS (List Comprehensions)")

nums = [1, 2, 3, 4, 5]

# The Loop Way
squared = []
for x in nums:
    squared.append(x**2)

# The Vector Way (One-liner)
squared_pro = [x**2 for x in nums] 

print(f"Original: {nums}")
print(f"Squared:  {squared_pro}")

# You can even filter (Where clause)
# "Square only evens"
evens_squared = [x**2 for x in nums if x % 2 == 0]
print(f"Squared Evens: {evens_squared}")


# ==========================================
# 4. STRING MANIPULATION (Slicing)
# ==========================================
# Python strings are arrays of characters.
# Syntax: string[start : stop : step]
separator("4. STRING SLICING")

s = "EngineersAreCool"
print(f"Original: {s}")
print(f"First 3:  {s[:3]}")      # Eng
print(f"Last 3:   {s[-3:]}")     # ool (Negative index counts from back)
print(f"Reverse:  {s[::-1]}")    # looCerAsreenignE (Step -1 means reverse)


# ==========================================
# 5. GENERATORS (Lazy Evaluation)
# ==========================================
# Engineer Note: If you need to process 1TB of data, you can't load it all into RAM (List).
# Generators act like a pump. They give you one item at a time.
separator("5. MEMORY EFFICIENCY (Generators)")

# Only imaginary construction. Doesn't eat RAM.
# Note the parentheses () instead of brackets []
huge_square_generator = (x**2 for x in range(1000000000000))

print("Created a generator for 1 Trillion numbers. RAM usage: Near Zero.")
print(f"First value: {next(huge_square_generator)}")
print(f"Next value:  {next(huge_square_generator)}")
print("...it waits for you to ask for more.")
