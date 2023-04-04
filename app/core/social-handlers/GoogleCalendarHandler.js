import api from 'core/api'
import CocoClass from 'core/CocoClass'
const SCOPE = 'https://www.googleapis.com/auth/calendar'

const GoogleCalendarAPIHandler = class GoogleCalendarAPIHandler extends CocoClass {
  constructor () {
    if (me.useGoogleCalendar()) {
      application.gplusHandler.loadAPI()
    }
    super()
  }

  loadCalendarsFromAPI () {
    return new Promise((resolve, reject) => {
      const fun = async () => {
        // gapi.client.load('calendar', 'v3', async () => {
          try {
         const r = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
         })
              console.log('r with events.list', r)
              resolve(r.result.items || [])
          } catch(err) {
            console.error('Error in loading calendars from google calendar:', err)
            reject('Error in loading calendars from google calendar')
          }
        // })
      }
      this.requestGoogleAccessToken(fun)
    })
  }
  syncCalendarsToAPI (event) {
    console.log("debgu: sync events to google")
    const convertEvent = (e) => {
      console.log("debug: convert event", e)
      const res = {
        summary: e.name,
        start: {
          dateTime: e.startDate,
          timeZone: 'America/Los_Angeles'
        },
          end: {
            dateTime: e.endDate,
            timeZone: 'America/Los_Angeles'
          },
        recurrence: [
          e.rrule.replace(/DTSTART:.*?\n/, '')
        ],
        // if any of students also has gmail?
        // attendees: [
        // ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      }
      console.log('res:', res)
      return res
    }

    return new Promise((resolve, reject) => {
      const fun = () => {
        // gapi.client.load('calendar', 'v3', () => {
          // console.log('load v3 calendar')
          gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: convertEvent(event)
          }).execute((event) => {
            console.log('get results', event)
            console.log('Event created: ' + event.htmlLink)
            resolve(event)
          })
        // })
      }
      this.requestGoogleAccessToken(fun)
    })
  }

  requestGoogleAccessToken (callback) {
    application.gplusHandler.requestGoogleAuthorization(
      SCOPE,
      callback
    )
  }
}

module.exports = {
  gcApiHandler: new GoogleCalendarAPIHandler(),

  scopes: SCOPE,

  markAsImported: async function (gcId) {
    try {
      const gEvent = me.get('googleCalendarEvents').find((gc) => gc.id === gcId)
      if (gEvent) {
        gEvent.importedToCoco = true
        await new Promise(me.save().then)
      } else {
        return Promise.reject('Event not found in me.googleClanedarEvents')
      }
    } catch (err) {
      console.error('Error in marking google calendar event as imported:', err)
      return Promise.reject('Error in marking event as imported')
    }
  },

  importEvents: async function () {
    try {
      const importedEvents = await this.gcApiHandler.loadCalendarsFromAPI()
      console.log("imported events:", importedEvents)
      const importedEventsNames = importedEvents.map(c => ({ summary: c.summary }))
      const events = me.get('googleCalendarEvents') || []
      let mergedEvents = []
      importedEventsNames.forEach((imported) => {
        const ev = events.find((e) => e.summary === imported.summary)
        mergedEvents.push({ ...ev, ...imported })
      })

      const mergedEventIds = mergedEvents.map((e) => e.id)
      const extraEventsImported = events.filter((e) => (e.importedToCoco && !mergedEventIds.includes(e.id)))

      extraEventsImported.forEach((e) => (e.deletedFromGC = true))
      mergedEvents = mergedEvents.concat(extraEventsImported)

      me.set('googleCalendarEvents', mergedEvents)
      await new Promise(me.save().then)
    } catch (err) {
      console.error('Error in importing google calendar events:', err)
      return Promise.reject('Error in importing events')
    }
  },

  syncEventsToGC: async function (event) {
    try {
      await this.gcApiHandler.syncCalendarsToAPI(event)
      return Promise.resolve('success')
    } catch (e) {
      console.error('Error in syncing event to google calendar:', e)
      return Promise.reject('Error in syncing event to google calendar')
    }
  }
}