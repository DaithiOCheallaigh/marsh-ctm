export interface Client {
  id: string;
  cnNumber: string;
  name: string;
  industry: string;
  location: string;
  accountOwner: string;
}

// B2B Insurance Industry Client Database
export const clientsDatabase: Client[] = [
  { id: "1", cnNumber: "CN-2024-10001", name: "Westfield Manufacturing Corp", industry: "Manufacturing", location: "New York", accountOwner: "Sarah Mitchell" },
  { id: "2", cnNumber: "CN-2024-10002", name: "Atlantic Logistics Partners", industry: "Transportation & Logistics", location: "Miami", accountOwner: "Michael Rodriguez" },
  { id: "3", cnNumber: "CN-2024-10003", name: "Summit Healthcare Systems", industry: "Healthcare", location: "Boston", accountOwner: "Lisa Park" },
  { id: "4", cnNumber: "CN-2024-10004", name: "Northern Energy Resources", industry: "Oil & Gas", location: "Houston", accountOwner: "William Harper" },
  { id: "5", cnNumber: "CN-2024-10005", name: "Meridian Construction Group", industry: "Construction", location: "Phoenix", accountOwner: "James Wilson" },
  { id: "6", cnNumber: "CN-2024-10006", name: "Pacific Retail Holdings", industry: "Retail", location: "Los Angeles", accountOwner: "Karen Thompson" },
  { id: "7", cnNumber: "CN-2024-10007", name: "Precision Aerospace Inc", industry: "Aerospace & Defense", location: "Seattle", accountOwner: "Robert Chen" },
  { id: "8", cnNumber: "CN-2024-10008", name: "Coastal Financial Services", industry: "Financial Services", location: "Charlotte", accountOwner: "Nicole Stevens" },
  { id: "9", cnNumber: "CN-2024-10009", name: "TechVenture Solutions", industry: "Technology", location: "San Francisco", accountOwner: "David Park" },
  { id: "10", cnNumber: "CN-2024-10010", name: "Heritage Hotels Group", industry: "Hospitality", location: "Las Vegas", accountOwner: "Jennifer Adams" },
  { id: "11", cnNumber: "CN-2024-10011", name: "Greenfield Agriculture Co", industry: "Agriculture", location: "Des Moines", accountOwner: "Thomas Green" },
  { id: "12", cnNumber: "CN-2024-10012", name: "Metro Transit Authority", industry: "Public Transit", location: "Chicago", accountOwner: "Angela Martinez" },
  { id: "13", cnNumber: "CN-2024-10013", name: "Sterling Pharmaceuticals", industry: "Life Sciences", location: "New Jersey", accountOwner: "Dr. Richard Lane" },
  { id: "14", cnNumber: "CN-2024-10014", name: "Pioneer Mining Corp", industry: "Mining", location: "Denver", accountOwner: "Mark Sullivan" },
  { id: "15", cnNumber: "CN-2024-10015", name: "Riverside Power & Utilities", industry: "Utilities", location: "Portland", accountOwner: "Susan Wright" },
  { id: "16", cnNumber: "CN-2024-10016", name: "Continental Food Services", industry: "Food & Beverage", location: "Minneapolis", accountOwner: "Robert Kim" },
  { id: "17", cnNumber: "CN-2024-10017", name: "Global Shipping Lines", industry: "Marine", location: "Long Beach", accountOwner: "Captain James Moore" },
  { id: "18", cnNumber: "CN-2024-10018", name: "Apex Media Holdings", industry: "Media & Entertainment", location: "Los Angeles", accountOwner: "Victoria Hayes" },
  { id: "19", cnNumber: "CN-2024-10019", name: "SafeGuard Security Services", industry: "Professional Services", location: "Dallas", accountOwner: "Marcus Johnson" },
  { id: "20", cnNumber: "CN-2024-10020", name: "Quantum Data Centers", industry: "Technology", location: "Northern Virginia", accountOwner: "Emily Watson" },
  { id: "21", cnNumber: "CN-2024-10021", name: "Regional Healthcare Network", industry: "Healthcare", location: "Cleveland", accountOwner: "Dr. Patricia Brown" },
  { id: "22", cnNumber: "CN-2024-10022", name: "Velocity Transport LLC", industry: "Trucking", location: "Indianapolis", accountOwner: "Brian Adams" },
  { id: "23", cnNumber: "CN-2024-10023", name: "Innovative Chemicals Inc", industry: "Chemicals", location: "Houston", accountOwner: "Dr. Alan Foster" },
  { id: "24", cnNumber: "CN-2024-10024", name: "National Real Estate Partners", industry: "Real Estate", location: "Atlanta", accountOwner: "Michelle Torres" },
  { id: "25", cnNumber: "CN-2024-10025", name: "Elite Aviation Services", industry: "Aviation", location: "Dallas", accountOwner: "Captain Sarah Collins" },
];

export const searchClients = (query: string): Client[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return clientsDatabase.filter(
    (client) =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.cnNumber.toLowerCase().includes(lowerQuery) ||
      client.industry.toLowerCase().includes(lowerQuery)
  );
};
