import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  AssignmentTeam, 
  AssignmentTeamMember, 
  teamAssignmentsData,
  WorkdayEmployee,
  masterExpertiseList as initialExpertiseList
} from '@/data/teamAssignments';

interface TeamAssignmentsContextType {
  teams: AssignmentTeam[];
  expertiseList: string[];
  getTeamById: (id: string) => AssignmentTeam | undefined;
  getTeamByName: (name: string) => AssignmentTeam | undefined;
  getMemberById: (teamId: string, memberId: string) => AssignmentTeamMember | undefined;
  updateMember: (teamId: string, memberId: string, updates: Partial<AssignmentTeamMember>) => void;
  addMemberToTeam: (teamId: string, workdayEmployee: WorkdayEmployee, expertise: string[]) => { success: boolean; error?: string };
  addExpertise: (expertise: string) => void;
  isMemberInAnyTeam: (firstName: string, lastName: string) => { inTeam: boolean; teamName?: string };
}

const TeamAssignmentsContext = createContext<TeamAssignmentsContextType | undefined>(undefined);

export const TeamAssignmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<AssignmentTeam[]>(teamAssignmentsData);
  const [expertiseList, setExpertiseList] = useState<string[]>(initialExpertiseList);

  const getTeamById = (id: string) => teams.find(team => team.id === id);
  
  const getTeamByName = (name: string) => teams.find(team => team.teamName.toLowerCase() === name.toLowerCase());

  const getMemberById = (teamId: string, memberId: string) => {
    const team = getTeamById(teamId);
    return team?.members.find(m => m.id === memberId);
  };

  const updateMember = (teamId: string, memberId: string, updates: Partial<AssignmentTeamMember>) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? {
            ...team,
            members: team.members.map(member =>
              member.id === memberId ? { ...member, ...updates } : member
            )
          }
        : team
    ));
  };

  const isMemberInAnyTeam = (firstName: string, lastName: string): { inTeam: boolean; teamName?: string } => {
    for (const team of teams) {
      const existingMember = team.members.find(
        m => m.firstName.toLowerCase() === firstName.toLowerCase() && 
             m.lastName.toLowerCase() === lastName.toLowerCase()
      );
      if (existingMember) {
        return { inTeam: true, teamName: team.teamName };
      }
    }
    return { inTeam: false };
  };

  const addMemberToTeam = (
    teamId: string, 
    workdayEmployee: WorkdayEmployee,
    expertise: string[]
  ): { success: boolean; error?: string } => {
    // Check if member already exists in any team
    const existingCheck = isMemberInAnyTeam(workdayEmployee.firstName, workdayEmployee.lastName);
    if (existingCheck.inTeam) {
      return { 
        success: false, 
        error: `This Team Member is already assigned under a different manager.` 
      };
    }

    const newMember: AssignmentTeamMember = {
      id: `member-${Date.now()}`,
      firstName: workdayEmployee.firstName,
      lastName: workdayEmployee.lastName,
      title: workdayEmployee.title,
      location: workdayEmployee.location,
      startDate: workdayEmployee.startDate,
      expertise,
      workdayManager: workdayEmployee.workdayManager,
      isManualAdd: true,
      clientAssignments: [],
    };

    setTeams(prev => prev.map(team =>
      team.id === teamId
        ? { ...team, members: [...team.members, newMember] }
        : team
    ));

    return { success: true };
  };

  const addExpertise = (expertise: string) => {
    if (!expertiseList.includes(expertise)) {
      setExpertiseList(prev => [...prev, expertise]);
    }
  };

  return (
    <TeamAssignmentsContext.Provider value={{
      teams,
      expertiseList,
      getTeamById,
      getTeamByName,
      getMemberById,
      updateMember,
      addMemberToTeam,
      addExpertise,
      isMemberInAnyTeam,
    }}>
      {children}
    </TeamAssignmentsContext.Provider>
  );
};

export const useTeamAssignments = () => {
  const context = useContext(TeamAssignmentsContext);
  if (!context) {
    throw new Error('useTeamAssignments must be used within a TeamAssignmentsProvider');
  }
  return context;
};
