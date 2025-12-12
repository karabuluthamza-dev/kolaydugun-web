
filename = 'src/locales/dictionary.js'

with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
schemas_open = False
for i, line in enumerate(lines):
    line_num = i + 1
    # Remove comments
    line = line.split('//')[0]
    
    for char in line:
        if char == '{':
            balance += 1
            if line_num == 3207:
                schemas_open = True
                print(f"Schemas opened at {line_num}, balance: {balance}")
        elif char == '}':
            balance -= 1
            if schemas_open and balance == 1:
                print(f"Schemas closed at {line_num}, balance: {balance}")
                schemas_open = False
            
    if balance < 0:
        print(f"Error: Negative balance at line {line_num}")
        break
