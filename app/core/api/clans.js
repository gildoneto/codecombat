import fetchJson from './fetch-json'

export const getPublicClans = () => fetchJson(`/db/clan/-/public`)

export const getMyClans = () => fetchJson(`/db/user/${me.id}/clans`)

export const getUserClans = (userId) => fetchJson(`/db/user/${userId}/clans`)

export const getClan = idOrSlug => fetchJson(`/db/clan/${idOrSlug}`)
export const getClanBySchool = ncesId => fetchJson(`/db/clan/school/${ncesId}`)
export const getClanByDistrict = ncesId => fetchJson(`/db/clan/district/${ncesId}`)

export const joinClan = clanId => fetchJson(`/db/clan/${clanId}/join`, {
  method: 'PUT'
})

export const leaveClan = clanId => fetchJson(`/db/clan/${clanId}/leave`, {
  method: 'PUT'
})

export const getChildClanDetails = idOrSlug => fetchJson(`/db/clan/${idOrSlug}/subclans`)

export const getAILeagueStats = clanId => fetchJson(`/db/clan/${clanId}/league-stats`)

export const getTournamentsByClan = clanId => fetchJson(`/db/tournaments?clanId=${clanId}`)
