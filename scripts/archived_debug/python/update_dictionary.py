import json
import re

def update_dictionary():
    # 1. Generate the new seating_chart object
    langs = ['en', 'de', 'tr']
    data = {}

    for lang in langs:
        with open(f'public/locales/{lang}/translation.json', 'r', encoding='utf-8') as f:
            content = json.load(f)
            data[lang] = content.get('seating_chart', {})

    all_keys = set()
    for lang in langs:
        all_keys.update(data[lang].keys())

    new_block = "    seating_chart: {\n"
    sorted_keys = sorted(list(all_keys))
    
    for key in sorted_keys:
        new_block += f"        {key}: {{\n"
        for lang in langs:
            val = data[lang].get(key, "")
            val = val.replace('"', '\\"')
            new_block += f'            {lang}: "{val}",\n'
        new_block += "        },\n"
    new_block += "    }" # No trailing comma to be safe, or add it if needed

    # 2. Read dictionary.js
    with open('src/locales/dictionary.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 3. Remove the placeholder line
    # Look for "seating_chart: {}, // Removed to move to top level"
    new_lines = []
    for line in lines:
        if "seating_chart: {}, // Removed to move to top level" in line:
            continue
        new_lines.append(line)
    
    lines = new_lines

    # 4. Replace the existing seating_chart block
    # Find start line
    start_idx = -1
    for i, line in enumerate(lines):
        if line.strip().startswith("seating_chart: {"):
            start_idx = i
            break
    
    if start_idx == -1:
        print("Error: Could not find seating_chart block start")
        return

    # Find end line (matching brace)
    # Since we know it's at the end of the file, we can look for the closing brace before the last };
    # But let's be more robust. Count braces.
    end_idx = -1
    brace_count = 0
    found_start = False
    
    for i in range(start_idx, len(lines)):
        line = lines[i]
        brace_count += line.count('{')
        brace_count -= line.count('}')
        
        if brace_count == 0:
            end_idx = i
            break
    
    if end_idx == -1:
        print("Error: Could not find seating_chart block end")
        return

    print(f"Replacing lines {start_idx+1} to {end_idx+1}")

    # Construct final content
    final_lines = lines[:start_idx]
    final_lines.append(new_block + "\n")
    final_lines.extend(lines[end_idx+1:])

    # 5. Write back
    with open('src/locales/dictionary.js', 'w', encoding='utf-8') as f:
        f.writelines(final_lines)
    
    print("Successfully updated dictionary.js")

if __name__ == "__main__":
    update_dictionary()
