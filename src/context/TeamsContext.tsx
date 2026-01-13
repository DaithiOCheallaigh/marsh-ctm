import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, TeamRole, teamsData } from '@/data/teams';

interface TeamsContextType {
  teams: Team[];
  getTeamById: (id: string) => Team | undefined;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  addTeam: (team: Omit<Team, 'id'>) => Team;
  deleteTeam: (id: string) => void;
  addRoleToTeam: (teamId: string, role: Omit<TeamRole, 'id'>) => void;
  updateRoleInTeam: (teamId: string, roleId: string, updates: Partial<TeamRole>) => void;
  deleteRoleFromTeam: (teamId: string, roleId: string) => void;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(teamsData);

  const getTeamById = (id: string) => teams.find(team => team.id === id);

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(team => 
      team.id === id ? { ...team, ...updates } : team
    ));
  };

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
    };
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const deleteTeam = (id: string) => {
    setTeams(prev => prev.filter(team => team.id !== id));
  };

  const addRoleToTeam = (teamId: string, role: Omit<TeamRole, 'id'>) => {
    const newRole: TeamRole = {
      ...role,
      id: `role-${Date.now()}`,
    };
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, roles: [...team.roles, newRole] }
        : team
    ));
  };

  const updateRoleInTeam = (teamId: string, roleId: string, updates: Partial<TeamRole>) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { 
            ...team, 
            roles: team.roles.map(role => 
              role.id === roleId ? { ...role, ...updates } : role
            )
          }
        : team
    ));
  };

  const deleteRoleFromTeam = (teamId: string, roleId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, roles: team.roles.filter(role => role.id !== roleId) }
        : team
    ));
  };

  return (
    <TeamsContext.Provider value={{
      teams,
      getTeamById,
      updateTeam,
      addTeam,
      deleteTeam,
      addRoleToTeam,
      updateRoleInTeam,
      deleteRoleFromTeam,
    }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};
