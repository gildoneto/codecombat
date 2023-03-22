import fetchJson from './fetch-json'
import _ from 'lodash'

export const getAllEvents = () => fetchJson('/db/events')
export const getEventsByUser = uid => fetchJson(`/db/events?userId=${uid}`)

export const postEvent = (options = {}) => fetchJson('/db/event', _.assign({}, {
  method: 'POST',
  json: options
}))

export const updateEvent = (id, options = {}) => fetchJson(`/db/event/${id}`, _.assign({}, {
  method: 'PUT',
  json: options
}))

export const putEventMember = (id, options = {}) => fetchJson(`/db/event/${id}/member`, _.assign({}, {
  method: 'PUT',
  json: options
}))

export const deleteEventMember = (id, options = {}) => fetchJson(`/db/event/${id}/member`, _.assign({}, {
  method: 'DELETE',
  json: options
}))

// instances

export const getInstances = (id) => fetchJson(`/db/event/${id}/instances`)

export const putInstances = (id, options = {}) => fetchJson(`/db/event.instance/${id}`, _.assign({}, {
  method: 'PUT',
  json: options
}))