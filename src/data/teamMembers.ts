export interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  expertise: string[];
  capacity: number;
  matchScore: number;
  locationMatch: boolean;
  expertiseMatch: boolean;
  hasCapacity: boolean;
}

export const teamMembers: TeamMember[] = [
  {
    id: "tm1",
    name: "Michael Chen",
    role: "Principle Consultant",
    location: "New York",
    expertise: ["Aviation", "Risk Consulting"],
    capacity: 50,
    matchScore: 100,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
  },
  {
    id: "tm2",
    name: "Sarah Anderson",
    role: "Senior Account Manager",
    location: "New York",
    expertise: ["Aviation", "Risk Consulting"],
    capacity: 65,
    matchScore: 95,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
  },
  {
    id: "tm3",
    name: "Sally Blake",
    role: "Cyber Risk Specialist",
    location: "Chicago",
    expertise: ["Aviation", "Claims", "Cyber Security"],
    capacity: 65,
    matchScore: 80,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: false,
  },
  {
    id: "tm4",
    name: "Jessica Martinez",
    role: "Risk Assessment Manager",
    location: "New York",
    expertise: ["Manufacturing", "Supply Chain"],
    capacity: 63,
    matchScore: 75,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: true,
  },
  {
    id: "tm5",
    name: "Linda Davis",
    role: "Security Consultant",
    location: "Atlanta",
    expertise: ["Aviation", "Property Risk"],
    capacity: 65,
    matchScore: 70,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: false,
  },
  {
    id: "tm6",
    name: "William Brown",
    role: "Business Analyst",
    location: "Charlotte",
    expertise: ["Transportation", "Logistics"],
    capacity: 75,
    matchScore: 66,
    locationMatch: true,
    expertiseMatch: true,
    hasCapacity: false,
  },
];

export const searchTeamMembers = (query: string): TeamMember[] => {
  if (!query) return teamMembers;
  const lowerQuery = query.toLowerCase();
  return teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(lowerQuery) ||
      member.role.toLowerCase().includes(lowerQuery) ||
      member.location.toLowerCase().includes(lowerQuery) ||
      member.expertise.some((exp) => exp.toLowerCase().includes(lowerQuery))
  );
};
