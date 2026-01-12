export interface Client {
  id: string;
  cnNumber: string;
  name: string;
}

export const clientsDatabase: Client[] = [
  { id: "1", cnNumber: "CN001234", name: "Acme Corporation" },
  { id: "2", cnNumber: "CN001235", name: "Global Industries Ltd" },
  { id: "3", cnNumber: "CN001236", name: "Tech Solutions Inc" },
  { id: "4", cnNumber: "CN001237", name: "First National Bank" },
  { id: "5", cnNumber: "CN001238", name: "Pacific Manufacturing" },
  { id: "6", cnNumber: "CN001239", name: "Summit Healthcare" },
  { id: "7", cnNumber: "CN001240", name: "Metro Logistics" },
  { id: "8", cnNumber: "CN001241", name: "Continental Airlines" },
  { id: "9", cnNumber: "CN001242", name: "Premier Insurance Group" },
  { id: "10", cnNumber: "CN001243", name: "Riverside Development" },
  { id: "11", cnNumber: "CN001244", name: "Northern Energy Corp" },
  { id: "12", cnNumber: "CN001245", name: "Coastal Properties LLC" },
  { id: "13", cnNumber: "CN001246", name: "Midwest Agriculture Co" },
  { id: "14", cnNumber: "CN001247", name: "Urban Retail Partners" },
  { id: "15", cnNumber: "CN001248", name: "Atlantic Shipping Inc" },
  { id: "16", cnNumber: "CN001249", name: "Mountain Resort Group" },
  { id: "17", cnNumber: "CN001250", name: "Skyline Telecommunications" },
  { id: "18", cnNumber: "CN001251", name: "Heritage Financial Services" },
  { id: "19", cnNumber: "CN001252", name: "Pinnacle Construction" },
  { id: "20", cnNumber: "CN001253", name: "Blue Ocean Fisheries" },
];

export const searchClients = (query: string): Client[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return clientsDatabase.filter(
    (client) =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.cnNumber.toLowerCase().includes(lowerQuery)
  );
};
