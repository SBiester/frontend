// composables/useStoreCookieSync.js
import { watch, onMounted } from 'vue'

export function useStoreCookieSync(storeObject, cookieName, options = {}) {
  const {
    expires = 3, // Tage
    syncOnMount = true,
    excludeFields = [],
    debounceMs = 100
  } = options

  let debounceTimer = null

  const setCookie = (name, value, days) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  const getCookie = (name) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)))
        } catch (e) {
          console.warn(`Fehler beim Parsen des Cookies ${name}:`, e)
          return null
        }
      }
    }
    return null
  }

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  }

  // Objekt filtern (ausgeschlossene Felder entfernen)
  const filterObject = (obj) => {
    if (excludeFields.length === 0) return obj
    
    const filtered = { ...obj }
    excludeFields.forEach(field => {
      delete filtered[field]
    })
    return filtered
  }

  // Store in Cookie speichern (mit Debouncing)
  const saveToCache = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = setTimeout(() => {
      const dataToSave = filterObject(storeObject.value || storeObject)
      setCookie(cookieName, dataToSave, expires)
      console.log(`Store in Cookie '${cookieName}' gespeichert`)
    }, debounceMs)
  }

  // Cookie-Daten in Store laden
  const loadFromCache = () => {
    const cachedData = getCookie(cookieName)
    if (cachedData && typeof cachedData === 'object') {
      // Store-Objekt aktualisieren, aber bestehende Struktur beibehalten
      Object.keys(cachedData).forEach(key => {
        if (storeObject.value) {
          // Für reactive/ref Objekte
          storeObject.value[key] = cachedData[key]
        } else {
          // Für normale Objekte
          storeObject[key] = cachedData[key]
        }
      })
      console.log(`Store aus Cookie '${cookieName}' geladen`)
      return true
    }
    return false
  }

  // Watcher für automatisches Speichern
  const stopWatcher = watch(
    () => storeObject.value || storeObject,
    () => {
      saveToCache()
    },
    { deep: true }
  )

  // Beim Mount laden (falls gewünscht)
  if (syncOnMount) {
    onMounted(() => {
      loadFromCache()
    })
  }

  // Utility-Funktionen
  const clearCache = () => {
    deleteCookie(cookieName)
    console.log(`Cookie '${cookieName}' gelöscht`)
  }

  const forceSync = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    saveToCache()
  }

  const resetFromCache = () => {
    return loadFromCache()
  }

  return {
    saveToCache: forceSync,
    loadFromCache,
    clearCache,
    resetFromCache,
    stopWatcher
  }
}