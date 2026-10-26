import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Import contacts</h1>
        <p className="mt-1 text-muted">Rem picks up the birthdays and anniversaries already saved in your contacts.</p>
      </div>
      <ImportForm />
      <div className="space-y-2 text-sm text-muted">
        <p className="font-medium text-ink">Where to get the file</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Google Contacts:</b> contacts.google.com → Export → Google CSV or vCard</li>
          <li><b>iPhone / iCloud:</b> icloud.com/contacts → select all → Export vCard</li>
          <li><b>Outlook:</b> People → Manage → Export contacts (CSV)</li>
          <li><b>A spreadsheet:</b> CSV with columns like Name, Email, Phone, Birthday</li>
        </ul>
        <p>People already in Rem (same email or phone) are skipped, so importing twice is safe.</p>
      </div>
    </div>
  );
}
