import json

# EN translations
en_seating_chart = {
    "title": "Seating Plan",
    "guest_status": "{{assigned}} of {{total}} guests assigned",
    "add_table": "Add Table",
    "add_guest": "Add Guest",
    "tab_tables": "Tables",
    "tab_guests": "Guests",
    "tab_schema": "Layout",
    "tab_spreadsheet": "List View",
    "filter": "Filter",
    "status": "Status",
    "all_tables": "All Tables",
    "empty_tables": "Empty Tables",
    "full_tables": "Full Tables",
    "table_type": "Table Type",
    "all": "All",
    "round": "Round",
    "rectangle": "Rectangle",
    "square": "Square",
    "table": "Table",
    "seat": "seats",
    "seats": "seats",
    "person": "person",
    "no_tables_found": "No tables found matching filters",
    "unassigned_guests_title": "Unassigned Guests",
    "no_unassigned_guests": "All guests have been assigned to tables",
    "welcome_title": "Welcome to Seating Planner",
    "welcome_subtitle": "Let's start by setting up some basic information about your wedding.",
    "total_guests_question": "How many guests are you expecting?",
    "venue_name_question": "What is your venue name?",
    "venue_name_placeholder": "e.g., Grand Hotel Ballroom",
    "table_shape": "Table Shape",
    "table_name": "Table Name",
    "table_name_placeholder": "e.g., Table 1, Family Table",
    "guest_count": "Number of Seats",
    "guest_name": "Guest Name",
    "guest_name_placeholder": "Enter guest name",
    "unassigned": "Unassigned",
    "email_optional": "Email (optional)",
    "phone_optional": "Phone (optional)",
    "plus_ones": "Additional Guests (+1s)",
    "add_guest_error": "Error adding guest",
    "delete_table_error": "Error deleting table",
    "error": "An error occurred",
    "total_guests": "Total Guests",
    "assigned_guests": "Assigned",
    "unassigned_guests": "Unassigned",
    "total_tables": "Total Tables",
    "tables_and_guests": "Tables and Guests",
    "no_guests_assigned": "No guests assigned yet",
    "created_date": "Created",
    "no_data": "No data found",
    "print_save_pdf": "🖨️ Print / Save as PDF",
    "back": "← Back"
}

# Load EN file
with open('c:/Users/ok/Downloads/google/public/locales/en/translation.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Add seating_chart
en_data['seating_chart'] = en_seating_chart

# Save EN file
with open('c:/Users/ok/Downloads/google/public/locales/en/translation.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

print("EN file updated successfully!")
