import json

def generate_dictionary_entry():
    langs = ['en', 'de', 'tr']
    data = {}

    # Load data
    for lang in langs:
        with open(f'public/locales/{lang}/translation.json', 'r', encoding='utf-8') as f:
            content = json.load(f)
            data[lang] = content.get('seating_chart', {})

    # Merge keys
    all_keys = set()
    for lang in langs:
        all_keys.update(data[lang].keys())

    # Generate JS object string
    output = "    seating_chart: {\n"
    
    sorted_keys = sorted(list(all_keys))
    
    for key in sorted_keys:
        output += f"        {key}: {{\n"
        for lang in langs:
            val = data[lang].get(key, "")
            # Escape quotes
            val = val.replace('"', '\\"')
            output += f'            {lang}: "{val}",\n'
        output += "        },\n"
    
    output += "    },"
    
    print(output)

if __name__ == "__main__":
    generate_dictionary_entry()
