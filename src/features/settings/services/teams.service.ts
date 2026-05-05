import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Team } from '../types/settings.types';

export const teamsService = {
  async getAll(): Promise<Team[]> {
    const res = await axiosInstance.get(endpoints.settings.teams.list);
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async create(data: { name: string; leader_uid: string; leader_name: string }): Promise<Team> {
    const res = await axiosInstance.post(endpoints.settings.teams.create, data);
    return res.data?.data ?? res.data;
  },

  async update(
    uid: string,
    data: Partial<Pick<Team, 'name' | 'leader_uid' | 'leader_name'>>
  ): Promise<Team> {
    const res = await axiosInstance.put(endpoints.settings.teams.update(uid), data);
    return res.data?.data ?? res.data;
  },

  async addMember(uid: string, userUid: string): Promise<Team> {
    const res = await axiosInstance.post(endpoints.settings.teams.addMember(uid), {
      user_uid: userUid,
    });
    return res.data?.data ?? res.data;
  },

  async removeMember(uid: string, userUid: string): Promise<Team> {
    const res = await axiosInstance.delete(endpoints.settings.teams.removeMember(uid, userUid));
    return res.data?.data ?? res.data;
  },

  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(endpoints.settings.teams.delete(uid));
  },
};
